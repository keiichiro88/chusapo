import React from 'react';
import { 
  Home, 
  Plus, 
  MessageCircle, 
  User,
  ArrowLeft
} from 'lucide-react';

interface MobileBottomNavigationProps {
  activeSection: string;
  showQuestionForm?: boolean;
  onNavigate: (section: string) => void;
  onQuestionFormOpen: () => void;
  onProfileClick: () => void;
  onQuestionFormClose: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  activeSection,
  showQuestionForm = false,
  onNavigate,
  onQuestionFormOpen,
  onProfileClick,
  onQuestionFormClose,
  onGoBack,
  canGoBack = true
}) => {
  const navItems = [
    {
      id: 'back',
      icon: ArrowLeft,
      label: '戻る',
      onClick: () => {
        if (onGoBack) {
          onGoBack();
        } else {
          // フォールバック: ブラウザの履歴を使って前のページに戻る
          window.history.back();
        }
      },
      isBack: true,
      disabled: !canGoBack
    },
    {
      id: 'home',
      icon: Home,
      label: 'ホーム',
      onClick: () => {
        onQuestionFormClose();
        onNavigate('home');
      }
    },
    {
      id: 'question-form',
      icon: Plus,
      label: '質問投稿',
      onClick: () => {
        onQuestionFormClose(); // 他のモーダルを閉じる
        onNavigate('question-form');
        setTimeout(() => {
          onQuestionFormOpen();
        }, 100);
      },
      isSpecial: true
    },
    {
      id: 'answer-questions',
      icon: MessageCircle,
      label: '質問に回答',
      onClick: () => {
        onQuestionFormClose();
        onNavigate('answer-questions');
      }
    },
    {
      id: 'profile',
      icon: User,
      label: 'プロフィール',
      onClick: () => {
        onQuestionFormClose();
        onNavigate('profile'); // handleNavigateを呼ぶことで他のモーダルも閉じる
        onProfileClick();
      }
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-50/95 backdrop-blur-xl border-t border-gray-300/50 z-50 shadow-2xl">
      <div className="flex items-center justify-evenly px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          // アクティブ状態の判定
          let isActive = false;
          if (item.id === 'question-form') {
            // 質問投稿ボタンは質問フォームが開いている時にアクティブ
            isActive = showQuestionForm;
          } else {
            // その他のボタンは質問フォームが閉じている時かつ該当セクションの時にアクティブ
            isActive = !showQuestionForm && activeSection === item.id;
          }
          
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center space-y-1 p-2 rounded-2xl transition-all duration-200 flex-1 ${
                item.disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : item.isBack
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    : isActive
                      ? 'bg-blue-50 text-blue-600 scale-105'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              disabled={item.disabled}
              title={item.label}
            >
              {/* 質問投稿ボタンの特別な＋アイコンデザイン */}
              {item.isSpecial ? (
                <div className="relative">
                  <div className={`h-6 w-6 border-2 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-400'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-600'
                    }`} />
                  </div>
                </div>
              ) : (
                <Icon className="h-5 w-5 transition-transform duration-200" />
              )}
              
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
              
              {/* アクティブ状態のインジケーター（戻るボタンには表示しない） */}
              {isActive && !item.isBack && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* セーフエリア対応 */}
      <div className="h-safe-area-inset-bottom bg-gray-50/95"></div>
    </nav>
  );
};

export default MobileBottomNavigation;