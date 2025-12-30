import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { devWarn } from '../lib/logger';

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
  // MBTI診断結果
  mbtiType?: string | null;
  mbtiTitle?: string | null;
  showMbtiOnProfile?: boolean;
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
  workplace: '総合病院',
  mbtiType: null,
  mbtiTitle: null,
  showMbtiOnProfile: false
};

// 認証ユーザー情報の型（循環依存を避けるため独自定義）
interface AuthUserInfo {
  id: string;
  name: string;
  role: string;
}

// プロフィール設定更新イベント名
const PROFILE_SETTINGS_UPDATE_EVENT = 'profileSettingsUpdated';

type DbProfileRow = {
  id: string;
  name: string | null;
  role: string | null;
  bio: string | null;
  speciality: string | null;
  experience: string | null;
  workplace: string | null;
  location: string | null;
  website: string | null;
  social_links: Record<string, string | undefined> | null;
  avatar_url: string | null;
  background_url: string | null;
  avatar_gradient: string | null;
  background_gradient: string | null;
  mbti_type: string | null;
  mbti_title: string | null;
  show_mbti_on_profile: boolean | null;
};

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

function dbProfileToSettings(profile: DbProfileRow, authUser: AuthUserInfo): ProfileSettings {
  return {
    ...DEFAULT_SETTINGS,
    // DB優先（null/空はフォールバック）
    name: profile.name || authUser.name || DEFAULT_SETTINGS.name,
    role: profile.role || authUser.role || DEFAULT_SETTINGS.role,
    bio: profile.bio ?? DEFAULT_SETTINGS.bio,
    speciality: profile.speciality ?? DEFAULT_SETTINGS.speciality,
    experience: profile.experience ?? DEFAULT_SETTINGS.experience,
    workplace: profile.workplace ?? DEFAULT_SETTINGS.workplace,
    location: profile.location ?? DEFAULT_SETTINGS.location,
    website: profile.website ?? DEFAULT_SETTINGS.website,
    avatarImage: profile.avatar_url ?? null,
    backgroundImage: profile.background_url ?? null,
    avatarGradient: profile.avatar_gradient ?? DEFAULT_SETTINGS.avatarGradient,
    backgroundGradient: profile.background_gradient ?? DEFAULT_SETTINGS.backgroundGradient,
    socialLinks: profile.social_links ?? undefined,
    mbtiType: profile.mbti_type ?? null,
    mbtiTitle: profile.mbti_title ?? null,
    showMbtiOnProfile: profile.show_mbti_on_profile ?? false
  };
}

function settingsToDbPatch(settings: Partial<ProfileSettings>): Partial<DbProfileRow> {
  const patch: Partial<DbProfileRow> = {};

  if ('name' in settings) patch.name = settings.name ?? null;
  if ('role' in settings) patch.role = settings.role ?? null;
  if ('bio' in settings) patch.bio = settings.bio ?? null;
  if ('speciality' in settings) patch.speciality = settings.speciality ?? null;
  if ('experience' in settings) patch.experience = settings.experience ?? null;
  if ('workplace' in settings) patch.workplace = settings.workplace ?? null;
  if ('location' in settings) patch.location = settings.location ?? null;
  if ('website' in settings) patch.website = settings.website ?? null;
  if ('socialLinks' in settings) patch.social_links = settings.socialLinks ?? null;
  if ('avatarGradient' in settings) patch.avatar_gradient = settings.avatarGradient ?? null;
  if ('backgroundGradient' in settings) patch.background_gradient = settings.backgroundGradient ?? null;
  if ('avatarImage' in settings) patch.avatar_url = settings.avatarImage ?? null;
  if ('backgroundImage' in settings) patch.background_url = settings.backgroundImage ?? null;
  if ('mbtiType' in settings) patch.mbti_type = settings.mbtiType ?? null;
  if ('mbtiTitle' in settings) patch.mbti_title = settings.mbtiTitle ?? null;
  if ('showMbtiOnProfile' in settings) patch.show_mbti_on_profile = settings.showMbtiOnProfile ?? false;

  return patch;
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string; ext: string } {
  const matches = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URL');
  }

  const contentType = matches[1];
  const base64 = matches[2];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const extFromType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };

  const ext = extFromType[contentType] || 'png';
  return { blob: new Blob([bytes], { type: contentType }), contentType, ext };
}

