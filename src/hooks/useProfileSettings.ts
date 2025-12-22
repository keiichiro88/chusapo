import { useState, useEffect } from 'react';

export interface ProfileSettings {
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
}

const DEFAULT_SETTINGS: ProfileSettings = {
  avatarImage: null,
  backgroundImage: null,
  avatarGradient: 'from-purple-500 to-pink-500',
  backgroundGradient: 'from-blue-400 via-blue-500 to-blue-600',
  name: '田中 美咲',
  bio: '穿刺技術の向上に情熱を注いでいます。特に高齢者や小児への安全な穿刺手技について研究しています。',
  role: '循環器内科医',
  location: '東京都',
  website: '',
  speciality: '循環器内科',
  experience: '10年目',
  workplace: '総合病院'
};

export const useProfileSettings = () => {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    const savedSettings = localStorage.getItem('profileSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse profile settings:', error);
      }
    }
  }, []);

  // 設定を保存
  const updateSettings = (newSettings: Partial<ProfileSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('profileSettings', JSON.stringify(updated));
  };

  return {
    settings,
    updateSettings
  };
};