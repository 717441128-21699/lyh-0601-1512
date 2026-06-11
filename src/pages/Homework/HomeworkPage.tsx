import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAppStore } from '../../store/useAppStore';
import {
  FileText,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Edit3,
  Sparkles,
  Send,
  X,
  ChevronRight,
  Search,
} from 'lucide-react';
import type { Homework, Submission } from '../../types';

const HomeworkPage = () => {
  const {
    homeworks,
    submissions,
    generateCommentForSubmission,
    updateSubmissionScore,
    updateSubmissionComment,
    submitGrade,
    settings,
  } = useAppStore();

  const [selectedHomework, setSelectedHomework] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHomeworks = homeworks.filter(
    (h) =>
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedHomeworkData = homeworks.find((h) => h.id === selectedHomework);
  const homeworkSubmissions = selectedHomework
    ? submissions.filter((s) => s.homeworkId === selectedHomework)
    : [];

  const filteredSubmissions = homeworkSubmissions.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  const handleGenerateComment = (submissionId: string) => {
    generateCommentForSubmission(submissionId);
    const updated = submissions.find((s) => s.id === submissionId);
    if (updated) {
      setSelectedSubmission({ ...updated });
    }
  };

  const handleScoreChange = (score: number) => {
    if (selectedSubmission) {
      updateSubmissionScore(selectedSubmission.id, score);
      setSelectedSubmission((prev) => (prev ? { ...prev, score } : prev));
    }
  };

  const handleCommentChange = (comment: string) => {
    if (selectedSubmission) {
      updateSubmissionComment(selectedSubmission.id, comment);
      setSelectedSubmission((prev) => (prev ? { ...prev, finalComment: comment } : prev));
    }
  };

  const handleSubmitGrade = () => {
    if (selectedSubmission) {
      submitGrade(selectedSubmission.id);
      const updated = submissions.find((s) => s.id === selectedSubmission.id);
      if (updated) {
        setSelectedSubmission({ ...updated });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="badge badge-warning flex items-center gap-1">
            <Clock className="w-3 h-3" />
            待批改
          </span>
        );
      case 'grading':
        return (
          <span className="badge badge-info flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            批改中
          </span>
        );
      case 'graded':
        return (
          <span className="badge badge-success flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            已完成
          </span>
        );
      default:
        return null;
    }
  };

  const completionRate = selectedHomeworkData
    ? Math.round(
        (selectedHomeworkData.submittedCount / selectedHomeworkData.totalCount) * 100
      )
    : 0;

  return (
    <Layout title="作业批改">
      <div className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">
              作业批改
            </h1>
            <p className="text-slate-500">
              共 {homeworks.length} 份作业，
              {submissions.filter((s) => s.status === 'submitted').length} 份待批改
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-4 mb-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索作业..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredHomeworks.map((homework) => (
                <div
                  key={homework.id}
                  onClick={() => {
                    setSelectedHomework(homework.id);
                    setSelectedSubmission(null);
                  }}
                  className={`card p-4 cursor-pointer transition-all ${
                    selectedHomework === homework.id
                      ? 'ring-2 ring-primary-500 shadow-card-hover'
                      : 'card-hover'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 mb-1 line-clamp-1">
                        {homework.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {homework.courseName}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {homework.submittedCount}/{homework.totalCount} 已提交
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>截止: {homework.dueDate}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${
                        completionRate >= 80
                          ? 'bg-success-500'
                          : completionRate >= 50
                          ? 'bg-primary-500'
                          : 'bg-warning-500'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  {homework.averageScore && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <TrendingUp className="w-4 h-4 text-success-600" />
                      <span className="text-slate-600">平均分:</span>
                      <span className="font-medium text-success-600">
                        {homework.averageScore}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedHomeworkData ? (
              <div className="card p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-slate-800 mb-1">
                      {selectedHomeworkData.title}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selectedHomeworkData.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">完成率</p>
                    <p className="text-2xl font-bold text-primary-700">
                      {completionRate}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4">
                  {[
                    { value: 'all', label: '全部', count: homeworkSubmissions.length },
                    {
                      value: 'submitted',
                      label: '待批改',
                      count: homeworkSubmissions.filter((s) => s.status === 'submitted')
                        .length,
                    },
                    {
                      value: 'grading',
                      label: '批改中',
                      count: homeworkSubmissions.filter((s) => s.status === 'grading')
                        .length,
                    },
                    {
                      value: 'graded',
                      label: '已完成',
                      count: homeworkSubmissions.filter((s) => s.status === 'graded')
                        .length,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setFilterStatus(tab.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === tab.value
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-1 text-xs opacity-70">
                        ({tab.count})
                      </span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedSubmission?.id === submission.id
                          ? 'border-primary-500 bg-primary-50/50 shadow-md'
                          : 'border-slate-200 hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                            {submission.studentName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {submission.studentName}
                            </p>
                            <p className="text-xs text-slate-500">
                              提交于 {submission.submittedAt}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {submission.content.substring(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between">
                        {submission.score !== null ? (
                          <span className="text-lg font-bold text-primary-700">
                            {submission.score} 分
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">未打分</span>
                        )}
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          查看详情 →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">暂无作业提交</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  选择一份作业开始批改
                </h3>
                <p className="text-slate-500 text-sm">
                  从左侧列表中选择作业，查看学员提交情况并进行批改
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedSubmission && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedSubmission(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-slide-up flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {selectedSubmission.studentName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {selectedSubmission.studentName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {selectedHomeworkData?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedSubmission.status)}
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      作业内容
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {selectedSubmission.content}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">
                        打分
                      </h4>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedSubmission.score ?? 0}
                          onChange={(e) =>
                            handleScoreChange(parseInt(e.target.value))
                          }
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="w-20 h-14 bg-primary-50 rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-700">
                            {selectedSubmission.score ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-slate-700 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-accent-500" />
                          AI 评语草稿
                        </h4>
                        <button
                          onClick={() =>
                            handleGenerateComment(selectedSubmission.id)
                          }
                          className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
                        >
                          <Sparkles className="w-4 h-4" />
                          生成评语
                        </button>
                      </div>
                      {selectedSubmission.commentDraft ? (
                        <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {selectedSubmission.commentDraft}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-6 text-center border border-dashed border-slate-200">
                          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">
                            点击上方按钮生成 AI 评语草稿
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">
                        最终评语
                      </h4>
                      <textarea
                        value={selectedSubmission.finalComment || ''}
                        onChange={(e) => handleCommentChange(e.target.value)}
                        placeholder="输入评语内容，或使用 AI 生成的评语草稿..."
                        rows={5}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                   text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitGrade}
                  disabled={
                    !selectedSubmission.finalComment &&
                    !selectedSubmission.commentDraft
                  }
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  发布批改
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomeworkPage;
