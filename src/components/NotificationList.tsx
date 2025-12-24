import React from 'react';
import { Bell, MessageCircle, Heart, Award, Info, Check, Trash2, Loader2 } from 'lucide-react';
import { useNotifications, Notification } from '../hooks/useNotifications';

interface NotificationListProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'answer':
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'gratitude':
      return <Heart className="w-5 h-5 text-pink-500" />;
    case 'best_answer':
      return <Award className="w-5 h-5 text-yellow-500" />;
    case 'like':
      return <Heart className="w-5 h-5 text-red-500" />;
    case 'system':
      return <Info className="w-5 h-5 text-gray-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return date.toLocaleDateString('ja-JP');
};

export const NotificationList: React.FC<NotificationListProps> = ({ isOpen = true, onClose, onNotificationClick }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  // isOpenがfalseの場合は何も表示しない
  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-gray-900">通知</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            すべて既読
          </button>
        )}
      </div>

      {/* 通知リスト */}
      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">通知はありません</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.is_read ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                {/* アイコン */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(notification.created_at)}
                  </p>
                </div>

                {/* 未読インジケーター */}
                {!notification.is_read && (
                  <div className="flex-shrink-0 w-2 h-2 bg-brand-500 rounded-full mt-2" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
