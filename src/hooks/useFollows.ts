/**
 * フォロー/フォロワー機能フック
 *
 * 機能:
 * - フォロー状態の確認
 * - フォロー/フォロー解除（楽観更新）
 * - フォロワー数/フォロー中数の取得
 * - フォロワー一覧/フォロー中一覧の取得（ページング対応）
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

/**
 * フォロー関係の型
 */
export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

/**
 * フォロー一覧で表示するユーザー情報
 */
export interface FollowUser {
  id: string;
  name: string;
  avatar_url?: string;
  speciality?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  is_following?: boolean; // 自分がフォローしているか
}

/**
 * フォローカウント
 */
export interface FollowCounts {
  followers_count: number;
  following_count: number;
}

/**
 * 公開設定
 */
export interface FollowPrivacySettings {
  is_followers_list_public: boolean;
  is_following_list_public: boolean;
}

/**
 * ページングパラメータ
 */
export interface PagingParams {
  limit?: number;
  offset?: number;
}

/**
 * フォロー機能フック
 */
export const useFollows = (targetUserId?: string) => {
  const { supabaseUser, isAuthenticated } = useSupabaseAuth();
  
  // 状態
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCounts, setFollowCounts] = useState<FollowCounts>({
    followers_count: 0,
    following_count: 0,
  });
  const [privacySettings, setPrivacySettings] = useState<FollowPrivacySettings>({
    is_followers_list_public: true,
    is_following_list_public: true,
  });
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 自分が対象ユーザーをフォローしているか確認
   */
  const checkIsFollowing = useCallback(async (userId: string) => {
    if (!supabaseUser || !userId || supabaseUser.id === userId) {
      setIsFollowing(false);
      return false;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', supabaseUser.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (fetchError) {
        // テーブルが存在しない場合は静かに失敗
        if (fetchError.code === '42P01') {
          console.log('Follows table not yet created');
          return false;
        }
        console.error('Failed to check follow status:', fetchError);
        return false;
      }

      const following = !!data;
      setIsFollowing(following);
      return following;
    } catch (err) {
      console.error('Check follow error:', err);
      return false;
    }
  }, [supabaseUser]);

  /**
   * フォローカウントと公開設定を取得
   */
  const fetchFollowCounts = useCallback(async (userId: string) => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('followers_count, following_count, is_followers_list_public, is_following_list_public')
        .eq('id', userId)
        .single();

      if (fetchError) {
        // テーブルが存在しない/カラムがない場合は静かに失敗
        if (fetchError.code === '42P01' || fetchError.code === 'PGRST116') {
          console.log('Profile columns not yet created');
          return;
        }
        console.error('Failed to fetch follow counts:', fetchError);
        return;
      }

      if (data) {
        setFollowCounts({
          followers_count: data.followers_count ?? 0,
          following_count: data.following_count ?? 0,
        });
        setPrivacySettings({
          is_followers_list_public: data.is_followers_list_public ?? true,
          is_following_list_public: data.is_following_list_public ?? true,
        });
      }
    } catch (err) {
      console.error('Fetch follow counts error:', err);
    }
  }, []);

  /**
   * フォローする
   */
  const follow = useCallback(async (userId: string) => {
    if (!supabaseUser || !userId || supabaseUser.id === userId) {
      setError('フォローできません');
      return { success: false };
    }

    // 楽観更新
    setIsFollowing(true);
    setFollowCounts(prev => ({
      ...prev,
      followers_count: prev.followers_count, // 対象ユーザーのカウントは変えない（自分のではない）
    }));
    setIsActionLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('follows')
        .insert({
          follower_id: supabaseUser.id,
          following_id: userId,
        });

      if (insertError) {
        // 重複フォローの場合
        if (insertError.code === '23505') {
          setError('すでにフォローしています');
          return { success: false };
        }
        // 自己フォローの場合
        if (insertError.code === '23514') {
          setError('自分自身をフォローすることはできません');
          setIsFollowing(false);
          return { success: false };
        }
        throw insertError;
      }

      // 成功時はカウントを再取得（トリガーで更新されているため）
      await fetchFollowCounts(userId);
      return { success: true };
    } catch (err: any) {
      console.error('Follow error:', err);
      // ロールバック
      setIsFollowing(false);
      setError(err.message || 'フォローに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsActionLoading(false);
    }
  }, [supabaseUser, fetchFollowCounts]);

  /**
   * フォロー解除
   */
  const unfollow = useCallback(async (userId: string) => {
    if (!supabaseUser || !userId) {
      setError('フォロー解除できません');
      return { success: false };
    }

    // 楽観更新
    setIsFollowing(false);
    setIsActionLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', supabaseUser.id)
        .eq('following_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      // 成功時はカウントを再取得（トリガーで更新されているため）
      await fetchFollowCounts(userId);
      return { success: true };
    } catch (err: any) {
      console.error('Unfollow error:', err);
      // ロールバック
      setIsFollowing(true);
      setError(err.message || 'フォロー解除に失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsActionLoading(false);
    }
  }, [supabaseUser, fetchFollowCounts]);

  /**
   * フォロー/フォロー解除をトグル
   */
  const toggleFollow = useCallback(async (userId: string) => {
    if (isFollowing) {
      return await unfollow(userId);
    } else {
      return await follow(userId);
    }
  }, [isFollowing, follow, unfollow]);

  /**
   * フォロワー一覧を取得
   */
  const fetchFollowers = useCallback(async (userId: string, params: PagingParams = {}) => {
    if (!userId) return { data: [], hasMore: false };

    const { limit = 20, offset = 0 } = params;
    setIsLoading(true);
    setError(null);

    try {
      // フォロワー（follower_id）のプロフィールを取得
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select(`
          follower_id,
          created_at,
          follower:follower_id(
            id,
            name,
            avatar_url,
            speciality,
            bio,
            followers_count,
            following_count
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        // RLSで拒否された場合（非公開）
        if (fetchError.code === 'PGRST301' || fetchError.message?.includes('permission denied')) {
          setError('このユーザーのフォロワー一覧は非公開です');
          return { data: [], hasMore: false, isPrivate: true };
        }
        // テーブルが存在しない場合
        if (fetchError.code === '42P01') {
          console.log('Follows table not yet created');
          return { data: [], hasMore: false };
        }
        throw fetchError;
      }

      const followerUsers: FollowUser[] = (data || [])
        .filter(item => item.follower)
        .map(item => {
          const profile = item.follower as any;
          return {
            id: profile.id,
            name: profile.name || 'ユーザー',
            avatar_url: profile.avatar_url,
            speciality: profile.speciality,
            bio: profile.bio,
            followers_count: profile.followers_count || 0,
            following_count: profile.following_count || 0,
          };
        });

      setFollowers(prev => offset === 0 ? followerUsers : [...prev, ...followerUsers]);
      
      return {
        data: followerUsers,
        hasMore: followerUsers.length === limit,
      };
    } catch (err: any) {
      console.error('Fetch followers error:', err);
      setError(err.message || 'フォロワー一覧の取得に失敗しました');
      return { data: [], hasMore: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * フォロー中一覧を取得
   */
  const fetchFollowing = useCallback(async (userId: string, params: PagingParams = {}) => {
    if (!userId) return { data: [], hasMore: false };

    const { limit = 20, offset = 0 } = params;
    setIsLoading(true);
    setError(null);

    try {
      // フォロー中（following_id）のプロフィールを取得
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select(`
          following_id,
          created_at,
          following:following_id(
            id,
            name,
            avatar_url,
            speciality,
            bio,
            followers_count,
            following_count
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        // RLSで拒否された場合（非公開）
        if (fetchError.code === 'PGRST301' || fetchError.message?.includes('permission denied')) {
          setError('このユーザーのフォロー中一覧は非公開です');
          return { data: [], hasMore: false, isPrivate: true };
        }
        // テーブルが存在しない場合
        if (fetchError.code === '42P01') {
          console.log('Follows table not yet created');
          return { data: [], hasMore: false };
        }
        throw fetchError;
      }

      const followingUsers: FollowUser[] = (data || [])
        .filter(item => item.following)
        .map(item => {
          const profile = item.following as any;
          return {
            id: profile.id,
            name: profile.name || 'ユーザー',
            avatar_url: profile.avatar_url,
            speciality: profile.speciality,
            bio: profile.bio,
            followers_count: profile.followers_count || 0,
            following_count: profile.following_count || 0,
          };
        });

      setFollowing(prev => offset === 0 ? followingUsers : [...prev, ...followingUsers]);
      
      return {
        data: followingUsers,
        hasMore: followingUsers.length === limit,
      };
    } catch (err: any) {
      console.error('Fetch following error:', err);
      setError(err.message || 'フォロー中一覧の取得に失敗しました');
      return { data: [], hasMore: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 公開設定を更新
   */
  const updatePrivacySettings = useCallback(async (settings: Partial<FollowPrivacySettings>) => {
    if (!supabaseUser) {
      setError('ログインが必要です');
      return { success: false };
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(settings)
        .eq('id', supabaseUser.id);

      if (updateError) {
        throw updateError;
      }

      setPrivacySettings(prev => ({ ...prev, ...settings }));
      return { success: true };
    } catch (err: any) {
      console.error('Update privacy settings error:', err);
      setError(err.message || '設定の更新に失敗しました');
      return { success: false, error: err.message };
    }
  }, [supabaseUser]);

  /**
   * 対象ユーザーが変わったときにデータを取得
   */
  useEffect(() => {
    if (targetUserId) {
      checkIsFollowing(targetUserId);
      fetchFollowCounts(targetUserId);
    }
  }, [targetUserId, checkIsFollowing, fetchFollowCounts]);

  /**
   * 自分のプロフィールの公開設定を取得
   */
  useEffect(() => {
    if (supabaseUser && !targetUserId) {
      fetchFollowCounts(supabaseUser.id);
    }
  }, [supabaseUser, targetUserId, fetchFollowCounts]);

  return {
    // 状態
    isFollowing,
    followCounts,
    privacySettings,
    followers,
    following,
    isLoading,
    isActionLoading,
    error,
    isAuthenticated,
    currentUserId: supabaseUser?.id,

    // アクション
    follow,
    unfollow,
    toggleFollow,
    fetchFollowers,
    fetchFollowing,
    updatePrivacySettings,
    checkIsFollowing,
    fetchFollowCounts,

    // ユーティリティ
    isOwnProfile: supabaseUser?.id === targetUserId,
    canViewFollowers: privacySettings.is_followers_list_public || supabaseUser?.id === targetUserId,
    canViewFollowing: privacySettings.is_following_list_public || supabaseUser?.id === targetUserId,
  };
};

export default useFollows;

