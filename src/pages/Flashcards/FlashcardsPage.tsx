import { useState, useMemo } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAppStore } from '../../store/useAppStore';
import {
  Layers,
  Star,
  Search,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  X,
  MessageSquare,
  BookmarkPlus,
  Filter,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingDown,
  UserCheck,
  BookMarked,
  History,
  Target,
  AlertOctagon,
  FileQuestion,
  CheckSquare,
  Lightbulb,
  Calendar,
  ListChecks,
  Play,
  CheckCircle,
} from 'lucide-react';
import type {
  MasteryLevel,
  Flashcard,
  Question,
  Student,
  RecommendedFlashcard,
  RecommendReason,
  GuidanceRecord,
  GuidanceRecordType,
  ReviewPlan,
  ReviewPlanItem,
} from '../../types';
import { getMasteryLabel, calculateMasteryColor, formatDate } from '../../utils/ai';

type TabType = 'cards' | 'starred' | 'student_review';

const FlashcardsPage = () => {
  const {
    flashcards,
    courses,
    questions,
    updateFlashcardMastery,
    toggleFlashcardStar,
    getRecommendedFlashcards,
    toggleQuestionStar,
    convertQuestionToFlashcard,
    students,
    guidanceRecords,
    getStudentRecommendations,
    markStudentReviewComplete,
    reviewPlans,
    generateWeeklyPlan,
    completePlanItem,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [masteryFilter, setMasteryFilter] = useState<string>('all');
  const [kpFilter, setKpFilter] = useState<string>('all');
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [convertSuccess, setConvertSuccess] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentCourseFilter, setStudentCourseFilter] = useState<string>('all');
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(new Set());

  const recommendedCards = getRecommendedFlashcards();
  const starredQuestions = questions.filter((q) => q.isStarred && !q.isBlocked);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  const studentCourses = useMemo(() => {
    if (!selectedStudent) return courses;
    return courses.filter((c) => selectedStudent.courseIds.includes(c.id));
  }, [selectedStudent, courses]);

  const studentRecommendations = useMemo(() => {
    if (!selectedStudentId) return [];
    const courseId = studentCourseFilter !== 'all' ? studentCourseFilter : undefined;
    return getStudentRecommendations(selectedStudentId, courseId);
  }, [selectedStudentId, studentCourseFilter, getStudentRecommendations]);

  const studentGuidanceRecords = useMemo(() => {
    if (!selectedStudentId) return [];
    return guidanceRecords
      .filter((r) => r.studentId === selectedStudentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [guidanceRecords, selectedStudentId]);

  const currentPlan = useMemo<ReviewPlan | undefined>(
    () => reviewPlans.find((p) => p.studentId === selectedStudentId),
    [reviewPlans, selectedStudentId]
  );

  const groupedPlanItems = useMemo(() => {
    if (!currentPlan) return [];
    const map = new Map<string, { courseName: string; items: ReviewPlanItem[] }>();
    currentPlan.items.forEach((item) => {
      const group = map.get(item.courseId) || { courseName: item.courseName, items: [] };
      group.items.push(item);
      map.set(item.courseId, group);
    });
    return Array.from(map.entries()).map(([courseId, group]) => ({ courseId, ...group }));
  }, [currentPlan]);

  const getDeadlineStyle = (deadline: string) => {
    const daysLeft = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft <= 1) return { color: 'text-red-600', bg: 'bg-red-50', label: '紧迫' };
    if (daysLeft <= 3) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: '一般' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: '充裕' };
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 3) return { label: '高', color: 'text-red-600', bg: 'bg-red-50' };
    if (priority >= 2) return { label: '中', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: '低', color: 'text-slate-500', bg: 'bg-slate-50' };
  };

  const recommendReasonConfig: Record<RecommendReason, { label: string; desc: string; color: string; bgColor: string; borderColor: string; icon: any }> = {
    weak_point: {
      label: '薄弱点',
      desc: '该学生此知识点薄弱',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertOctagon,
    },
    recent_question: {
      label: '最近追问',
      desc: '该学生最近问过相关问题',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: MessageSquare,
    },
    homework_mistake: {
      label: '作业错点',
      desc: '作业中此知识点答错',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: FileQuestion,
    },
    forgotten: {
      label: '遗忘提醒',
      desc: '超过7天未复习，可能已遗忘',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      icon: Clock,
    },
  };

  const guidanceTypeConfig: Record<GuidanceRecordType, { label: string; icon: any; color: string; bgColor: string }> = {
    review: {
      label: '复习完成',
      icon: CheckSquare,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    qa_help: {
      label: '问答辅导',
      icon: MessageSquare,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    homework_comment: {
      label: '作业批改',
      icon: BookMarked,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    one_on_one: {
      label: '一对一',
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  };

  const allKnowledgePoints = useMemo(() => {
    const kps = new Set<string>();
    flashcards.forEach((c) => c.knowledgePoints.forEach((kp) => kps.add(kp)));
    starredQuestions.forEach((q) => q.knowledgePoints.forEach((kp) => kps.add(kp)));
    return Array.from(kps);
  }, [flashcards, starredQuestions]);

  const filteredCards = flashcards.filter((card) => {
    if (showOnlyStarred && !card.isStarred) return false;
    if (courseFilter !== 'all' && card.courseId !== courseFilter) return false;
    if (masteryFilter !== 'all' && card.masteryLevel !== masteryFilter) return false;
    if (kpFilter !== 'all' && !card.knowledgePoints.includes(kpFilter)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        card.front.toLowerCase().includes(term) ||
        card.back.toLowerCase().includes(term) ||
        card.knowledgePoints.some((t) => t.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const filteredStarredQuestions = starredQuestions.filter((q) => {
    if (courseFilter !== 'all' && q.courseId !== courseFilter) return false;
    if (kpFilter !== 'all' && !q.knowledgePoints.includes(kpFilter)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        q.content.toLowerCase().includes(term) ||
        q.studentName.toLowerCase().includes(term) ||
        q.tags.some((t) => t.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const toggleFlip = (cardId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleConvertQuestion = (questionId: string) => {
    const result = convertQuestionToFlashcard(questionId);
    if (result) {
      setConvertSuccess(true);
      setTimeout(() => setConvertSuccess(false), 2000);
    }
  };

  const handleStudentReview = (flashcardId: string, masteryLevel: MasteryLevel) => {
    if (!selectedStudentId) return;
    markStudentReviewComplete(selectedStudentId, flashcardId, masteryLevel);
    setCompletedReviews((prev) => new Set(prev).add(flashcardId));
  };

  const masteryOptions: { value: MasteryLevel | 'all'; label: string; color: string }[] = [
    { value: 'all', label: '全部', color: 'bg-slate-500' },
    { value: 'mastered', label: '已掌握', color: 'bg-success-500' },
    { value: 'learning', label: '学习中', color: 'bg-primary-500' },
    { value: 'weak', label: '较薄弱', color: 'bg-warning-500' },
    { value: 'not_started', label: '未学习', color: 'bg-slate-300' },
  ];

  const stats = {
    total: flashcards.length,
    mastered: flashcards.filter((f) => f.masteryLevel === 'mastered').length,
    learning: flashcards.filter((f) => f.masteryLevel === 'learning').length,
    weak: flashcards.filter((f) => f.masteryLevel === 'weak').length,
    starred: starredQuestions.length,
    students: students.length,
  };

  const weakCards = flashcards.filter((f) => f.masteryLevel === 'weak');

  return (
    <Layout title="知识卡片">
      <div className="animate-slide-up relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">知识卡片</h1>
            <p className="text-slate-500">
              共 {flashcards.length} 张卡片，{stats.mastered} 张已掌握，{stats.starred} 条优秀问答
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            创建卡片
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { key: 'cards', label: '知识卡片', icon: Layers, count: stats.total },
            { key: 'starred', label: '优秀问答库', icon: Star, count: stats.starred },
            { key: 'student_review', label: '学生复习', icon: UserCheck, count: stats.students },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'cards' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    <p className="text-sm text-slate-500">总卡片数</p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success-600">{stats.mastered}</p>
                    <p className="text-sm text-slate-500">已掌握</p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{stats.learning}</p>
                    <p className="text-sm text-slate-500">学习中</p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning-600">{stats.weak}</p>
                    <p className="text-sm text-slate-500">较薄弱</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-2xl p-6 mb-6 border border-accent-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">智能推荐复习</h3>
                    <p className="text-sm text-slate-500">基于薄弱点和遗忘曲线智能推荐</p>
                  </div>
                </div>
                {weakCards.length > 0 && (
                  <div className="flex items-center gap-1 text-xs bg-warning-100 text-warning-700 px-3 py-1.5 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{weakCards.length} 个薄弱点需加强</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedCards.slice(0, 3).map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-slate-400">{card.courseName}</span>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${calculateMasteryColor(
                          card.masteryLevel
                        )}`}
                      />
                    </div>
                    <h4 className="font-medium text-slate-800 mb-1 line-clamp-1">
                      {card.knowledgePoints[0] || '知识点'}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{card.front}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'cards' ? '搜索卡片...' : '搜索优秀问答...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-all duration-200 shadow-sm"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部课程</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <select
            value={kpFilter}
            onChange={(e) => setKpFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部知识点</option>
            {allKnowledgePoints.map((kp) => (
              <option key={kp} value={kp}>
                {kp}
              </option>
            ))}
          </select>

          {activeTab === 'cards' && (
            <>
              <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
                {masteryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMasteryFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      masteryFilter === opt.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full inline-block mr-1.5 ${opt.color}`}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowOnlyStarred(!showOnlyStarred)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  showOnlyStarred
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    showOnlyStarred ? 'fill-accent-500 text-accent-500' : ''
                  }`}
                />
                收藏
              </button>
            </>
          )}
        </div>

        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
            {filteredCards.map((card, index) => (
              <div
                key={card.id}
                className="relative h-64 cursor-pointer group"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => toggleFlip(card.id)}
              >
                <div
                  className={`absolute inset-0 transition-all duration-500 preserve-3d`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flippedCards.has(card.id)
                      ? 'rotateY(180deg)'
                      : 'rotateY(0deg)',
                  }}
                >
                  <div
                    className="absolute inset-0 card card-hover p-5 flex flex-col"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs text-slate-400">{card.courseName}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlashcardStar(card.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            card.isStarred
                              ? 'fill-accent-500 text-accent-500'
                              : 'text-slate-300 hover:text-accent-400'
                          }`}
                        />
                      </button>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full mb-3 ${calculateMasteryColor(
                        card.masteryLevel
                      )}`}
                    />
                    <h3 className="font-serif font-semibold text-lg text-slate-800 mb-2">
                      {card.knowledgePoints[0] || '知识卡片'}
                    </h3>
                    <p className="text-slate-600 flex-1 line-clamp-3">{card.front}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex gap-1 flex-wrap">
                        {card.knowledgePoints.slice(0, 2).map((kp) => (
                          <span
                            key={kp}
                            className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full"
                          >
                            {kp}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        点击翻转
                      </span>
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 card card-hover p-5 flex flex-col bg-gradient-to-br from-primary-700 to-primary-900 text-white"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-white/80">答案</span>
                      <span className="badge bg-white/20 text-white text-xs">
                        {getMasteryLabel(card.masteryLevel)}
                      </span>
                    </div>
                    <h4 className="font-serif font-semibold text-xl mb-4">
                      {card.knowledgePoints[0]}
                    </h4>
                    <p className="text-white/90 flex-1 leading-relaxed overflow-y-auto scrollbar-thin">
                      {card.back}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/20 mt-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateFlashcardMastery(card.id, 'weak');
                          }}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                        >
                          没记住
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateFlashcardMastery(card.id, 'learning');
                          }}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                        >
                          模糊
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateFlashcardMastery(card.id, 'mastered');
                          }}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                        >
                          记住了
                        </button>
                      </div>
                      <span className="text-xs text-white/60">复习 {card.reviewCount} 次</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'starred' && (
          <div className="space-y-4 animate-stagger">
            {filteredStarredQuestions.map((q, index) => (
              <div
                key={q.id}
                className="card p-5 hover:shadow-card-hover transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {q.studentName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{q.studentName}</p>
                      <p className="text-xs text-slate-500">{q.courseName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{formatDate(q.createdAt)}</span>
                    <Star className="w-4 h-4 text-accent-500 fill-accent-500" />
                  </div>
                </div>
                <p className="text-slate-700 mb-3">{q.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {q.knowledgePoints.map((kp) => (
                      <span
                        key={kp}
                        className="px-2.5 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full"
                      >
                        {kp}
                      </span>
                    ))}
                    {q.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedQuestion(q)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      查看详情
                    </button>
                    <button
                      onClick={() => handleConvertQuestion(q.id)}
                      className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      转卡片
                    </button>
                    <button
                      onClick={() => toggleQuestionStar(q.id)}
                      className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      移出
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'student_review' && (
          <div className="space-y-6 animate-stagger">
            <div className="card p-5">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary-600" />
                    选择学生
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      setStudentCourseFilter('all');
                      setCompletedReviews(new Set());
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">请选择学生</option>
                    {students.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.name}（参与 {stu.courseIds.length} 门课程）
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-accent-600" />
                    课程筛选
                  </label>
                  <select
                    value={studentCourseFilter}
                    onChange={(e) => setStudentCourseFilter(e.target.value)}
                    disabled={!selectedStudentId}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="all">全部课程</option>
                    {studentCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {!selectedStudentId ? (
              <div className="text-center py-16 card">
                <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">请先选择一名学生</p>
                <p className="text-sm text-slate-400 mt-1">选择学生后将显示该学生的个性化复习队列</p>
              </div>
            ) : (
              <>
                {!currentPlan ? (
                  <div className="card p-6 text-center">
                    <Calendar className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium mb-2">该学生暂无一周复习计划</p>
                    <p className="text-sm text-slate-400 mb-4">点击下方按钮，为该学生智能生成一周复习计划</p>
                    <button
                      onClick={() => generateWeeklyPlan(selectedStudentId)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      生成一周复习计划
                    </button>
                  </div>
                ) : (
                  <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center">
                          <ListChecks className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">一周复习计划</h3>
                          <p className="text-sm text-slate-500">
                            {currentPlan.weekStart} ~ {currentPlan.weekEnd}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">
                          {Math.round((currentPlan.completedCount / currentPlan.totalCount) * 100)}%
                        </p>
                        <p className="text-xs text-slate-400">
                          {currentPlan.completedCount}/{currentPlan.totalCount} 已完成
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-5">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${(currentPlan.completedCount / currentPlan.totalCount) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="space-y-5">
                      {groupedPlanItems.map((group) => (
                        <div key={group.courseId}>
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary-500" />
                            {group.courseName}
                            <span className="text-xs text-slate-400 font-normal">
                              ({group.items.length} 张卡片)
                            </span>
                          </h4>
                          <div className="space-y-2.5">
                            {group.items.map((item) => {
                              const deadlineStyle = getDeadlineStyle(item.deadline);
                              const priorityCfg = getPriorityLabel(item.priority);
                              return (
                                <div
                                  key={item.id}
                                  className={`rounded-xl p-4 border transition-all ${
                                    item.completed
                                      ? 'bg-success-50 border-success-200'
                                      : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-slate-800 text-sm">
                                        {item.knowledgePoint}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}
                                      >
                                        {priorityCfg.label}优先
                                      </span>
                                      {!item.completed && (
                                        <span
                                          className={`px-2 py-0.5 text-xs rounded-full ${deadlineStyle.bg} ${deadlineStyle.color}`}
                                        >
                                          {deadlineStyle.label} · {item.deadline}
                                        </span>
                                      )}
                                    </div>
                                    {item.completed && (
                                      <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                                    )}
                                  </div>

                                  {item.completed ? (
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                      <span
                                        className={`px-2 py-0.5 rounded-full ${
                                          item.masteryLevel === 'mastered'
                                            ? 'bg-success-100 text-success-700'
                                            : item.masteryLevel === 'learning'
                                              ? 'bg-primary-100 text-primary-700'
                                              : 'bg-warning-100 text-warning-700'
                                        }`}
                                      >
                                        {item.masteryLevel === 'mastered'
                                          ? '记住了'
                                          : item.masteryLevel === 'learning'
                                            ? '模糊'
                                            : '没记住'}
                                      </span>
                                      <span>完成于 {item.completedAt}</span>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() =>
                                          completePlanItem(currentPlan.id, item.id, 'weak')
                                        }
                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200"
                                      >
                                        没记住
                                      </button>
                                      <button
                                        onClick={() =>
                                          completePlanItem(currentPlan.id, item.id, 'learning')
                                        }
                                        className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 text-sm font-medium rounded-lg transition-colors border border-yellow-200"
                                      >
                                        模糊
                                      </button>
                                      <button
                                        onClick={() =>
                                          completePlanItem(currentPlan.id, item.id, 'mastered')
                                        }
                                        className="px-3 py-1.5 bg-success-50 hover:bg-success-100 text-success-600 text-sm font-medium rounded-lg transition-colors border border-success-200"
                                      >
                                        记住了
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {currentPlan.completedCount === currentPlan.totalCount && (
                      <div className="mt-5 text-center py-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200/50">
                        <p className="text-lg font-semibold text-slate-800">
                          🎉 一周复习计划已全部完成！
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-medium">
                        {selectedStudent?.name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-accent-500" />
                          推荐复习队列
                        </h3>
                        <p className="text-sm text-slate-500">
                          共 {studentRecommendations.length} 张推荐卡片
                          {completedReviews.size > 0 && `，已完成 ${completedReviews.size} 张`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {studentRecommendations.length === 0 ? (
                    <div className="text-center py-12 card">
                      <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">暂无推荐复习内容</p>
                      <p className="text-sm text-slate-400 mt-1">该学生在当前条件下没有需要复习的卡片</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {studentRecommendations.map((rec, index) => {
                        const card = rec.flashcard;
                        const isCompleted = completedReviews.has(card.id);
                        return (
                          <div
                            key={card.id}
                            style={{ animationDelay: `${index * 0.05}s` }}
                            className={`card p-5 transition-all ${
                              isCompleted ? 'bg-success-50 border-success-200' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <span className="text-xs text-slate-400">{card.courseName}</span>
                                {isCompleted && (
                                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    已完成
                                  </span>
                                )}
                              </div>
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${calculateMasteryColor(
                                  card.masteryLevel
                                )}`}
                              />
                            </div>

                            <h4 className="font-serif font-semibold text-lg text-slate-800 mb-2">
                              {card.knowledgePoints[0] || '知识点'}
                            </h4>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-3">{card.front}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {rec.reasons.map((reason) => {
                                const cfg = recommendReasonConfig[reason];
                                const ReasonIcon = cfg.icon;
                                return (
                                  <div
                                    key={reason}
                                    className={`flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg border ${cfg.bgColor} ${cfg.borderColor}`}
                                  >
                                    <ReasonIcon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                                    <div>
                                      <span className={`text-xs font-medium ${cfg.color}`}>
                                        {cfg.label}
                                      </span>
                                      <p className={`text-[11px] ${cfg.color} opacity-80 mt-0.5`}>
                                        {cfg.desc}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className={`flex gap-2 ${isCompleted ? 'opacity-50 pointer-events-none' : ''}`}>
                              <button
                                onClick={() => handleStudentReview(card.id, 'weak')}
                                disabled={isCompleted}
                                className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200 disabled:cursor-not-allowed"
                              >
                                没记住
                              </button>
                              <button
                                onClick={() => handleStudentReview(card.id, 'learning')}
                                disabled={isCompleted}
                                className="flex-1 py-2 px-3 bg-warning-50 hover:bg-warning-100 text-warning-600 text-sm font-medium rounded-lg transition-colors border border-warning-200 disabled:cursor-not-allowed"
                              >
                                模糊
                              </button>
                              <button
                                onClick={() => handleStudentReview(card.id, 'mastered')}
                                disabled={isCompleted}
                                className="flex-1 py-2 px-3 bg-success-50 hover:bg-success-100 text-success-600 text-sm font-medium rounded-lg transition-colors border border-success-200 disabled:cursor-not-allowed"
                              >
                                记住了
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">该学生辅导记录</h3>
                      <p className="text-sm text-slate-500">
                        共 {studentGuidanceRecords.length} 条记录，按时间倒序排列
                      </p>
                    </div>
                  </div>

                  {studentGuidanceRecords.length === 0 ? (
                    <div className="text-center py-12 card">
                      <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">暂无辅导记录</p>
                    </div>
                  ) : (
                    <div className="card p-5">
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                        <div className="space-y-6">
                          {studentGuidanceRecords.map((record) => {
                            const typeCfg = guidanceTypeConfig[record.type];
                            const TypeIcon = typeCfg.icon;
                            return (
                              <div key={record.id} className="relative pl-12">
                                <div
                                  className={`absolute left-0 w-8 h-8 rounded-full ${typeCfg.bgColor} flex items-center justify-center ring-4 ring-white`}
                                >
                                  <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeCfg.bgColor} ${typeCfg.color}`}
                                      >
                                        {typeCfg.label}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {record.courseName}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {record.createdAt}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-700">{record.content}</p>
                                  <p className="text-xs text-slate-400 mt-2">
                                    操作人：{record.createdBy}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'cards' && filteredCards.length === 0 && (
          <div className="text-center py-16">
            <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">没有找到匹配的卡片</p>
          </div>
        )}

        {activeTab === 'starred' && filteredStarredQuestions.length === 0 && (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无优秀问答</p>
            <p className="text-sm text-slate-400 mt-1">从提问广场收藏优质问答到这里</p>
          </div>
        )}

        {selectedCard && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedCard(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <span className="text-sm text-slate-500 mb-1 block">
                    {selectedCard.courseName}
                  </span>
                  <h3 className="text-xl font-serif font-semibold text-slate-800">
                    {selectedCard.knowledgePoints[0] || '知识卡片'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">问题</h4>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-slate-700">{selectedCard.front}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">答案</h4>
                  <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                    <p className="text-slate-700 leading-relaxed">{selectedCard.back}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">掌握程度</h4>
                  <div className="flex gap-2">
                    {masteryOptions.slice(1).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          updateFlashcardMastery(selectedCard.id, opt.value as MasteryLevel);
                          setSelectedCard({
                            ...selectedCard,
                            masteryLevel: opt.value as MasteryLevel,
                          });
                        }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedCard.masteryLevel === opt.value
                            ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full inline-block mr-1.5 ${opt.color}`}
                        />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-500">知识点：</span>
                  {selectedCard.knowledgePoints.map((kp) => (
                    <span
                      key={kp}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                    >
                      {kp}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => toggleFlashcardStar(selectedCard.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCard.isStarred
                      ? 'text-accent-600 bg-accent-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      selectedCard.isStarred ? 'fill-accent-500' : ''
                    }`}
                  />
                  {selectedCard.isStarred ? '已收藏' : '收藏'}
                </button>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>复习 {selectedCard.reviewCount} 次</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedQuestion && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedQuestion(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-slide-up flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedQuestion.studentName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {selectedQuestion.studentName}
                    </h3>
                    <p className="text-sm text-slate-500">{selectedQuestion.courseName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedQuestion.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === 'teacher' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'student'
                          ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                          : msg.role === 'ai'
                            ? 'bg-gradient-to-br from-accent-400 to-accent-600'
                            : 'bg-gradient-to-br from-primary-500 to-primary-700'
                      }`}
                    >
                      {msg.role === 'student' ? (
                        <span className="text-white text-xs">学员</span>
                      ) : msg.role === 'ai' ? (
                        <Sparkles className="w-5 h-5 text-white" />
                      ) : (
                        <Award className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] ${
                        msg.role === 'teacher' ? 'text-right' : ''
                      }`}
                    >
                      <p className="text-xs text-slate-500 mb-1">
                        {msg.role === 'student'
                          ? '学员'
                          : msg.role === 'ai'
                            ? 'AI 助教'
                            : msg.authorName || '老师'}
                        <span className="ml-2">{formatDate(msg.createdAt)}</span>
                      </p>
                      <div
                        className={`p-4 rounded-xl ${
                          msg.role === 'teacher'
                            ? 'bg-primary-600 text-white'
                            : msg.role === 'ai'
                              ? 'bg-white border border-slate-200'
                              : 'bg-slate-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-slate-200 flex justify-between items-center">
                <div className="flex gap-1.5 flex-wrap">
                  {selectedQuestion.knowledgePoints.map((kp) => (
                    <span
                      key={kp}
                      className="px-2.5 py-1 bg-primary-50 text-primary-600 text-xs rounded-full"
                    >
                      {kp}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    handleConvertQuestion(selectedQuestion.id);
                    setSelectedQuestion(null);
                  }}
                  className="btn-accent flex items-center gap-2 text-sm"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  转为知识卡片
                </button>
              </div>
            </div>
          </div>
        )}

        {convertSuccess && (
          <div className="fixed bottom-6 right-6 bg-success-500 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-2 z-50">
            <CheckCircle2 className="w-5 h-5" />
            已成功转为知识卡片！
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FlashcardsPage;
