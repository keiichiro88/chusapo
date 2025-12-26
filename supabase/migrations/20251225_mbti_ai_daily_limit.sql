-- MBTI AIキャリアアドバイス：ログイン必須 + 1日3回までの利用制限
-- 目的:
-- - APIキーをサーバー側に隠したまま、ユーザー単位で利用回数を制限する
-- - サーバレス環境でも安定して制限できるようDBで管理する

-- ============================================
-- 1) 利用回数テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.mbti_ai_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT (timezone('Asia/Tokyo', now())::date),
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.mbti_ai_usage ENABLE ROW LEVEL SECURITY;

-- 自分の行だけ参照可能
CREATE POLICY "Users can view own mbti_ai_usage"
  ON public.mbti_ai_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 自分の行だけ作成/更新可能（通常はRPC経由で利用）
CREATE POLICY "Users can insert own mbti_ai_usage"
  ON public.mbti_ai_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own mbti_ai_usage"
  ON public.mbti_ai_usage FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 2) 1日3回の消費RPC（原子性確保）
-- ============================================
CREATE OR REPLACE FUNCTION public.consume_mbti_ai_quota(p_user_id UUID)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, used INTEGER, daily_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date DATE := (timezone('Asia/Tokyo', now())::date);
  v_count INTEGER;
  v_limit INTEGER := 3;
BEGIN
  -- SECURITY DEFINER のため、呼び出しユーザー本人以外の消費を禁止
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  -- 行が無ければ作る（0回から開始）
  INSERT INTO public.mbti_ai_usage (user_id, usage_date, count)
  VALUES (p_user_id, v_date, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  -- その日の行をロックしてカウント確認（同時リクエストでも超過しない）
  SELECT count
    INTO v_count
    FROM public.mbti_ai_usage
   WHERE user_id = p_user_id
     AND usage_date = v_date
   FOR UPDATE;

  IF v_count >= v_limit THEN
    allowed := FALSE;
    used := v_count;
    remaining := 0;
    daily_limit := v_limit;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE public.mbti_ai_usage
     SET count = v_count + 1,
         updated_at = now()
   WHERE user_id = p_user_id
     AND usage_date = v_date;

  allowed := TRUE;
  used := v_count + 1;
  remaining := v_limit - used;
  daily_limit := v_limit;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_mbti_ai_quota(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_mbti_ai_quota(UUID) TO authenticated;



