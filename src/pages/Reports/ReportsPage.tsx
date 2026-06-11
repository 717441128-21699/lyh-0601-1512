import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAppStore } from '../../store/useAppStore';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Download,
  Copy,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Brain,
  Target,
  Layers,
} from 'lucide-react';
import { exportToText, copyToClipboard } from '../../utils/ai';
import type { StudentProgress } from '../../types';

const ReportsPage = () => {
  const { reportData, courses, flashcards, refreshReportWeakPoints } = useAppStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(reportData[0]?.courseId || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedReport = reportData.find((r) => r.courseId === selectedCourseId);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const courseFlashcards = flashcards.filter((f) => f.courseId === selectedCourseId);
  const masteredCount = courseFlashcards.filter((f) => f.masteryLevel === 'mastered').length;
  const learningCount = courseFlashcards.filter((f) => f.masteryLevel === 'learning').length;
  const weakCount = courseFlashcards.filter((f) => f.masteryLevel === 'weak' || f.masteryLevel === 'not_started').length;

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    refreshReportWeakPoints(courseId);
  };

  const handleCopySuggestion = async (student: StudentProgress) => {
    const text = exportToText(student, selectedCourse?.name || '');
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(student.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExport = (student: StudentProgress) => {
    const text = exportToText(student, selectedCourse?.name || '');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name}_辅导建议.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMasteryColor = (level: number) => {
    if (level >= 4) return 'text-success-600';
    if (level >= 2) return 'text-primary-600';
    return 'text-warning-600';
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 4) return '已掌握';
    if (level >= 2) return '学习中';
    return '薄弱';
  };

  const getPointMastery = (point: string, index: number, baseMastery: number, isWeak: boolean): number => {
    const hash = point.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const variation = (hash % 20) - 10;
    let mastery = isWeak
      ? Math.max(15, Math.min(45, baseMastery - 25 + index * 5 + variation))
      : Math.max(40, Math.min(75, baseMastery - 5 + index * 4 + variation));
    return Math.round(mastery);
  };

  return (
    <Layout title="班级报告">
      <div className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">
              班级报告
            </h1>
            <p className="text-slate-500">
              查看班级学习数据，生成个性化辅导建议
            </p>
          </div>
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {reportData.map((report) => (
                <option key={report.courseId} value={report.courseId}>
                  {report.courseName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {selectedReport && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {selectedReport.totalQuestions}
                </p>
                <p className="text-sm text-slate-500">总提问数</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-success-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-success-600 mb-1">
                  {selectedReport.aiAnsweredRate}%
                </p>
                <p className="text-sm text-slate-500">AI 解答率</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accent-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-accent-600 mb-1">
                  {selectedReport.homeworkCompletionRate}%
                </p>
                <p className="text-sm text-slate-500">作业完成率</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-warning-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-warning-600 mb-1">
                  {selectedReport.averageScore}
                </p>
                <p className="text-sm text-slate-500">平均分</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="card p-6 lg:col-span-2">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                  高频困惑统计
                </h3>
                <div className="space-y-4">
                  {selectedReport.topConfusions.map((item, index) => (
                    <div key={item.topic}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index < 3
                                ? 'bg-warning-500 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            {item.topic}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500">
                            {item.count} 次
                          </span>
                          <span className="text-sm font-medium text-slate-700 w-16 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            index < 3
                              ? 'bg-gradient-to-r from-warning-400 to-warning-600'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                {selectedReport.noObviousWeakness ? (
                  <>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success-500" />
                      知识点掌握情况
                    </h3>
                    <div className="p-4 bg-success-50 rounded-xl border border-success-200 mb-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-success-800 mb-1">
                            当前无明显薄弱点
                          </p>
                          <p className="text-xs text-success-700 leading-relaxed">
                            学员整体掌握良好，可以继续关注学习中的知识点，稳步提升整体水平。
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : selectedReport.weakPoints && selectedReport.weakPoints.length > 0 ? (
                  <>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-danger-500" />
                      薄弱知识点（Top {selectedReport.weakPoints.length}）
                    </h3>
                    <div className="space-y-3">
                      {selectedReport.weakPoints.map((point, index) => {
                        const mastery = getPointMastery(point, index, selectedReport.avgMastery, true);
                        return (
                          <div
                            key={point}
                            className="p-3 bg-danger-50 rounded-lg border border-danger-100"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="w-7 h-7 bg-danger-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-slate-800 truncate">{point}</p>
                                  <span className="text-xs font-bold text-danger-600 flex-shrink-0">
                                    {mastery}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="h-1.5 bg-danger-100 rounded-full overflow-hidden ml-10">
                              <div
                                className="h-full bg-danger-500 rounded-full transition-all duration-700"
                                style={{ width: `${mastery}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : selectedReport.learningPoints && selectedReport.learningPoints.length > 0 ? (
                  <>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary-500" />
                      学习中知识点（建议巩固）
                    </h3>
                    <div className="space-y-3">
                      {selectedReport.learningPoints.map((point, index) => {
                        const mastery = getPointMastery(point, index, selectedReport.avgMastery, false);
                        return (
                          <div
                            key={point}
                            className="p-3 bg-primary-50 rounded-lg border border-primary-100"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-slate-800 truncate">{point}</p>
                                  <span className="text-xs font-bold text-primary-600 flex-shrink-0">
                                    {mastery}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden ml-10">
                              <div
                                className="h-full bg-primary-500 rounded-full transition-all duration-700"
                                style={{ width: `${mastery}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">整体掌握度</span>
                    <span className={`text-sm font-bold ${getMasteryColor(selectedReport.avgMastery)}`}>
                      {selectedReport.avgMastery}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        selectedReport.avgMastery >= 70
                          ? 'bg-success-500'
                          : selectedReport.avgMastery >= 40
                          ? 'bg-primary-500'
                          : 'bg-warning-500'
                      }`}
                      style={{ width: `${selectedReport.avgMastery}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary-500" />
                  知识卡片掌握分布
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-4 bg-success-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-success-600">{masteredCount}</p>
                    <p className="text-xs text-success-700">已掌握</p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary-600">{learningCount}</p>
                    <p className="text-xs text-primary-700">学习中</p>
                  </div>
                  <div className="p-4 bg-warning-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-warning-600">{weakCount}</p>
                    <p className="text-xs text-warning-700">薄弱</p>
                  </div>
                </div>
                {weakCount === 0 && (
                  <p className="text-xs text-success-600 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    太棒了！所有知识点都已掌握或在学习中
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  共 {courseFlashcards.length} 张知识卡片，掌握程度随练习和复习动态更新
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  班级完成率对比
                </h3>
                <div className="space-y-5">
                  {reportData.slice(0, 5).map((course) => (
                    <div key={course.courseId}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600 truncate max-w-[180px]">
                          {course.courseName}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {course.homeworkCompletionRate}%
                        </span>
                      </div>
                      <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                        <div
                          className={`h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-3 ${
                            course.courseId === selectedCourseId
                              ? 'bg-gradient-to-r from-primary-500 to-primary-700'
                              : 'bg-slate-300'
                          }`}
                          style={{
                            width: `${Math.max(course.homeworkCompletionRate, 5)}%`,
                          }}
                        >
                          {course.homeworkCompletionRate >= 30 && (
                            <span className="text-xs font-medium text-white">
                              {course.homeworkCompletionRate}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" />
                  学员学习进度
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                    <span className="text-slate-500">进度良好</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                    <span className="text-slate-500">需要关注</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedReport.studentProgress.map((student) => (
                  <div
                    key={student.id}
                    className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                      student.needsHelp
                        ? 'border-warning-200 bg-warning-50/50'
                        : 'border-slate-200 hover:border-primary-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                        {student.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">
                            {student.name}
                          </span>
                          {student.needsHelp && (
                            <span className="badge badge-warning flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              需关注
                            </span>
                          )}
                          <span className="text-sm text-slate-500 ml-auto">
                            得分: {student.score}
                          </span>
                        </div>
                        {student.weakTopics.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mb-2">
                            <span className="text-xs text-slate-500">薄弱点:</span>
                            {student.weakTopics.map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-0.5 bg-danger-100 text-danger-700 text-xs rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 progress-bar">
                            <div
                              className={`progress-fill ${
                                student.progress >= 80
                                  ? 'bg-success-500'
                                  : student.progress >= 60
                                  ? 'bg-primary-500'
                                  : 'bg-warning-500'
                              }`}
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium w-12 text-right ${
                              student.progress >= 80
                                ? 'text-success-600'
                                : student.progress >= 60
                                ? 'text-primary-600'
                                : 'text-warning-600'
                            }`}
                          >
                            {student.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCopySuggestion(student)}
                          className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="复制辅导建议"
                        >
                          {copiedId === student.id ? (
                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleExport(student)}
                          className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="导出辅导建议"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-500" />
                  AI 教学建议
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-accent-50 rounded-xl border border-accent-200">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <span className="font-medium text-accent-700">建议一：</span>
                      针对"{selectedReport.topConfusions[0]?.topic}"这一高频困惑点，建议安排一次专项讲解，
                      配合实例演示帮助学员理解。
                    </p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <span className="font-medium text-primary-700">建议二：</span>
                      班级中有{' '}
                      {selectedReport.studentProgress.filter((s) => s.needsHelp).length} 名学员需要重点关注，
                      建议安排一对一辅导时间。
                    </p>
                  </div>
                  <div className="p-4 bg-success-50 rounded-xl border border-success-200">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <span className="font-medium text-success-700">建议三：</span>
                      作业完成率达到 {selectedReport.homeworkCompletionRate}%，整体表现良好，
                      可以适当增加拓展练习的难度。
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" />
                  学习趋势
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">提问活跃度</span>
                      <span className="text-success-600 font-medium">↑ 12%</span>
                    </div>
                    <div className="flex gap-1 h-8 items-end">
                      {[40, 55, 48, 62, 58, 70, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary-200 rounded-t transition-all"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>周一</span>
                      <span>周日</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">作业完成质量</span>
                      <span className="text-success-600 font-medium">↑ 8%</span>
                    </div>
                    <div className="flex gap-1 h-8 items-end">
                      {[65, 68, 72, 70, 75, 78, 82].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-success-300 rounded-t transition-all"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>第1周</span>
                      <span>第7周</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
