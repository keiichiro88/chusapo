import React from 'react';
import { 
  Home,
  BookOpen,
  HelpCircle,
  Activity,
  X,
  Brain,
  Sparkles,
  Syringe,
  TestTube,
  Cable,
  CircleDot,
  User,
  Heart
} from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import chusapoLogo from '../assets/chusapo-logo.svg';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
  activeCategory?: string;
  questionCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onNavigate, activeSection, activeCategory, questionCount = 0 }) => {
  const { user, isAuthenticated } = useSupabaseAuth();
  
  const menuItems = [
    { id: 'home', label: 'ホーム', icon: Home, badge: null },
    { id: 'answer-questions', label: '質問に回答', icon: HelpCircle, badge: null },
    { id: 'quiz', label: '学習クイズ', icon: Brain, badge: null },
    { id: 'nurse-career-diagnosis', label: 'キャリア診断AI', icon: Sparkles, badge: 'NEW' },
    { id: 'profile', label: 'プロフィール', icon: User, badge: null },
    { id: 'about-chusapo', label: 'チューサポについて', icon: Heart, badge: null },
    { id: 'guidelines', label: 'ガイドライン', icon: BookOpen, badge: null },
  ];

  const categoryItems = [
    { id: 'injection', label: '注射', icon: Syringe, color: 'text-red-600' },
    { id: 'blood-collection', label: '採血', icon: TestTube, color: 'text-blue-600' },
    { id: 'route-securing', label: 'ルート確保', icon: Cable, color: 'text-emerald-600' },
    { id: 'arterial', label: '動脈穿刺', icon: Activity, color: 'text-purple-600' },
    { id: 'others', label: 'その他', icon: CircleDot, color: 'text-gray-600' },
  ];

  // ボトムナビゲーション項目（初期段階では削除）
  const bottomItems: any[] = [];

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}
      
      {/* サイドバー */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen
        bg-white border-r border-gray-200 shadow-lg lg:shadow-none
        w-72 lg:w-64 xl:w-72
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-50 lg:z-30
        overflow-y-auto
      `}>
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl shadow-sm overflow-hidden bg-white ring-1 ring-blue-100 flex items-center justify-center flex-shrink-0">
                <img src={chusapoLogo} alt="チューサポ ロゴ" className="h-full w-full object-cover" />
              </div>
              <h2 className="text-xl font-black text-gray-900">チューサポ</h2>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* メインナビゲーション */}
        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-xl
                  transition-all duration-200
                  ${activeSection === item.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`h-5 w-5 ${
                    activeSection === item.id ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* カテゴリー */}
        <div className="px-4 pb-4">
          <h3 className="px-3 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            カテゴリー
          </h3>
          <div className="space-y-1">
            {categoryItems.map(item => (
              (() => {
                const isActive = activeCategory === item.label;
                return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-xl
                  transition-all duration-200
                  ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}
                `}
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="font-medium text-gray-700">{item.label}</span>
              </button>
                );
              })()
            ))}
          </div>
        </div>



        {/* プロフィール */}
        {isAuthenticated && user && (
          <div className="p-4 border-t border-gray-200">
            <button
              type="button"
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
              onClick={() => onNavigate('profile')}
              aria-label="プロフィールへ移動"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">{user.name?.slice(0, 2) || 'U'}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.name || 'ユーザー'}</p>
                <p className="text-sm text-gray-500">{user.specialty || '医療従事者'}</p>
              </div>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;