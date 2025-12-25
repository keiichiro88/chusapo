-- MBTI AIキャリアアドバイス：残り回数の参照（消費しない）
-- 目的:
-- - UIで「本日あと◯回」を表示するため、消費せずに残り回数を取得する

CREATE OR REPLACE FUNCTION public.get_mbti_ai_quota(p_user_id UUID)
RETURNS TABLE(remaining INTEGER, used INTEGER, daily_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date DATE := (timezone('Asia/Tokyo', now())::date);
  v_count INTEGER;
  v_limit INTEGER := 3;
BEGIN
  -- SECURITY DEFINER のため、呼び出しユーザー本人以外の参照を禁止
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  -- 行が無ければ作る（0回から開始）
  INSERT INTO public.mbti_ai_usage (user_id, usage_date, count)
  VALUES (p_user_id, v_date, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  SELECT count
    INTO v_count
    FROM public.mbti_ai_usage
   WHERE user_id = p_user_id
     AND usage_date = v_date;

  used := v_count;
  daily_limit := v_limit;
  remaining := GREATEST(0, v_limit - v_count);
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.get_mbti_ai_quota(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_mbti_ai_quota(UUID) TO authenticated;


