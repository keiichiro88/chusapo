import { useState, useEffect, useCallback } from 'react';

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

// 認証ユーザー情報の型（循環依存を避けるため独自定義）
interface AuthUserInfo {
  id: string;
  name: string;
  role: string;
}

// プロフィール設定更新イベント名
const PROFILE_SETTINGS_UPDATE_EVENT = 'profileSettingsUpdated';

// LocalStorageから設定を読み込むヘルパー関数
const loadSettingsFromStorage = (authUser?: AuthUserInfo | null): ProfileSettings => {
  if (authUser) {
    const userStorageKey = `profileSettings_${authUser.id}`;
    const savedSettings = localStorage.getItem(userStorageKey);
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { 
          ...DEFAULT_SETTINGS, 
          ...parsed,
          name: parsed.name || authUser.name || DEFAULT_SETTINGS.name,
          role: parsed.role || authUser.role || DEFAULT_SETTINGS.role
        };
      } catch (error) {
        console.error('Failed to parse profile settings:', error);
        return {
          ...DEFAULT_SETTINGS,
          name: authUser.name,
          role: authUser.role
        };
      }
    } else {
      return {
        ...DEFAULT_SETTINGS,
        name: authUser.name,
        role: authUser.role
      };
    }
  } else {
    const savedSettings = localStorage.getItem('profileSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (error) {
        console.error('Failed to parse profile settings:', error);
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }
};

export const useProfileSettings = (authUser?: AuthUserInfo | null) => {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);
  const [initialized, setInitialized] = useState(false);

  // 初期化とauthUser変更時の設定読み込み
  useEffect(() => {
    const loaded = loadSettingsFromStorage(authUser);
    setSettings(loaded);
    setInitialized(true);
  }, [authUser?.id]);

  // 他のコンポーネントからの更新を監視
  useEffect(() => {
    if (!initialized) return;

    const handleStorageUpdate = () => {
      const loaded = loadSettingsFromStorage(authUser);
      setSettings(loaded);
    };

    // カスタムイベントを監視
    window.addEventListener(PROFILE_SETTINGS_UPDATE_EVENT, handleStorageUpdate);
    
    // storageイベントも監視（他のタブからの変更用）
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener(PROFILE_SETTINGS_UPDATE_EVENT, handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [authUser?.id, initialized]);

  // 設定を保存
  const updateSettings = useCallback((newSettings: Partial<ProfileSettings>) => {
    const storageKey = authUser ? `profileSettings_${authUser.id}` : 'profileSettings';
    
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    
    // 他のコンポーネントに更新を通知（次のイベントループで実行）
    setTimeout(() => {
      window.dispatchEvent(new Event(PROFILE_SETTINGS_UPDATE_EVENT));
    }, 0);
  }, [authUser?.id]);

  return {
    settings,
    updateSettings
  };
};