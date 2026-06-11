import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAppStore } from '../../store/useAppStore';
import {
  Settings,
  Sparkles,
  Shield,
  Bell,
  User,
  ChevronRight,
  Plus,
  X,
  Check,
  MessageSquare,
} from 'lucide-react';
import type { AnswerTone } from '../../types';

const SettingsPage = () => {
  const { settings, setAnswerTone, toggleContentFilter, toggleAutoAnswer, addBlockedKeyword, removeBlockedKeyword } = useAppStore();
  const [newKeyword, setNewKeyword] = useState('');

  const toneOptions: { value: AnswerTone; label: string; desc: string; icon: string }[] = [
    { value: 'formal', label: '正式', desc: '专业严谨的回答风格', icon: '🎓' },
    { value: 'friendly', label: '友好', desc: '亲切自然的交流方式', icon: '😊' },
    { value: 'encouraging', label: '鼓励', desc: '积极鼓励的学习氛围', icon: '💪' },
  ];

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !settings.blockedKeywords.includes(newKeyword.trim())) {
      addBlockedKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    removeBlockedKeyword(keyword);
  };

  return (
    <Layout title="系统设置">
      <div className="animate-slide-up max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">
            系统设置
          </h1>
          <p className="text-slate-500">
            自定义 AI 助教的行为偏好和内容管理
          </p>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">AI 回答语气</h3>
                <p className="text-sm text-slate-500">选择 AI 回答问题时使用的语气风格</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {toneOptions.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => setAnswerTone(tone.value)}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    settings.answerTone === tone.value
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-2xl mb-3">{tone.icon}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800">{tone.label}</span>
                    {settings.answerTone === tone.value && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">自动回答</h3>
                  <p className="text-sm text-slate-500">启用后，新问题将自动由 AI 生成回答</p>
                </div>
              </div>
              <button
                onClick={toggleAutoAnswer}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.autoAnswerEnabled ? 'bg-primary-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    settings.autoAnswerEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">内容过滤</h3>
                  <p className="text-sm text-slate-500">自动屏蔽不适合的内容</p>
                </div>
              </div>
              <button
                onClick={toggleContentFilter}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.contentFilterEnabled ? 'bg-primary-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    settings.contentFilterEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.contentFilterEnabled && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-3">屏蔽关键词列表</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {settings.blockedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-danger-50 text-danger-700 rounded-lg text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:bg-danger-200 hover:text-danger-800 rounded p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  新增关键词后，提问广场开启内容过滤时会自动屏蔽包含这些关键词的问题；删除后刷新页面仍生效
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="添加屏蔽关键词..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="flex-1 input-field text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <button
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                    className="btn-secondary flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">通知设置</h3>
                <p className="text-sm text-slate-500">管理接收哪些通知提醒</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: '新提问提醒', desc: '有新的学员提问时通知', enabled: true },
                { label: '待批改作业', desc: '有新作业提交时通知', enabled: true },
                { label: '每日学情报告', desc: '每日汇总发送学习报告', enabled: false },
                { label: '系统公告', desc: '接收系统更新和公告', enabled: true },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium text-slate-700">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  <div
                    className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
                      item.enabled ? 'bg-primary-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {settings.teacherName}
                  </h3>
                  <p className="text-sm text-slate-500">教师账号</p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                编辑资料
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-center py-8">
            <p className="text-sm text-slate-400">
              AI 课程助教 v1.0.0 · 智能教学辅助平台
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
