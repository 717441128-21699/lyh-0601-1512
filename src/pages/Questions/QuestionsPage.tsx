import { useState, useRef, useEffect } from 'react';
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
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Clock,
  BookmarkPlus,
  Inbox,
  CheckCircle,
  FileText,
  ArrowLeftRight,
  BookOpen,
  ChevronRight,
  FileSearch,
} from 'lucide-react';
import type { AnswerTone, ChatMessage, MessageRole } from '../../types';

const QuestionsPage = () => {
  const {
    questions,
    settings,
    setAnswerTone,
    addMessage,
    transferQuestion,
    blockQuestion,
    unblockQuestion,
    toggleQuestionStar,
    generateAIAnswerForQuestion,
    convertQuestionToFlashcard,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'transferred'>('all');
  const [convertToast, setConvertToast] = useState(false);
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleRef = (key: string) => {
    setExpandedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toneOptions: { value: AnswerTone; label: string; desc: string }[] = [
    { value: 'formal', label: '正式', desc: '专业严谨' },
    { value: 'friendly', label: '友好', desc: '亲切自然' },
    { value: 'encouraging', label: '鼓励', desc: '积极鼓励' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (expandedId) {
      scrollToBottom();
    }
  }, [expandedId, questions]);

  const filteredQuestions = questions.filter((q) => {
    if (settings.contentFilterEnabled && q.isBlocked) return false;

    if (activeTab === 'pending') {
      if (q.status !== 'pending') return false;
    } else if (activeTab === 'transferred') {
      if (q.status !== 'transferred') return false;
    }

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

  const uniqueCourses = [...new Map(questions.map((q) => [q.courseId, q.courseName])).entries()];

  const pendingCount = questions.filter((q) => q.status === 'pending').length;
  const transferredCount = questions.filter((q) => q.status === 'transferred').length;

  const handleGenerateAI = (questionId: string) => {
    generateAIAnswerForQuestion(questionId);
  };

  const handleReply = (questionId: string) => {
    if (replyContent.trim()) {
      addMessage(questionId, 'teacher', replyContent.trim(), settings.teacherName);
      setReplyContent('');
    }
  };

  const handleConvertToCard = (questionId: string) => {
    const result = convertQuestionToFlashcard(questionId);
    if (result) {
      setConvertToast(true);
      setTimeout(() => setConvertToast(false), 2000);
    }
  };

  const getRoleIcon = (role: MessageRole) => {
    switch (role) {
      case 'student':
        return <User className="w-5 h-5 text-white" />;
      case 'ai':
        return <Bot className="w-5 h-5 text-white" />;
      case 'teacher':
        return <FileText className="w-5 h-5 text-white" />;
    }
  };

  const getRoleName = (role: MessageRole, authorName?: string) => {
    switch (role) {
      case 'student':
        return '学员';
      case 'ai':
        return 'AI 助教';
      case 'teacher':
        return authorName || '老师';
    }
  };

  const getRoleBg = (role: MessageRole) => {
    switch (role) {
      case 'student':
        return 'bg-gradient-to-br from-slate-400 to-slate-600';
      case 'ai':
        return 'bg-gradient-to-br from-accent-400 to-accent-600';
      case 'teacher':
        return 'bg-gradient-to-br from-primary-500 to-primary-700';
    }
  };

  const renderMessage = (msg: ChatMessage, allMessages: ChatMessage[]) => {
    const isRight = msg.role === 'teacher';
    const hasNewRef = msg.role === 'ai' && msg.referenceDetails?.some((r) => r.isNew);
    const prevAiMsgs = allMessages.filter(
      (m) => m.role === 'ai' && m.id !== msg.id && allMessages.indexOf(m) < allMessages.indexOf(msg)
    );
    const showNewRefBanner = msg.role === 'ai' && hasNewRef && prevAiMsgs.length > 0;

    return (
      <div key={msg.id}>
        {showNewRefBanner && (
          <div className="flex items-center gap-2 py-2 px-3 mb-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600">
            <FileSearch className="w-3.5 h-3.5 flex-shrink-0" />
            <span>以下回答引用了新增课程资料</span>
          </div>
        )}
        <div className={`flex gap-3 ${isRight ? 'flex-row-reverse' : ''}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getRoleBg(msg.role)}`}>
            {getRoleIcon(msg.role)}
          </div>
          <div className={`max-w-[75%] ${isRight ? 'text-right' : ''}`}>
            <p className="text-xs text-slate-500 mb-1">
              {getRoleName(msg.role, msg.authorName)}
              <span className="ml-2">{formatDate(msg.createdAt)}</span>
            </p>
            <div
              className={`relative p-4 rounded-xl ${
                msg.role === 'teacher'
                  ? 'bg-primary-600 text-white'
                  : msg.role === 'ai'
                    ? 'bg-white border border-slate-200'
                    : 'bg-slate-100'
              }`}
            >
              {hasNewRef && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full leading-none">
                  引用新资料
                </span>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              {msg.role === 'ai' && msg.referenceDetails && msg.referenceDetails.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-primary-600 mb-2">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-primary-700">📚 参考资料</span>
                    <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[10px] leading-none">
                      {msg.referenceDetails.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {msg.referenceDetails.map((ref) => {
                      const refKey = `${msg.id}-${ref.name}`;
                      const isExpanded = expandedRefs.has(refKey);
                      return (
                        <div key={refKey} className="rounded-lg border border-slate-100 overflow-hidden">
                          <button
                            onClick={() => toggleRef(refKey)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            )}
                            <span className="text-xs font-medium text-primary-700">《{ref.name}》</span>
                            {ref.isNew && (
                              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] rounded-full leading-none">
                                新资料
                              </span>
                            )}
                          </button>
                          {isExpanded && ref.excerpts.length > 0 && (
                            <div className="px-3 pb-2 space-y-1.5">
                              {ref.excerpts.map((excerpt, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 px-2.5 py-2 bg-slate-50 rounded-md"
                                >
                                  <span className="text-slate-400 text-xs mt-0.5 flex-shrink-0">📄</span>
                                  <p className="text-xs text-slate-600 leading-relaxed">{excerpt}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {msg.role === 'ai' && !msg.referenceDetails && msg.references && msg.references.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-xs text-primary-600">
                    <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-primary-700">📚 参考资料：</p>
                      <ul className="space-y-1">
                        {msg.references.map((ref, idx) => (
                          <li key={idx} className="text-primary-600 bg-primary-50 px-2 py-1 rounded inline-flex mr-2 mb-1">
                            《{ref}》
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="提问广场">
      <div className="animate-slide-up relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">提问广场</h1>
            <p className="text-slate-500">
              共 {questions.length} 个问题，{pendingCount} 个待回答，{transferredCount} 个待老师处理
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setShowToneSelector(!showToneSelector)}
                className="btn-secondary flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-accent-500" />
                回答语气：{toneOptions.find((t) => t.value === settings.answerTone)?.label}
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

        <div className="flex gap-2 mb-5">
          {[
            { key: 'all', label: '全部问题', icon: MessageSquare, count: questions.length },
            { key: 'pending', label: '待回答', icon: Clock, count: pendingCount },
            { key: 'transferred', label: '待老师处理', icon: Inbox, count: transferredCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
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
              {uniqueCourses.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 animate-stagger">
          {filteredQuestions.map((question, index) => {
            const messageCount = question.messages.filter((m) => m.role !== 'student').length;
            const followUpCount = question.messages.filter((m) => m.role === 'student').length - 1;

            return (
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
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-medium text-slate-800">{question.studentName}</span>
                        <span className={`badge ${getStatusColor(question.status)}`}>
                          {getStatusLabel(question.status)}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(question.createdAt)}</span>
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                          {question.courseName}
                        </span>
                        {question.isStarred && (
                          <Star className="w-4 h-4 text-accent-500 fill-accent-500" />
                        )}
                      </div>
                      <p className="text-slate-700 mb-3 line-clamp-2">{question.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          {question.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{messageCount} 回复</span>
                          </div>
                          {followUpCount > 0 && (
                            <div className="flex items-center gap-1 text-accent-600">
                              <ArrowLeftRight className="w-4 h-4" />
                              <span>{followUpCount} 次追问</span>
                            </div>
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
                  <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        对话时间线
                      </h4>
                      {question.status === 'transferred' && (
                        <span className="badge badge-warning flex items-center gap-1">
                          <Inbox className="w-3 h-3" />
                          待老师处理
                        </span>
                      )}
                      {question.status === 'teacher_answered' && (
                        <span className="badge badge-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          老师已回复
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-5 max-h-96 overflow-y-auto">
                      {question.messages.map((msg) => renderMessage(msg, question.messages))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateAI(question.id);
                          }}
                          className="btn-accent text-sm flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          AI 回答
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            transferQuestion(question.id);
                          }}
                          className="btn-secondary text-sm flex items-center gap-2"
                          disabled={question.status === 'transferred'}
                        >
                          <Inbox className="w-4 h-4" />
                          {question.status === 'transferred' ? '已转老师' : '转老师处理'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQuestionStar(question.id);
                          }}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              question.isStarred ? 'text-accent-500 fill-accent-500' : ''
                            }`}
                          />
                          {question.isStarred ? '取消收藏' : '收藏'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConvertToCard(question.id);
                          }}
                          className="btn-secondary text-sm flex items-center gap-2"
                          disabled={messageCount === 0}
                        >
                          <BookmarkPlus className="w-4 h-4" />
                          转知识卡片
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            question.isBlocked
                              ? unblockQuestion(question.id)
                              : blockQuestion(question.id);
                          }}
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

                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="以老师身份回复..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="flex-1 input-field"
                          onKeyDown={(e) => e.key === 'Enter' && handleReply(question.id)}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReply(question.id);
                          }}
                          disabled={!replyContent.trim()}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          发送
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16">
            {settings.contentFilterEnabled && statusFilter === 'all' ? (
              <>
                <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">没有找到匹配的问题</p>
                <p className="text-sm text-slate-400 mt-1">已启用内容过滤，不适合的内容已被隐藏</p>
              </>
            ) : (
              <>
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {activeTab === 'pending'
                    ? '暂无待回答问题'
                    : activeTab === 'transferred'
                      ? '暂无待老师处理的问题'
                      : '暂无问题'}
                </p>
              </>
            )}
          </div>
        )}

        {convertToast && (
          <div className="fixed bottom-6 right-6 bg-success-500 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-2 z-50">
            <CheckCircle className="w-5 h-5" />
            已成功转为知识卡片！
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuestionsPage;
