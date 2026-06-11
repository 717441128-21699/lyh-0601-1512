import { Bell, Search, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { settings, questions } = useAppStore();
  
  const pendingCount = questions.filter(
    (q) => q.status === 'pending' || q.status === 'transferred'
  ).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-serif font-semibold text-slate-800">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索课程、问题..."
            className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                       transition-all duration-200"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700">
              {settings.teacherName}
            </p>
            <p className="text-xs text-slate-500">授课教师</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
