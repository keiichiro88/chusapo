import { useState, useEffect } from 'react';

interface ProfileView {
  id: string;
  viewedUserId: string;
  viewerUserId?: string; // 匿名の場合はundefined
  viewedAt: Date;
  isAnonymous: boolean;
}

interface ProfileViewStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

const STORAGE_KEY = 'medconsult_profile_views';

export const useProfileViews = () => {
  const [profileViews, setProfileViews] = useState<ProfileView[]>([]);

  // ローカルストレージから閲覧履歴を読み込む
  useEffect(() => {
    const loadProfileViews = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const viewsWithDates = parsed.map((view: any) => ({
            ...view,
            viewedAt: new Date(view.viewedAt)
          }));
          setProfileViews(viewsWithDates);
        }
      } catch (error) {
        console.error('プロフィール閲覧履歴の読み込みに失敗しました:', error);
      }
    };

    loadProfileViews();
  }, []);

  // プロフィール閲覧を記録
  const recordProfileView = (viewedUserId: string, viewerUserId?: string) => {
    // 同じユーザーの重複閲覧を防ぐ（24時間以内）
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const existingView = profileViews.find(view => 
      view.viewedUserId === viewedUserId &&
      view.viewerUserId === viewerUserId &&
      view.viewedAt > oneDayAgo
    );

    if (existingView) {
      return; // 24時間以内の重複閲覧はカウントしない
    }

    const newView: ProfileView = {
      id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      viewedUserId,
      viewerUserId,
      viewedAt: now,
      isAnonymous: true // 常に匿名
    };

    const updatedViews = [...profileViews, newView];
    setProfileViews(updatedViews);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedViews));
  };

  // ユーザーのプロフィール閲覧統計を取得
  const getProfileViewStats = (userId: string): ProfileViewStats => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const userViews = profileViews.filter(view => view.viewedUserId === userId);

    return {
      today: userViews.filter(view => view.viewedAt >= todayStart).length,
      thisWeek: userViews.filter(view => view.viewedAt >= weekStart).length,
      thisMonth: userViews.filter(view => view.viewedAt >= monthStart).length,
      total: userViews.length
    };
  };

  // 最近のプロフィール閲覧履歴を取得（数のみ、匿名）
  const getRecentProfileViews = (userId: string, days: number = 7) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return profileViews
      .filter(view => 
        view.viewedUserId === userId && 
        view.viewedAt >= cutoffDate
      )
      .length;
  };

  // 日別の閲覧数を取得（グラフ表示用）
  const getDailyViewCounts = (userId: string, days: number = 30) => {
    const now = new Date();
    const dailyCounts: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const count = profileViews.filter(view =>
        view.viewedUserId === userId &&
        view.viewedAt >= dayStart &&
        view.viewedAt < dayEnd
      ).length;

      dailyCounts.push({ date: dateStr, count });
    }

    return dailyCounts;
  };

  // プロフィール閲覧数ランキング（全ユーザー）
  const getPopularProfiles = (limit: number = 10) => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 過去1週間の閲覧数でランキング
    const viewCounts = profileViews
      .filter(view => view.viewedAt >= weekStart)
      .reduce((acc, view) => {
        acc[view.viewedUserId] = (acc[view.viewedUserId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(viewCounts)
      .map(([userId, count]) => ({ userId, viewCount: count }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  };

  return {
    recordProfileView,
    getProfileViewStats,
    getRecentProfileViews,
    getDailyViewCounts,
    getPopularProfiles
  };
};