import React, { useState } from 'react';
import { 
  Bell, 
  User, 
  Menu,
  Settings,
  LogOut,
  Shield,
  Star,
  UserCircle
} from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useUser } from '../hooks/useUser';
import { useNotifications } from '../hooks/useNotifications';
import LoginModal from './auth/LoginModal';
import SignupModal from './auth/SignupModal';
import NotificationList from './NotificationList';
import chusapoLogo from '../assets/chusapo-logo.svg';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
  onProfileClick?: () => void;
  onEditProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarOpen, onProfileClick, onEditProfileClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user: supabaseUser, isAuthenticated, signIn, signUp, signOut, getUserTierInfo } = useSupabaseAuth();
  const { currentUser: userHookCurrentUser } = useUser();
  const { unreadCount, notifications } = useNotifications();
  
  // 現在のユーザーを統一（Supabase認証を優先）
  const user = supabaseUser || userHookCurrentUser;
  const currentUser = supabaseUser; // 互換性のため

  const handleLoginClick = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const handleSignupClick = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return result;
  };

  const handleSignup = async (signupData: any) => {
    const result = await signUp(signupData.email, signupData.password, signupData.name);
    return result;
  };

  const handleLogout = async () => {
    await signOut();
    setIsProfileOpen(false);
  };

  const renderUserBadge = () => {
    if (!user) return null;
    
    // useAuthのtier情報がある場合は使用
    if (currentUser && getUserTierInfo) {
      const tierInfo = getUserTierInfo(currentUser.tier);
      if (tierInfo.badge) {
        const badgeColor = currentUser.tier === 'expert' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-blue-100 text-blue-700 border-blue-300';
        const icon = currentUser.tier === 'expert' ? Star : Shield;
        const IconComponent = icon;
        
        return (
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
            <IconComponent className="h-3 w-3 mr-1" />
            {tierInfo.badge}
          </div>
        );
      }
    }
    
    // useUserの称号情報がある場合は使用
    if (userHookCurrentUser && userHookCurrentUser.currentTitle) {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
          <Star className="h-3 w-3 mr-1" />
          {userHookCurrentUser.currentTitle}
        </div>
      );
    }
    
    return null;
  };

  // unreadCount はフックから直接取得（ユーザーがログインしていない場合は0）

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative lg:hidden">
          {/* サイドバートグルボタン（モバイル） */}
          <button
            onClick={onSidebarToggle}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50/80 rounded-xl transition-all duration-200"
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* ロゴとタイトル（モバイル） */}
          <div className="flex items-center space-x-3 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-11 w-11 rounded-xl shadow-lg overflow-hidden bg-white ring-1 ring-blue-100 flex items-center justify-center flex-shrink-0">
              <img src={chusapoLogo} alt="チューサポ ロゴ" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent whitespace-nowrap">
                チューサポ
              </h1>
            </div>
          </div>
          
          {/* 右側のアクション（モバイル） */}
          <div className="flex items-center justify-end space-x-2 w-20">
            {user ? (
              <>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50/80 rounded-xl transition-all duration-200"
                  aria-label="通知を開く"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-1 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
                    aria-label="ユーザーメニューを開く"
                  >
                    <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email || 'メールアドレス未設定'}</p>
                          </div>
                          {renderUserBadge()}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{user.role}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          onProfileClick?.();
                        }}
                        className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <UserCircle className="h-4 w-4 mr-3" />
                        プロフィールを見る
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          onEditProfileClick?.();
                        }}
                        className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        設定
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                aria-label="ログイン"
              >
                <User className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* デスクトップ版のレイアウト */}
        <div className="hidden lg:flex justify-between items-center h-20 min-w-0">
          {/* ロゴ */}
          <div className="flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
            <div className="h-12 w-12 xl:h-14 xl:w-14 rounded-2xl shadow-lg overflow-hidden bg-white ring-1 ring-blue-100 flex items-center justify-center flex-shrink-0">
              <img src={chusapoLogo} alt="チューサポ ロゴ" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent whitespace-nowrap">
                チューサポ
              </h1>
            </div>
          </div>

          {/* デスクトップアクション */}
          <div className="flex items-center space-x-2 xl:space-x-4 flex-shrink-0">
            
            {user && (
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 xl:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50/80 rounded-2xl transition-all duration-200"
              >
                <Bell className="h-5 w-5 xl:h-6 xl:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 xl:h-5 xl:w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 xl:space-x-3 p-2 hover:bg-gray-50/80 rounded-2xl transition-all duration-200"
                >
                  <div className="h-8 w-8 xl:h-10 xl:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-4 w-4 xl:h-5 xl:w-5 text-white" />
                  </div>
                  <div className="text-left hidden lg:block xl:block">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      {renderUserBadge()}
                    </div>
                    <p className="text-gray-500 text-xs">{user.role}</p>
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email || 'メールアドレス未設定'}</p>
                        </div>
                        {renderUserBadge()}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{user.role}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        onProfileClick?.();
                      }}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <UserCircle className="h-4 w-4 mr-3" />
                      プロフィールを見る
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        onEditProfileClick?.();
                      }}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      設定
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-xl hover:bg-gray-50/80 transition-all duration-200 hover:scale-105"
                >
                  ログイン
                </button>
                <button
                  onClick={handleSignupClick}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  新規登録
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 通知パネル */}
      <NotificationList
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* 認証モーダル */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onSignupClick={handleSignupClick}
      />
      
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignup={handleSignup}
        onLoginClick={handleLoginClick}
      />
    </header>
  );
};

export default Header;