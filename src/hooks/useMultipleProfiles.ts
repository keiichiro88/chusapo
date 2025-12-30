import { useState, useEffect } from 'react';

export interface UserProfile {
  avatarImage: string | null;
  backgroundImage: string | null;
  avatarGradient: string;
  backgroundGradient: string;
  name: string;
  bio: string;
  role: string;
  location: string;
  website: string;
  speciality: string;
  experience: string;
  workplace: string;
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  // MBTI診断結果（プロフィール表示用：デモ/実ユーザー共通の型に揃える）
  mbtiType?: string | null;
  mbtiTitle?: string | null;
  showMbtiOnProfile?: boolean;
}

// デモユーザーのプロフィールデータ
const DEMO_PROFILES: Record<string, UserProfile> = {
  '田中 美咲': {
    avatarImage: null,
    backgroundImage: null,
    avatarGradient: 'from-purple-500 to-pink-500',
    backgroundGradient: 'from-blue-400 via-blue-500 to-blue-600',
    name: '田中 美咲',
    bio: '穿刺技術の向上に情熱を注いでいます。特に高齢者や小児への安全な穿刺手技について研究しています。',
    role: '循環器内科医',
    location: '東京都',
    website: 'https://cardiology-clinic.example.jp',
    speciality: '循環器内科',
    experience: '10年目',
    workplace: '総合病院'
  },
  '佐藤 健太': {
    avatarImage: null,
    backgroundImage: null,
    avatarGradient: 'from-blue-500 to-indigo-600',
    backgroundGradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
    name: '佐藤 健太',
    bio: '救急外来での静脈アクセス確保を専門としています。困難症例への穿刺技術改善に日々取り組んでいます。',
    role: '救急科医',
    location: '神奈川県',
    website: 'https://emergency-med.example.jp',
    speciality: '救急医学',
    experience: '7-10年目',
    workplace: '大学病院'
  },
  '山本 美沙': {
    avatarImage: null,
    backgroundImage: null,
    avatarGradient: 'from-orange-500 to-red-600',
    backgroundGradient: 'from-purple-400 via-purple-500 to-purple-600',
    name: '山本 美沙',
    bio: '血管外科専門医として、困難な血管アクセスケースに対する最新技術と知見を共有しています。超音波ガイド下穿刺のエキスパートです。',
    role: '血管外科医',
    location: '大阪府',
    website: 'https://vascular-surgery.example.jp',
    speciality: '血管外科',
    experience: '15年目',
    workplace: '専門病院'
  },
  '山田 花子': {
    avatarImage: null,
    backgroundImage: null,
    avatarGradient: 'from-emerald-500 to-teal-600',
    backgroundGradient: 'from-pink-400 via-pink-500 to-pink-600',
    name: '山田 花子',
    bio: 'ICUでの中心静脈カテーテル挿入や動脈穿刺を得意としています。安全で確実な穿刺技術の指導も行っています。',
    role: '看護師長',
    location: '大阪府',
    website: '',
    speciality: '集中治療看護',
    experience: '15年以上',
    workplace: '専門病院'
  },
  '鈴木 健一': {
    avatarImage: null,
    backgroundImage: null,
    avatarGradient: 'from-cyan-500 to-blue-600',
    backgroundGradient: 'from-green-400 via-green-500 to-green-600',
    name: '鈴木 健一',
    bio: '長年の看護経験を活かし、新人看護師への穿刺技術指導を担当しています。患者さんに優しい穿刺を心がけています。',
    role: '看護師長',
    location: '千葉県',
    website: '',
    speciality: '一般内科',
    experience: '20年以上',
    workplace: '総合病院'
  },
  '田村 恵子': {
    avatarImage: null,
    backgroundImage: null,
    avatarGradient: 'from-purple-500 to-pink-600',
    backgroundGradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    name: '田村 恵子',
    bio: '小児への穿刺技術に特化し、子どもたちの不安を最小限にする工夫を研究しています。プレパレーションの専門家です。',
    role: '小児科看護師',
    location: '福岡県',
    website: '',
    speciality: '小児科',
    experience: '8年目',
    workplace: '小児専門病院'
  }
};

export const useMultipleProfiles = () => {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(DEMO_PROFILES);

  // ローカルストレージから追加のプロフィールを読み込み
  useEffect(() => {
    const savedProfiles = localStorage.getItem('userProfiles');
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        setProfiles({ ...DEMO_PROFILES, ...parsed });
      } catch (error) {
        console.error('Failed to parse user profiles:', error);
      }
    }
  }, []);

  // 特定ユーザーのプロフィールを取得
  const getUserProfile = (userName: string): UserProfile | null => {
    return profiles[userName] || null;
  };

  // プロフィールを更新
  const updateUserProfile = (userName: string, updatedProfile: Partial<UserProfile>) => {
    const updated = {
      ...profiles,
      [userName]: { ...profiles[userName], ...updatedProfile }
    };
    setProfiles(updated);
    
    // デモプロフィール以外のみローカルストレージに保存
    const customProfiles = { ...updated };
    Object.keys(DEMO_PROFILES).forEach(key => {
      delete customProfiles[key];
    });
    localStorage.setItem('userProfiles', JSON.stringify(customProfiles));
  };

  // 全ユーザーのリストを取得
  const getAllUsers = (): string[] => {
    return Object.keys(profiles);
  };

  return {
    profiles,
    getUserProfile,
    updateUserProfile,
    getAllUsers
  };
};