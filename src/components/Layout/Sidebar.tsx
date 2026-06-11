import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  MessageSquare,
  FileText,
  Layers,
  BarChart3,
  Settings,
  Bot,
} from 'lucide-react';

const navItems = [
  { path: '/courses', label: '课程空间', icon: BookOpen },
  { path: '/questions', label: '提问广场', icon: MessageSquare },
  { path: '/homework', label: '作业批改', icon: FileText },
  { path: '/flashcards', label: '知识卡片', icon: Layers },
  { path: '/reports', label: '班级报告', icon: BarChart3 },
  { path: '/settings', label: '系统设置', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-slate-800">AI 助教</h1>
            <p className="text-xs text-slate-500">智能教学辅助平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-700 mb-1">今日概览</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-primary-700">12</p>
              <p className="text-xs text-slate-500">待处理问题</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-600">8</p>
              <p className="text-xs text-slate-500">待批改作业</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
