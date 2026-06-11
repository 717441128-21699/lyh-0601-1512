import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAppStore } from '../../store/useAppStore';
import {
  Plus,
  Search,
  Users,
  BookOpen,
  Upload,
  FileText,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Database,
  Sparkles,
} from 'lucide-react';
import type { MaterialStatus, CourseMaterial } from '../../types';

const statusConfig: Record<MaterialStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  uploading: { label: '上传中', icon: Upload, color: 'text-primary-600', bgColor: 'bg-primary-100' },
  processing: { label: '处理中', icon: Loader2, color: 'text-warning-600', bgColor: 'bg-warning-100' },
  ready: { label: '已就绪', icon: CheckCircle2, color: 'text-success-600', bgColor: 'bg-success-100' },
  failed: { label: '处理失败', icon: AlertCircle, color: 'text-danger-600', bgColor: 'bg-danger-100' },
};

const CoursesPage = () => {
  const { courses, addMaterialToCourse, updateMaterialStatus, questions } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);

  const courseQuestions = questions.filter((q) => q.courseId === selectedCourse);

  useEffect(() => {
    if (uploadingId && selectedCourseData) {
      const material = selectedCourseData.materialList.find((m) => m.id === uploadingId);
      if (material && material.status === 'uploading') {
        const timer1 = setTimeout(() => {
          updateMaterialStatus(uploadingId, 'processing', selectedCourse!);
        }, 1500);
        const timer2 = setTimeout(() => {
          updateMaterialStatus(uploadingId, 'ready', selectedCourse!);
          setUploadingId(null);
        }, 3500);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }
  }, [uploadingId, selectedCourseData, selectedCourse, updateMaterialStatus]);

  const handleAddMaterial = () => {
    if (selectedCourse && newMaterialName.trim()) {
      const newId = Date.now().toString();
      const sizeKb = Math.floor(Math.random() * 5000 + 500);
      const material: CourseMaterial = {
        id: newId,
        courseId: selectedCourse,
        name: newMaterialName.trim(),
        type: 'pdf',
        size: formatFileSize(sizeKb),
        uploadedAt: new Date().toISOString(),
        status: 'uploading',
        relatedQuestions: Math.floor(Math.random() * 8 + 2),
        progress: 30,
      };
      addMaterialToCourse(selectedCourse, material);
      setUploadingId(newId);
      setNewMaterialName('');
      setShowMaterialModal(false);
    }
  };

  const getStatusInfo = (status: MaterialStatus) => statusConfig[status];

  const formatFileSize = (kb: number) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const readyMaterials = selectedCourseData?.materialList.filter((m) => m.status === 'ready').length || 0;
  const totalMaterials = selectedCourseData?.materialList.length || 0;

  return (
    <Layout title="课程空间">
      <div className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">
              我的课程
            </h1>
            <p className="text-slate-500">
              共 {courses.length} 门课程，管理您的教学资料和学员
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建课程
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索课程..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-all duration-200 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary px-4 py-3">全部</button>
            <button className="btn-ghost px-4 py-3">进行中</button>
            <button className="btn-ghost px-4 py-3">已完成</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              className="card card-hover cursor-pointer group"
            >
              <div className="relative h-40 rounded-t-xl overflow-hidden">
                <img
                  src={course.cover}
                  alt={course.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="badge badge-info bg-white/90 backdrop-blur-sm">
                    {course.className}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif font-semibold text-lg text-slate-800 mb-2">
                  {course.name}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.studentCount} 人</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{course.materialList.length} 份资料</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>课程进度</span>
                    <span className="font-medium text-slate-700">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill bg-gradient-to-r from-primary-500 to-primary-700"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">没有找到匹配的课程</p>
          </div>
        )}
      </div>

      {selectedCourseData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-slide-up flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 flex-shrink-0">
              <img
                src={selectedCourseData.cover}
                alt={selectedCourseData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="badge badge-info mb-2">
                  {selectedCourseData.className}
                </span>
                <h2 className="text-2xl font-serif font-bold">
                  {selectedCourseData.name}
                </h2>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary-700">
                    {selectedCourseData.studentCount}
                  </p>
                  <p className="text-xs text-slate-500">学员人数</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-accent-600">
                    {totalMaterials}
                  </p>
                  <p className="text-xs text-slate-500">资料总数</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-success-600">
                    {readyMaterials}
                  </p>
                  <p className="text-xs text-slate-500">已就绪</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-warning-600">
                    {selectedCourseData.progress}%
                  </p>
                  <p className="text-xs text-slate-500">课程进度</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary-600" />
                    资料上传记录
                  </h3>
                  <button
                    onClick={() => setShowMaterialModal(true)}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    导入资料
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedCourseData.materialList.map((material) => {
                    const statusInfo = getStatusInfo(material.status);
                    const StatusIcon = statusInfo.icon;
                    const isProcessing = material.status === 'uploading' || material.status === 'processing';
                    return (
                      <div
                        key={material.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          material.status === 'failed'
                            ? 'bg-danger-50 border-danger-200'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusInfo.bgColor}`}>
                          {isProcessing ? (
                            <Loader2 className="w-5 h-5 animate-spin text-warning-600" />
                          ) : (
                            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {material.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{material.size}</span>
                            <span>·</span>
                            <span>{formatDate(material.uploadedAt)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {material.relatedQuestions} 条关联问答
                            </span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-500" />
                  AI 知识库影响说明
                </h3>
                <div className="p-4 bg-accent-50 rounded-xl border border-accent-200">
                  <p className="text-sm text-slate-700 leading-relaxed mb-2">
                    导入的资料会自动解析并加入 AI 知识库，在学员提问时：
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1.5 ml-4 list-disc">
                    <li>AI 回答会优先参考课程资料中的内容</li>
                    <li>回答末尾会标注参考来源资料</li>
                    <li>资料更新后，AI 回答质量会逐步提升</li>
                  </ul>
                </div>
              </div>

              {courseQuestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    常见问答（{courseQuestions.length} 条）
                  </h3>
                  <div className="space-y-2">
                    {courseQuestions.slice(0, 3).map((q) => (
                      <div
                        key={q.id}
                        className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">
                          Q: {q.content}
                        </p>
                        {q.messages.length > 1 && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            A: {q.messages[1]?.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-3">课程简介</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedCourseData.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMaterialModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowMaterialModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              导入教学资料
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              导入的资料将作为 AI 回答问题的参考依据
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                资料名称
              </label>
              <input
                type="text"
                placeholder="例如：第三章 函数进阶.pdf"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                className="input-field"
                autoFocus
              />
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center mb-5 hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">点击或拖拽文件到此处上传</p>
              <p className="text-xs text-slate-400 mt-1">支持 PDF、Word、PPT、TXT 等格式</p>
            </div>
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mb-5">
              <p className="text-xs text-warning-700 flex items-start gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>资料上传后需要 1-3 分钟处理，处理完成后自动加入知识库</span>
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowMaterialModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddMaterial}
                className="btn-primary"
                disabled={!newMaterialName.trim()}
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CoursesPage;
