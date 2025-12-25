-- ============================================
-- profiles: プロフィール永続化（追加カラム） + 画像URL対応
-- ============================================
-- 目的:
-- - プロフィール編集で入力する項目をprofilesに保存できるようにする
-- - アバター/背景画像は Storage に置き、ここではURLを保持する
-- ============================================

-- profiles の追加カラム（存在しない場合のみ追加）
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS background_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_gradient TEXT DEFAULT 'from-purple-500 to-pink-500',
  ADD COLUMN IF NOT EXISTS background_gradient TEXT DEFAULT 'from-blue-400 via-blue-500 to-blue-600';

-- ※ 画像は Storage bucket "avatars" を利用する想定
--   パス例: avatars/{user_id}/avatar/{timestamp}.png
--          avatars/{user_id}/background/{timestamp}.png
--   既存のStorageポリシーは (storage.foldername(name))[1] = auth.uid()::text を要求するため、
--   先頭フォルダを user_id にする必要があります。


