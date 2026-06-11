import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAppStore } from '../../store/useAppStore';
import {
  Layers,
  Star,
  Search,
  RotateCcw,
  ChevronRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react';
import type { MasteryLevel, Flashcard } from '../../types';
import { getMasteryLabel, calculateMasteryColor } from '../../utils/ai';

const FlashcardsPage = () => {
  const {
    flashcards,
    courses,
    updateFlashcardMastery,
    toggleFlashcardStar,
    getRecommendedFlashcards,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [masteryFilter, setMasteryFilter] = useState<string>('all');
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);

  const recommendedCards = getRecommendedFlashcards();

  const filteredCards = flashcards.filter((card) => {
    if (showOnlyRecommended && !card.isRecommended) return false;
    if (showOnlyStarred && !card.isStarred) return false;
    if (courseFilter !== 'all' && card.courseId !== courseFilter) return false;
    if (masteryFilter !== 'all' && card.masteryLevel !== masteryFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        card.title.toLowerCase().includes(term) ||
        card.front.toLowerCase().includes(term) ||
        card.back.toLowerCase().includes(term) ||
        card.tags.some((t) => t.toLowerCase().includes(term))
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
  };

  return (
    <Layout title="知识卡片">
      <div className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">
              知识卡片
            </h1>
            <p className="text-slate-500">
              共 {flashcards.length} 张卡片，{stats.mastered} 张已掌握
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            创建卡片
          </button>
        </div>

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
                <h3 className="font-semibold text-slate-800">为你推荐复习</h3>
                <p className="text-sm text-slate-500">基于遗忘曲线和掌握程度智能推荐</p>
              </div>
            </div>
            <button
              onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showOnlyRecommended
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {showOnlyRecommended ? '显示全部' : '查看全部推荐'}
            </button>
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
                  <div className={`w-2.5 h-2.5 rounded-full ${calculateMasteryColor(card.masteryLevel)}`} />
                </div>
                <h4 className="font-medium text-slate-800 mb-1 line-clamp-1">
                  {card.title}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {card.front}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索卡片..."
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
                <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${opt.color}`} />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
          {filteredCards.map((card, index) => (
            <div
              key={card.id}
              className="relative h-64 cursor-pointer group"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => toggleFlip(card.id)}
            >
              <div
                className={`absolute inset-0 transition-all duration-500 preserve-3d ${
                  flippedCards.has(card.id) ? 'rotate-y-180' : ''
                }`}
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
                  <div className={`w-3 h-3 rounded-full mb-3 ${calculateMasteryColor(card.masteryLevel)}`} />
                  <h3 className="font-serif font-semibold text-lg text-slate-800 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 flex-1 line-clamp-3">
                    {card.front}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex gap-1 flex-wrap">
                      {card.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full"
                        >
                          {tag}
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
                  <h4 className="font-serif font-semibold text-xl mb-4">{card.title}</h4>
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
                    <span className="text-xs text-white/60">
                      复习 {card.reviewCount} 次
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-16">
            <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">没有找到匹配的卡片</p>
          </div>
        )}
      </div>

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
                  {selectedCard.title}
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
                  <p className="text-slate-700 leading-relaxed">
                    {selectedCard.back}
                  </p>
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">标签：</span>
                {selectedCard.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                  >
                    {tag}
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
    </Layout>
  );
};

export default FlashcardsPage;
