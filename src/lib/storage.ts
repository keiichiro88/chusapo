import { supabase } from './supabase';

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * 画像アップロードの結果
 */
interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * ファイルのバリデーション
 */
const validateFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return '対応していない画像形式です。JPEG、PNG、GIF、WebP のみ対応しています。';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'ファイルサイズが大きすぎます。5MB以下の画像を選択してください。';
  }
  return null;
};

/**
 * ユニークなファイル名を生成
 */
const generateFileName = (userId: string, originalName: string): string => {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}-${random}.${extension}`;
};

/**
 * プロフィール画像をアップロード
 */
export const uploadAvatar = async (userId: string, file: File): Promise<UploadResult> => {
  try {
    // バリデーション
    const validationError = validateFile(file);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const fileName = generateFileName(userId, file.name);

    // 既存の画像を削除（オプション）
    await deleteOldAvatars(userId);

    // アップロード
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'アップロードに失敗しました。' };
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    console.error('Upload exception:', err);
    return { success: false, error: '予期しないエラーが発生しました。' };
  }
};

/**
 * 古いアバター画像を削除
 */
const deleteOldAvatars = async (userId: string): Promise<void> => {
  try {
    const { data } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(userId);

    if (data && data.length > 0) {
      const filesToDelete = data.map(file => `${userId}/${file.name}`);
      await supabase.storage
        .from(AVATAR_BUCKET)
        .remove(filesToDelete);
    }
  } catch (err) {
    console.error('Failed to delete old avatars:', err);
  }
};

/**
 * プロフィール画像を削除
 */
export const deleteAvatar = async (userId: string): Promise<UploadResult> => {
  try {
    await deleteOldAvatars(userId);
    return { success: true };
  } catch (err) {
    console.error('Delete error:', err);
    return { success: false, error: '削除に失敗しました。' };
  }
};

/**
 * プロフィールにアバターURLを保存
 */
export const updateProfileAvatar = async (userId: string, avatarUrl: string | null): Promise<UploadResult> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'プロフィールの更新に失敗しました。' };
    }

    return { success: true };
  } catch (err) {
    console.error('Profile update exception:', err);
    return { success: false, error: '予期しないエラーが発生しました。' };
  }
};

export default {
  uploadAvatar,
  deleteAvatar,
  updateProfileAvatar,
};

