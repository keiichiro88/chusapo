import { useState, useEffect } from 'react';
import { Gratitude, UserAchievement, User } from '../types';

const GRATITUDE_STORAGE_KEY = 'medconsult_gratitudes';
const ACHIEVEMENTS_STORAGE_KEY = 'medconsult_achievements';
const USERS_KEY = 'medconsult_users';

// マイルストーン定義
const MILESTONES = [
  { count: 1, title: '初回貢献者', type: 'badge' as const, level: 'bronze' as const },
  { count: 10, title: '頼れるアドバイザー', type: 'shield' as const, level: 'bronze' as const },
  { count: 100, title: '信頼される専門家', type: 'shield' as const, level: 'silver' as const },
  { count: 500, title: 'コミュニティの柱', type: 'crown' as const, level: 'silver' as const },
  { count: 1000, title: 'ゴールドエキスパート', type: 'shield' as const, level: 'gold' as const },
  { count: 5000, title: 'マスタープロフェッショナル', type: 'crown' as const, level: 'gold' as const },
  { count: 10000, title: 'レジェンドマスター', type: 'shield' as const, level: 'platinum' as const },
  { count: 50000, title: '殿堂入り専門家', type: 'crown' as const, level: 'platinum' as const },
];

export const useGratitude = () => {
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [givenGratitudes, setGivenGratitudes] = useState<Set<string>>(new Set());

  // LocalStorageからデータを読み込む
  useEffect(() => {
    const loadGratitudes = () => {
      try {
        const saved = localStorage.getItem(GRATITUDE_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const gratitudesWithDates = parsed.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt)
          }));
          setGratitudes(gratitudesWithDates);
          
          // 贈った感謝のセットを作成（現在のユーザーIDが必要なので、ここでは空のSetを設定）
          setGivenGratitudes(new Set());
        }
      } catch (error) {
        console.error('感謝データの読み込みに失敗しました:', error);
      }
    };

    const loadAchievements = () => {
      try {
        const saved = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const achievementsWithDates = parsed.map((a: any) => ({
            ...a,
            achievedAt: new Date(a.achievedAt)
          }));
          setAchievements(achievementsWithDates);
        }
      } catch (error) {
        console.error('実績データの読み込みに失敗しました:', error);
      }
    };

    loadGratitudes();
    loadAchievements();
  }, []);

  // ユーザーの感謝統計を更新
  const updateUserStats = (userId: string, newGratitudeCount: number, newTitle: string) => {
    try {
      const savedUsers = localStorage.getItem(USERS_KEY);
      if (savedUsers) {
        const users: User[] = JSON.parse(savedUsers);
        const updatedUsers = users.map(user => 
          user.id === userId 
            ? { ...user, totalGratitude: newGratitudeCount, currentTitle: newTitle }
            : user
        );
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      }
    } catch (error) {
      console.error('ユーザー統計の更新に失敗しました:', error);
    }
  };

  // 感謝をトグル（追加/削除）
  const giveGratitude = (answerId: string, fromUserId: string, toUserId: string) => {
    const isCurrentlyGiven = gratitudes.some(g => g.answerId === answerId && g.fromUserId === fromUserId);
    
    if (isCurrentlyGiven) {
      // 感謝を取り消す
      const updatedGratitudes = gratitudes.filter(g => 
        !(g.answerId === answerId && g.fromUserId === fromUserId)
      );
      setGratitudes(updatedGratitudes);
      
      localStorage.setItem(GRATITUDE_STORAGE_KEY, JSON.stringify(updatedGratitudes));
      
      // マイルストーンチェック（感謝数減少）
      checkMilestones(toUserId, updatedGratitudes);
      
      return false; // 取り消したことを示す
    } else {
      // 感謝を追加
      const newGratitude: Gratitude = {
        id: Date.now().toString(),
        answerId,
        fromUserId,
        toUserId,
        createdAt: new Date()
      };

      const updatedGratitudes = [...gratitudes, newGratitude];
      setGratitudes(updatedGratitudes);
      
      localStorage.setItem(GRATITUDE_STORAGE_KEY, JSON.stringify(updatedGratitudes));

      // 感謝通知を作成（window上のグローバル関数を使用）
      try {
        const savedUsers = localStorage.getItem(USERS_KEY);
        if (savedUsers) {
          const users: User[] = JSON.parse(savedUsers);
          const fromUser = users.find(u => u.id === fromUserId);
          if (fromUser && (window as any).createGratitudeNotification) {
            (window as any).createGratitudeNotification(fromUser.name, toUserId);
          }
        }
      } catch (error) {
        console.error('感謝通知の送信に失敗しました:', error);
      }

      // マイルストーンチェック（感謝数増加）
      checkMilestones(toUserId, updatedGratitudes);
      
      return true; // 追加したことを示す
    }
  };

  // マイルストーンの達成チェック
  const checkMilestones = (userId: string, currentGratitudes: Gratitude[]) => {
    const userGratitudeCount = getUserGratitudeCount(userId, currentGratitudes);
    
    // 新しく達成したマイルストーンをチェック
    const newAchievements: UserAchievement[] = [];
    
    MILESTONES.forEach(milestone => {
      if (userGratitudeCount >= milestone.count) {
        // 既に達成済みかチェック
        const alreadyAchieved = achievements.some(a => 
          a.userId === userId && a.gratitudeCount === milestone.count
        );
        
        if (!alreadyAchieved) {
          const achievement: UserAchievement = {
            id: `${userId}_${milestone.count}_${Date.now()}`,
            userId,
            achievementType: milestone.type,
            level: milestone.level,
            title: milestone.title,
            gratitudeCount: milestone.count,
            achievedAt: new Date()
          };
          newAchievements.push(achievement);
        }
      }
    });

    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements];
      setAchievements(updatedAchievements);
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updatedAchievements));
      
      // ユーザー統計を更新（最高の称号を設定）
      const topAchievement = newAchievements.sort((a, b) => b.gratitudeCount - a.gratitudeCount)[0];
      updateUserStats(userId, userGratitudeCount, topAchievement.title);
      
      // 称号獲得通知を作成
      newAchievements.forEach(achievement => {
        if ((window as any).createAchievementNotification) {
          (window as any).createAchievementNotification(achievement.title, userId);
        }
        console.log(`🎉 新しい称号を獲得しました: ${achievement.title}`);
      });
    }
    
    // マイルストーンがなくても感謝数は更新
    const currentTopTitle = getUserTopTitle(userId);
    updateUserStats(userId, userGratitudeCount, currentTopTitle);
  };

  // ユーザーの総感謝数を取得
  const getUserGratitudeCount = (userId: string, currentGratitudes?: Gratitude[]) => {
    const gratitudesToUse = currentGratitudes || gratitudes;
    return gratitudesToUse.filter(g => g.toUserId === userId).length;
  };

  // 回答が感謝済みかチェック（現在のユーザーIDが必要）
  const isGratitudeGiven = (answerId: string, currentUserId?: string) => {
    if (!currentUserId) return false;
    return gratitudes.some(g => g.answerId === answerId && g.fromUserId === currentUserId);
  };

  // ユーザーの最高称号を取得
  const getUserTopTitle = (userId: string) => {
    const userAchievements = achievements.filter(a => a.userId === userId);
    if (userAchievements.length === 0) return '';
    
    // 感謝数の多い順でソートして最高称号を取得
    const topAchievement = userAchievements.sort((a, b) => b.gratitudeCount - a.gratitudeCount)[0];
    return topAchievement.title;
  };

  // ユーザーの実績一覧を取得
  const getUserAchievements = (userId: string) => {
    return achievements
      .filter(a => a.userId === userId)
      .sort((a, b) => b.gratitudeCount - a.gratitudeCount);
  };

  return {
    gratitudes,
    achievements,
    giveGratitude,
    getUserGratitudeCount,
    isGratitudeGiven,
    getUserTopTitle,
    getUserAchievements
  };
};