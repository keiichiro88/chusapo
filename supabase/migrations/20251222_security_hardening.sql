-- ============================================
-- Security hardening (2025-12-22)
-- ============================================
-- 目的:
-- - profiles.email の公開リスクを排除（公開プロフィールとプライベート情報を分離）
-- - notifications のINSERT権限を閉じる（スパム防止）
-- - ベストアンサー確定をRPC(SECURITY DEFINER)で実行（RLSを広げない）
-- - システム管理カラムの改ざんを防止（列権限のREVOKE）
-- ============================================

-- 1) profiles_private: email等のプライベート情報を分離
CREATE TABLE IF NOT EXISTS public.profiles_private (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles_private ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own private profile" ON public.profiles_private;
CREATE POLICY "Users can view own private profile"
  ON public.profiles_private FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own private profile" ON public.profiles_private;
CREATE POLICY "Users can update own private profile"
  ON public.profiles_private FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own private profile" ON public.profiles_private;
CREATE POLICY "Users can delete own private profile"
  ON public.profiles_private FOR DELETE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own private profile" ON public.profiles_private;
CREATE POLICY "Users can insert own private profile"
  ON public.profiles_private FOR INSERT
  WITH CHECK (auth.uid() = id OR pg_trigger_depth() > 0);

-- 既存の profiles.email を profiles_private へ退避
INSERT INTO public.profiles_private (id, email)
SELECT id, email
FROM public.profiles
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 新規ユーザー登録時トリガー: profiles（公開）と profiles_private（非公開）を作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.profiles_private (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 公開profilesからemailカラムを削除（列レベルRLSがないため）
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- 2) notifications: INSERT権限を閉じる（トリガー/サービスロールのみ）
DO $$
BEGIN
  -- 旧ポリシー名（schema.sql / 旧migration）両方に対応
  EXECUTE 'DROP POLICY IF EXISTS "Service role can create notifications" ON public.notifications';
  EXECUTE 'DROP POLICY IF EXISTS "System can create notifications" ON public.notifications';
EXCEPTION WHEN undefined_table THEN
  -- notifications テーブルがまだ無い環境でも落ちないように
  NULL;
END $$;

-- 新ポリシー: トリガー内（pg_trigger_depth>0） or service_role のみINSERT可能
DO $$
BEGIN
  EXECUTE $POL$
    CREATE POLICY "Only triggers or service role can create notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (pg_trigger_depth() > 0 OR auth.role() = 'service_role')
  $POL$;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- 3) ベストアンサー確定: RPCで安全に実行（RLSを広げない）
CREATE OR REPLACE FUNCTION public.select_best_answer(p_question_id UUID, p_answer_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.questions q
    WHERE q.id = p_question_id AND q.author_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.answers a
    WHERE a.id = p_answer_id AND a.question_id = p_question_id
  ) THEN
    RAISE EXCEPTION 'answer not found for question' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.answers SET is_accepted = FALSE WHERE question_id = p_question_id;
  UPDATE public.answers SET is_accepted = TRUE WHERE id = p_answer_id;
  UPDATE public.questions SET has_accepted_answer = TRUE WHERE id = p_question_id;
END;
$$;

REVOKE ALL ON FUNCTION public.select_best_answer(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.select_best_answer(UUID, UUID) TO authenticated;

-- 4) システム管理カラムの改ざん防止（列権限）
-- profiles: tier / total_gratitude / current_title はシステム管理（トリガーや運用で更新）
REVOKE INSERT (tier, total_gratitude, current_title) ON public.profiles FROM authenticated;
REVOKE UPDATE (tier, total_gratitude, current_title) ON public.profiles FROM authenticated;

-- questions: likes_count / answers_count / has_accepted_answer はシステム管理
REVOKE INSERT (likes_count, answers_count, has_accepted_answer) ON public.questions FROM authenticated;
REVOKE UPDATE (likes_count, answers_count, has_accepted_answer) ON public.questions FROM authenticated;

-- answers: gratitude_count / is_accepted はシステム管理
REVOKE INSERT (gratitude_count, is_accepted) ON public.answers FROM authenticated;
REVOKE UPDATE (gratitude_count, is_accepted) ON public.answers FROM authenticated;


