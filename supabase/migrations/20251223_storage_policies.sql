-- ============================================
-- Storage（avatars バケット）のセキュリティポリシー
-- ============================================
-- 注意: このSQLを実行する前に、Supabase Dashboard で
-- Storage → New bucket → "avatars" を作成し、Public bucket を ON にしてください
-- ============================================

-- 既存ポリシーを削除（エラー回避）
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- 1. 誰でも閲覧可能（公開バケットなので）
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 2. ログインユーザーは自分のフォルダにのみアップロード可能
-- フォルダ構造: avatars/{user_id}/filename.jpg
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. ログインユーザーは自分の画像のみ更新可能
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. ログインユーザーは自分の画像のみ削除可能
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 補足: バケット作成手順（Dashboard で実行）
-- ============================================
-- 1. Supabase Dashboard → Storage
-- 2. "New bucket" をクリック
-- 3. Name: avatars
-- 4. Public bucket: ON（チェック）
-- 5. File size limit: 5242880（5MB）
-- 6. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
-- ============================================