async function uploadProfileImage(params: {
  userId: string;
  kind: 'avatar' | 'background';
  dataUrl: string;
}): Promise<string> {
  const { blob, contentType, ext } = dataUrlToBlob(params.dataUrl);
  const objectPath = `${params.userId}/${params.kind}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(objectPath, blob, {
      contentType,
      upsert: false,
      cacheControl: '3600'
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error('Failed to get public URL');
  }

  return data.publicUrl;
}

export const useProfileSettings = (authUser?: AuthUserInfo | null) => {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);
  const [initialized, setInitialized] = useState(false);

  // 初期化とauthUser変更時の設定読み込み
  useEffect(() => {
    const loaded = loadSettingsFromStorage(authUser);
    setSettings(loaded);
    setInitialized(true);

    // ログイン時はSupabaseから最新プロフィールを同期（失敗時はLocalStorageのまま）
    if (!authUser) return;

    const userStorageKey = `profileSettings_${authUser.id}`;
    const sync = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(
            'id,name,role,bio,speciality,experience,workplace,location,website,social_links,avatar_url,background_url,avatar_gradient,background_gradient,mbti_type,mbti_title,show_mbti_on_profile'
          )
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const next = dbProfileToSettings(data as DbProfileRow, authUser);
          setSettings(next);
          localStorage.setItem(userStorageKey, JSON.stringify(next));
        } else {
          // 念のためプロファイルが無い場合は作成（トリガー未設定環境向け）
          await supabase.from('profiles').upsert(
            {
              id: authUser.id,
              name: authUser.name,
              role: authUser.role
            },
            { onConflict: 'id' }
          );
        }
      } catch (e) {
        devWarn('Supabaseプロフィール同期に失敗しました（LocalStorageを使用）:', e);
      }
    };

    void sync();
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
  const updateSettings = useCallback(
    async (newSettings: Partial<ProfileSettings>) => {
      const storageKey = authUser ? `profileSettings_${authUser.id}` : 'profileSettings';

      // まずはローカルに反映（体感を速く）
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });

      // ログイン中はSupabaseへ永続化
      if (authUser) {
        try {
          const payload: Partial<ProfileSettings> = { ...newSettings };

          // dataURL なら Storage にアップロードしてURLへ変換
          if (typeof payload.avatarImage === 'string' && payload.avatarImage.startsWith('data:')) {
            payload.avatarImage = await uploadProfileImage({
              userId: authUser.id,
              kind: 'avatar',
              dataUrl: payload.avatarImage
            });
          }

          if (
            typeof payload.backgroundImage === 'string' &&
            payload.backgroundImage.startsWith('data:')
          ) {
            payload.backgroundImage = await uploadProfileImage({
              userId: authUser.id,
              kind: 'background',
              dataUrl: payload.backgroundImage
            });
          }

          const dbPatch = settingsToDbPatch(payload);

          const { data, error } = await supabase
            .from('profiles')
            .upsert(
              {
                id: authUser.id,
                ...dbPatch,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' }
            )
            .select(
              'id,name,role,bio,speciality,experience,workplace,location,website,social_links,avatar_url,background_url,avatar_gradient,background_gradient,mbti_type,mbti_title,show_mbti_on_profile'
            )
            .maybeSingle();

          if (error) throw error;
          if (data) {
            const next = dbProfileToSettings(data as DbProfileRow, authUser);
            setSettings(next);
            localStorage.setItem(storageKey, JSON.stringify(next));
          }
        } catch (e) {
          devWarn('Supabaseプロフィール保存に失敗しました（LocalStorageに保存済み）:', e);
        }
      }

      // 他のコンポーネントに更新を通知（次のイベントループで実行）
      setTimeout(() => {
        window.dispatchEvent(new Event(PROFILE_SETTINGS_UPDATE_EVENT));
      }, 0);
    },
    [authUser?.id]
  );

  return {
    settings,
    updateSettings
  };
};