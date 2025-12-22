export interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  authorId?: string; // 投稿者のユーザーID
  timeAgo: string;
  likes: number;
  answers: number;
  tags: string[];
  hasAcceptedAnswer: boolean;
  createdAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  author: string;
  authorRole: string;
  authorId?: string; // 投稿者のユーザーID
  gratitude: number; // 感謝の数
  isAccepted: boolean;
  createdAt: Date;
}

export interface Category {
  title: string;
  description: string;
  icon: any;
  questionCount: number;
  color: string;
}

export interface Stats {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: any;
}

// 感謝システム関連の型定義
export interface Gratitude {
  id: string;
  answerId: string;
  fromUserId: string;  // 感謝を贈った人
  toUserId: string;    // 感謝を受けた人
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementType: 'badge' | 'shield' | 'crown';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  title: string;
  gratitudeCount: number;
  achievedAt: Date;
}

export interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
  totalGratitude: number;
  currentTitle: string;
  notificationSettings: {
    receiveNotifications: boolean;
    soundNotifications: boolean;
  };
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}