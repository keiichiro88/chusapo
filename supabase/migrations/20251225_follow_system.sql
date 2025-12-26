-- ============================================
-- フォロー/フォロワー機能 マイグレーション
-- ============================================
-- 実行順序:
-- 1. followsテーブル作成
-- 2. profilesにカウント・公開設定カラム追加
-- 3. notificationsのtype拡張
-- 4. トリガー（カウント更新・通知作成）
-- 5. RLS設定
-- ============================================

-- ============================================
-- 1. follows テーブル作成
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 複合主キー（重複フォロー防止）
  PRIMARY KEY (follower_id, following_id),
  
  -- 自己フォロー禁止
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- インデックス（一覧取得の高速化）
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at DESC);

-- ============================================
-- 2. profiles にカウント・公開設定カラム追加
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_followers_list_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_following_list_public BOOLEAN DEFAULT true;

-- 既存データにデフォルト値を適用
UPDATE public.profiles
SET
  followers_count = COALESCE(followers_count, 0),
  following_count = COALESCE(following_count, 0),
  is_followers_list_public = COALESCE(is_followers_list_public, true),
  is_following_list_public = COALESCE(is_following_list_public, true)
WHERE followers_count IS NULL 
   OR following_count IS NULL
   OR is_followers_list_public IS NULL
   OR is_following_list_public IS NULL;

-- ============================================
-- 3. notifications の type に follow を追加
-- ============================================
-- 既存のCHECK制約を削除して再作成
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications 
  ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('answer', 'gratitude', 'best_answer', 'like', 'system', 'follow'));

-- ============================================
-- 4. トリガー関数（カウント更新）
-- ============================================
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- フォローされた側の followers_count を +1
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    -- フォローした側の following_count を +1
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- フォローされた側の followers_count を -1（0未満にならないようガード）
    UPDATE public.profiles 
    SET followers_count = GREATEST(0, followers_count - 1) 
    WHERE id = OLD.following_id;
    
    -- フォローした側の following_count を -1
    UPDATE public.profiles 
    SET following_count = GREATEST(0, following_count - 1) 
    WHERE id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- ============================================
-- 5. トリガー関数（フォロー通知作成）
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- フォローした人の名前を取得
  SELECT name INTO follower_name FROM public.profiles WHERE id = NEW.follower_id;
  
  -- 通知を作成
  INSERT INTO public.notifications (user_id, type, title, message, from_user_id)
  VALUES (
    NEW.following_id,
    'follow',
    '新しいフォロワー',
    follower_name || 'さんがあなたをフォローしました',
    NEW.follower_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
DROP TRIGGER IF EXISTS on_follow_notification ON public.follows;
CREATE TRIGGER on_follow_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- ============================================
-- 6. RLS（Row Level Security）設定
-- ============================================
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除（エラー回避）
DROP POLICY IF EXISTS "Follows are viewable by authenticated users" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;

-- SELECT: ログインユーザーのみ
-- かつ、自分が関与する行 または 対象ユーザーの公開設定がONの場合のみ
CREATE POLICY "Follows are viewable by authenticated users"
  ON public.follows FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      -- 自分が関与する行は常に見える
      follower_id = auth.uid() 
      OR following_id = auth.uid()
      -- フォロワー一覧: following_id のユーザーが公開設定ONなら見える
      OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = following_id AND p.is_followers_list_public = true
      )
      -- フォロー中一覧: follower_id のユーザーが公開設定ONなら見える
      OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = follower_id AND p.is_following_list_public = true
      )
    )
  );

-- INSERT: ログインユーザーが自分をfollowerとしてのみ作成可能
CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND follower_id = auth.uid()
  );

-- DELETE: ログインユーザーが自分がfollowerの行のみ削除可能
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND follower_id = auth.uid()
  );

-- ============================================
-- 7. 列権限（改ざん防止）
-- ============================================
-- followers_count / following_count はトリガーでのみ更新可能
REVOKE INSERT (followers_count, following_count) ON public.profiles FROM authenticated;
REVOKE UPDATE (followers_count, following_count) ON public.profiles FROM authenticated;

-- ============================================
-- 8. バックフィル（既存データのカウント再計算）
-- ============================================
-- 既存のフォローデータがある場合にカウントを正確に再計算
-- 初回導入時は不要だが、運用中のデータ整合性確保のために用意
UPDATE public.profiles p
SET 
  followers_count = (SELECT COUNT(*) FROM public.follows f WHERE f.following_id = p.id),
  following_count = (SELECT COUNT(*) FROM public.follows f WHERE f.follower_id = p.id);

-- ============================================
-- 完了
-- ============================================
-- 以下のテーブル/機能が作成されます:
-- - follows テーブル（フォロー関係）
-- - profiles に followers_count / following_count / 公開設定
-- - notifications に follow 通知タイプ
-- - フォロー時の自動カウント更新トリガー
-- - フォロー時の自動通知作成トリガー
-- - RLS（ログイン必須 + 公開設定に従う）
-- ============================================



