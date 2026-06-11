import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAppStore } from '../../store/useAppStore';
import { getStatusLabel, getStatusColor, formatDate } from '../../utils/ai';
import {
  MessageSquare,
  Search,
  Filter,
  Star,
  Shield,
  ShieldOff,
  RotateCcw,
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import type { AnswerTone } from '../../types';

const QuestionsPage = () => {
  const {
    questions,
    settings,
    setAnswerTone,
    addQuestionAnswer,
    transferQuestion,
    blockQuestion,
    unblockQuestion,
    starQuestion,
    generateAIAnswerForQuestion,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showToneSelector, setShowToneSelector] = useState(false);

  const toneOptions: { value: AnswerTone; label: string; desc: string }[] = [
    { value: 'formal', label: '正式', desc: '专业严谨' },
    { value: 'friendly', label: '友好', desc: '亲切自然' },
    { value: 'encouraging', label: '鼓励', desc: '积极鼓励' },
  ];

  const filteredQuestions = questions.filter((q) => {
    if (settings.contentFilterEnabled && q.isBlocked) return false;
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (courseFilter !== 'all' && q.courseId !== courseFilter) return false;
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

  const courses = [...new Set(questions.map((q) => q.courseName))];

  const handleGenerateAI = (questionId: string) => {
    generateAIAnswerForQuestion(questionId);
  };

  const handleReply = (questionId: string) => {
    if (replyContent.trim()) {
      addQuestionAnswer(
        questionId,
        replyContent.trim(),
        false,
        settings.teacherName
      );
      setReplyContent('');
    }
  };

  return (
    <Layout title="提问广场">
      <div className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">
              提问广场
            </h1>
            <p className="text-slate-500">
              共 {questions.length} 个问题，{questions.filter(q => q.status === 'pending').length} 个待处理
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setShowToneSelector(!showToneSelector)}
                className="btn-secondary flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-accent-500" />
                回答语气：
                {toneOptions.find((t) => t.value === settings.answerTone)?.label}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showToneSelector && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-slate-100 p-2 z-10 animate-slide-down">
                  {toneOptions.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => {
                        setAnswerTone(tone.value);
                        setShowToneSelector(false);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        settings.answerTone === tone.value
                          ? 'bg-primary-50 text-primary-700'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-medium">{tone.label}</p>
                      <p className="text-xs text-slate-500">{tone.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索问题、学员或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <Filter className="w-5 h-5 text-slate-400 self-center" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部状态</option>
              <option value="pending">待回答</option>
              <option value="ai_answered">AI 已回答</option>
              <option value="teacher_answered">老师已回复</option>
              <option value="transferred">转老师处理</option>
              <option value="blocked">已屏蔽</option>
            </select>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部课程</option>
              {questions.map((q) => (
                <option key={q.courseId} value={q.courseId}>
                  {q.courseName}
                </option>
              )).filter((v, i, a) => a.findIndex(t => t.key === v.key) === i)}
            </select>
          </div>
        </div>

        <div className="space-y-4 animate-stagger">
          {filteredQuestions.map((question, index) => (
            <div
              key={question.id}
              className={`card overflow-hidden transition-all duration-300 ${
                expandedId === question.id ? 'ring-2 ring-primary-500/20' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpandedId(expandedId === question.id ? null : question.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                    {question.studentName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-slate-800">
                        {question.studentName}
                      </span>
                      <span className={`badge ${getStatusColor(question.status)}`}>
                        {getStatusLabel(question.status)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(question.createdAt)}
                      </span>
                      {question.isStarred && (
                        <Star className="w-4 h-4 text-accent-500 fill-accent-500" />
                      )}
                    </div>
                    <p className="text-slate-700 mb-3 line-clamp-2">
                      {question.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{question.answers.length} 回复</span>
                        </div>
                        {question.followUpCount > 0 && (
                          <span className="text-accent-600">
                            {question.followUpCount} 次追问
                          </span>
                        )}
                        {expandedId === question.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {expandedId === question.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5 animate-fade-in">
                  <div className="space-y-4 mb-5">
                    {question.answers.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>暂无回答</p>
                      </div>
                    ) : (
                      question.answers.map((answer) => (
                        <div
                          key={answer.id}
                          className={`flex gap-3 ${
                            answer.isAI ? '' : 'flex-row-reverse'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                              answer.isAI
                                ? 'bg-gradient-to-br from-accent-400 to-accent-600'
                                : 'bg-gradient-to-br from-primary-500 to-primary-700'
                            }`}
                          >
                            {answer.isAI ? (
                              <Bot className="w-5 h-5 text-white" />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div
                            className={`max-w-[80%] ${
                              answer.isAI ? '' : 'text-right'
                            }`}
                          >
                            <p className="text-xs text-slate-500 mb-1">
                              {answer.isAI
                                ? 'AI 助教'
                                : answer.authorName || '老师'}
                              <span className="ml-2">
                                {formatDate(answer.createdAt)}
                              </span>
                            </p>
                            <div
                              className={`p-4 rounded-xl ${
                                answer.isAI
                                  ? 'bg-white border border-slate-200'
                                  : 'bg-primary-600 text-white'
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {answer.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap border-t border-slate-200 pt-4">
                    <button
                      onClick={() => handleGenerateAI(question.id)}
                      className="btn-accent text-sm flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI 回答
                    </button>
                    <button
                      onClick={() => transferQuestion(question.id)}
                      className="btn-secondary text-sm flex items-center gap-2"
                      disabled={question.status === 'transferred'}
                    >
                      <RotateCcw className="w-4 h-4" />
                      转老师处理
                    </button>
                    <button
                      onClick={() => starQuestion(question.id)}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          question.isStarred
                            ? 'text-accent-500 fill-accent-500'
                            : ''
                        }`}
                      />
                      {question.isStarred ? '取消收藏' : '收藏'}
                    </button>
                    <button
                      onClick={() =>
                        question.isBlocked
                          ? unblockQuestion(question.id)
                          : blockQuestion(question.id)
                      }
                      className={`text-sm flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        question.isBlocked
                          ? 'bg-success-100 text-success-700 hover:bg-success-200'
                          : 'bg-danger-100 text-danger-700 hover:bg-danger-200'
                      }`}
                    >
                      {question.isBlocked ? (
                        <>
                          <ShieldOff className="w-4 h-4" />
                          解除屏蔽
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          屏蔽内容
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <input
                      type="text"
                      placeholder="输入回复内容..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="flex-1 input-field"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleReply(question.id)
                      }
                    />
                    <button
                      onClick={() => handleReply(question.id)}
                      disabled={!replyContent.trim()}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      发送
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16">
            {settings.contentFilterEnabled && statusFilter === 'all' ? (
              <>
                <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">没有找到匹配的问题</p>
                <p className="text-sm text-slate-400 mt-1">
                  已启用内容过滤，不适合的内容已被隐藏
                </p>
              </>
            ) : (
              <>
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无问题</p>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuestionsPage;
