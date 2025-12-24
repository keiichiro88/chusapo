import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

/**
 * 通知の型定義
 */
export interface Notification {
  id: string;
  user_id: string;
  type: 'answer' | 'gratitude' | 'best_answer' | 'like' | 'system';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  related_question_id?: string;
  related_answer_id?: string;
  from_user_id?: string;
  from_user?: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
}

/**
 * 通知管理フック
 */
export const useNotifications = () => {
  const { supabaseUser, isLoading: authLoading } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 通知を取得
   */
  const fetchNotifications = useCallback(async () => {
    if (!supabaseUser) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select(`
          *,
          from_user:from_user_id(name, avatar_url)
        `)
        .eq('user_id', supabaseUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        // テーブルが存在しない場合（404）は静かに失敗
        if (fetchError.code === '42P01' || fetchError.message?.includes('404')) {
          console.log('Notifications table not yet created');
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        console.error('Failed to fetch notifications:', fetchError);
        setError('通知の取得に失敗しました');
        return;
      }

      const notificationList = data || [];
      setNotifications(notificationList);
      setUnreadCount(notificationList.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Notification fetch error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser]);

  /**
   * 通知を既読にする
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!supabaseUser) return;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', supabaseUser.id);

      if (updateError) {
        console.error('Failed to mark as read:', updateError);
        return;
      }

      // ローカル状態を更新
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, [supabaseUser]);

  /**
   * すべての通知を既読にする
   */
  const markAllAsRead = useCallback(async () => {
    if (!supabaseUser) return;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', supabaseUser.id)
        .eq('is_read', false);

      if (updateError) {
        console.error('Failed to mark all as read:', updateError);
        return;
      }

      // ローカル状態を更新
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  }, [supabaseUser]);

  /**
   * 通知を削除
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!supabaseUser) return;

    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', supabaseUser.id);

      if (deleteError) {
        console.error('Failed to delete notification:', deleteError);
        return;
      }

      // ローカル状態を更新
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  }, [supabaseUser, notifications]);

  /**
   * リアルタイム通知の購読
   */
  useEffect(() => {
    if (!supabaseUser) return;

    // 初期データ取得
    fetchNotifications();

    // リアルタイム購読
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabaseUser.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

export default useNotifications;
