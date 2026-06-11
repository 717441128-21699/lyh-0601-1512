import { useState } from 'react';
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
} from 'lucide-react';

const CoursesPage = () => {
  const { courses, addMaterialToCourse } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState('');

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);

  const handleAddMaterial = () => {
    if (selectedCourse && newMaterial.trim()) {
      addMaterialToCourse(selectedCourse, newMaterial.trim());
      setNewMaterial('');
      setShowMaterialModal(false);
    }
  };

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
                      <span>{course.materials.length} 份资料</span>
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48">
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

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-12rem)]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary-700">
                    {selectedCourseData.studentCount}
                  </p>
                  <p className="text-sm text-slate-500">学员人数</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-accent-600">
                    {selectedCourseData.materials.length}
                  </p>
                  <p className="text-sm text-slate-500">教学资料</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-success-600">
                    {selectedCourseData.progress}%
                  </p>
                  <p className="text-sm text-slate-500">课程进度</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    课程资料
                  </h3>
                  <button
                    onClick={() => setShowMaterialModal(true)}
                    className="btn-ghost text-sm flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    导入资料
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedCourseData.materials.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="text-sm text-slate-700 flex-1">
                        {material}
                      </span>
                      <span className="text-xs text-slate-400">已导入</span>
                    </div>
                  ))}
                </div>
              </div>

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
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              导入教学资料
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              导入的资料将作为 AI 回答问题的参考依据
            </p>
            <input
              type="text"
              placeholder="输入资料名称..."
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              className="input-field mb-4"
              autoFocus
            />
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center mb-4 hover:border-primary-300 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">点击或拖拽文件到此处上传</p>
              <p className="text-xs text-slate-400 mt-1">支持 PDF、Word、PPT 等格式</p>
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
                disabled={!newMaterial.trim()}
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
