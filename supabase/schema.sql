-- ============================================
-- チューサポ データベーススキーマ
-- ============================================
-- このSQLをSupabaseのSQL Editorで実行してください
-- Dashboard → SQL Editor → New Query → 貼り付け → Run
-- ============================================

-- ============================================
-- 1. profiles テーブル（ユーザープロフィール）
-- ============================================
-- Supabase Authのusersテーブルと連携
-- ユーザーが登録すると自動的にprofileも作成される

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT '医療従事者',  -- 医師、看護師、技師など
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'verified', 'expert')),
  bio TEXT,  -- 自己紹介
  speciality TEXT,  -- 専門分野
  experience TEXT,  -- 経験年数
  workplace TEXT,  -- 勤務先
  location TEXT DEFAULT '',  -- 所在地（都道府県など）
  website TEXT DEFAULT '',  -- Webサイト（任意）
  social_links JSONB DEFAULT '{}'::jsonb,  -- SNSリンク等（任意）
  total_gratitude INTEGER DEFAULT 0,  -- 累計感謝数
  current_title TEXT DEFAULT '',  -- 現在の称号
  avatar_url TEXT,
  background_url TEXT,
  avatar_gradient TEXT DEFAULT 'from-purple-500 to-pink-500',
  background_gradient TEXT DEFAULT 'from-blue-400 via-blue-500 to-blue-600',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles テーブルのRLS（Row Level Security）を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 誰でもプロフィールを閲覧可能
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 自分のプロフィールのみ挿入可能
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 1.1 profiles_private テーブル（非公開プロフィール情報）
-- ============================================
-- email などのプライベート情報は RLS で「本人のみ」閲覧可能にするため別テーブルで管理

CREATE TABLE IF NOT EXISTS profiles_private (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles_private ENABLE ROW LEVEL SECURITY;

-- 自分のprivate情報のみ閲覧可能
CREATE POLICY "Users can view own private profile"
  ON profiles_private FOR SELECT
  USING (auth.uid() = id);

-- 自分のprivate情報のみ更新可能
CREATE POLICY "Users can update own private profile"
  ON profiles_private FOR UPDATE
  USING (auth.uid() = id);

-- 自分のprivate情報のみ挿入可能（トリガーからの作成も許可）
CREATE POLICY "Users can insert own private profile"
  ON profiles_private FOR INSERT
  WITH CHECK (auth.uid() = id OR pg_trigger_depth() > 0);

-- 自分のprivate情報のみ削除可能
CREATE POLICY "Users can delete own private profile"
  ON profiles_private FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- 2. questions テーブル（質問）
-- ============================================

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('注射', '採血', 'ルート確保', '動脈穿刺', 'その他')),
  likes_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  has_accepted_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- questions テーブルのRLSを有効化
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 誰でも質問を閲覧可能
CREATE POLICY "Questions are viewable by everyone"
  ON questions FOR SELECT
  USING (true);

-- ログインユーザーは質問を投稿可能
CREATE POLICY "Authenticated users can create questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 自分の質問のみ更新可能
CREATE POLICY "Users can update own questions"
  ON questions FOR UPDATE
  USING (auth.uid() = author_id);

-- 自分の質問のみ削除可能
CREATE POLICY "Users can delete own questions"
  ON questions FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 3. answers テーブル（回答）
-- ============================================

CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  gratitude_count INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- answers テーブルのRLSを有効化
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- 誰でも回答を閲覧可能
CREATE POLICY "Answers are viewable by everyone"
  ON answers FOR SELECT
  USING (true);

-- ログインユーザーは回答を投稿可能
CREATE POLICY "Authenticated users can create answers"
  ON answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 自分の回答のみ更新可能
CREATE POLICY "Users can update own answers"
  ON answers FOR UPDATE
  USING (auth.uid() = author_id);

-- 自分の回答のみ削除可能
CREATE POLICY "Users can delete own answers"
  ON answers FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 4. question_likes テーブル（質問へのいいね）
-- ============================================

CREATE TABLE IF NOT EXISTS question_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)  -- 同じユーザーが同じ質問に複数いいねできない
);

-- question_likes テーブルのRLSを有効化
ALTER TABLE question_likes ENABLE ROW LEVEL SECURITY;

-- 誰でもいいねを閲覧可能
CREATE POLICY "Question likes are viewable by everyone"
  ON question_likes FOR SELECT
  USING (true);

-- ログインユーザーはいいね可能
CREATE POLICY "Authenticated users can like questions"
  ON question_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のいいねのみ削除可能（取り消し）
CREATE POLICY "Users can unlike questions"
  ON question_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. answer_gratitudes テーブル（回答への感謝）
-- ============================================

CREATE TABLE IF NOT EXISTS answer_gratitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,  -- 感謝した人
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,    -- 感謝された人
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(answer_id, from_user_id)  -- 同じユーザーが同じ回答に複数感謝できない
);

-- answer_gratitudes テーブルのRLSを有効化
ALTER TABLE answer_gratitudes ENABLE ROW LEVEL SECURITY;

-- 誰でも感謝を閲覧可能
CREATE POLICY "Gratitudes are viewable by everyone"
  ON answer_gratitudes FOR SELECT
  USING (true);

-- ログインユーザーは感謝可能
CREATE POLICY "Authenticated users can give gratitude"
  ON answer_gratitudes FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- 自分の感謝のみ削除可能（取り消し）
CREATE POLICY "Users can remove gratitude"
  ON answer_gratitudes FOR DELETE
  USING (auth.uid() = from_user_id);

-- ============================================
-- 6. トリガー関数（自動処理）
-- ============================================

-- 新規ユーザー登録時に自動的にprofileを作成
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

-- トリガーを作成（既に存在する場合は削除してから作成）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 質問のいいね数を自動更新する関数
CREATE OR REPLACE FUNCTION update_question_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE questions SET likes_count = likes_count + 1 WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE questions SET likes_count = likes_count - 1 WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_question_like_change ON question_likes;
CREATE TRIGGER on_question_like_change
  AFTER INSERT OR DELETE ON question_likes
  FOR EACH ROW EXECUTE FUNCTION update_question_likes_count();

-- 質問の回答数を自動更新する関数
CREATE OR REPLACE FUNCTION update_question_answers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE questions SET answers_count = answers_count + 1 WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE questions SET answers_count = answers_count - 1 WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_answer_change ON answers;
CREATE TRIGGER on_answer_change
  AFTER INSERT OR DELETE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_question_answers_count();

-- 回答の感謝数とユーザーの累計感謝数を自動更新する関数
CREATE OR REPLACE FUNCTION update_gratitude_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 回答の感謝数を増加
    UPDATE answers SET gratitude_count = gratitude_count + 1 WHERE id = NEW.answer_id;
    -- ユーザーの累計感謝数を増加
    UPDATE profiles SET total_gratitude = total_gratitude + 1 WHERE id = NEW.to_user_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- 回答の感謝数を減少
    UPDATE answers SET gratitude_count = gratitude_count - 1 WHERE id = OLD.answer_id;
    -- ユーザーの累計感謝数を減少
    UPDATE profiles SET total_gratitude = total_gratitude - 1 WHERE id = OLD.to_user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_gratitude_change ON answer_gratitudes;
CREATE TRIGGER on_gratitude_change
  AFTER INSERT OR DELETE ON answer_gratitudes
  FOR EACH ROW EXECUTE FUNCTION update_gratitude_counts();

-- ============================================
-- 7. notifications テーブル（通知）
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,  -- 通知を受け取るユーザー
  type TEXT NOT NULL CHECK (type IN ('answer', 'gratitude', 'best_answer', 'like', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,  -- クリック時の遷移先
  is_read BOOLEAN DEFAULT FALSE,
  related_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  related_answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- 通知の発生源ユーザー
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notifications テーブルのRLSを有効化
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 自分の通知のみ閲覧可能
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 自分の通知のみ更新可能（既読フラグ）
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 自分の通知のみ削除可能
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- システムが通知を作成可能（サービスロールキー使用時）
CREATE POLICY "Service role can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (pg_trigger_depth() > 0 OR auth.role() = 'service_role');

-- 回答が投稿されたときに質問者に通知を送る関数
CREATE OR REPLACE FUNCTION notify_on_new_answer()
RETURNS TRIGGER AS $$
DECLARE
  question_record RECORD;
  answerer_name TEXT;
BEGIN
  -- 質問情報を取得
  SELECT q.*, p.name as author_name
  INTO question_record
  FROM questions q
  JOIN profiles p ON q.author_id = p.id
  WHERE q.id = NEW.question_id;
  
  -- 回答者名を取得
  SELECT name INTO answerer_name FROM profiles WHERE id = NEW.author_id;
  
  -- 自分の質問に自分で回答した場合は通知しない
  IF question_record.author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, title, message, related_question_id, related_answer_id, from_user_id)
    VALUES (
      question_record.author_id,
      'answer',
      '新しい回答があります',
      answerer_name || 'さんがあなたの質問「' || LEFT(question_record.title, 30) || '...」に回答しました',
      NEW.question_id,
      NEW.id,
      NEW.author_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_answer_notification ON answers;
CREATE TRIGGER on_new_answer_notification
  AFTER INSERT ON answers
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_answer();

-- 感謝されたときに回答者に通知を送る関数
CREATE OR REPLACE FUNCTION notify_on_gratitude()
RETURNS TRIGGER AS $$
DECLARE
  answer_record RECORD;
  giver_name TEXT;
BEGIN
  -- 回答情報を取得
  SELECT a.*, q.title as question_title
  INTO answer_record
  FROM answers a
  JOIN questions q ON a.question_id = q.id
  WHERE a.id = NEW.answer_id;
  
  -- 感謝者名を取得
  SELECT name INTO giver_name FROM profiles WHERE id = NEW.from_user_id;
  
  -- 自分に感謝した場合は通知しない
  IF NEW.to_user_id != NEW.from_user_id THEN
    INSERT INTO notifications (user_id, type, title, message, related_question_id, related_answer_id, from_user_id)
    VALUES (
      NEW.to_user_id,
      'gratitude',
      '感謝されました！',
      giver_name || 'さんがあなたの回答に感謝しました',
      answer_record.question_id,
      NEW.answer_id,
      NEW.from_user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_gratitude_notification ON answer_gratitudes;
CREATE TRIGGER on_gratitude_notification
  AFTER INSERT ON answer_gratitudes
  FOR EACH ROW EXECUTE FUNCTION notify_on_gratitude();

-- ベストアンサーに選ばれたときに回答者に通知を送る関数
CREATE OR REPLACE FUNCTION notify_on_best_answer()
RETURNS TRIGGER AS $$
DECLARE
  question_record RECORD;
BEGIN
  IF NEW.is_accepted = TRUE AND (OLD.is_accepted IS NULL OR OLD.is_accepted = FALSE) THEN
    -- 質問情報を取得
    SELECT q.*, p.name as author_name
    INTO question_record
    FROM questions q
    JOIN profiles p ON q.author_id = p.id
    WHERE q.id = NEW.question_id;
    
    -- 自分の回答をベストアンサーにした場合は通知しない
    IF question_record.author_id != NEW.author_id THEN
      INSERT INTO notifications (user_id, type, title, message, related_question_id, related_answer_id, from_user_id)
      VALUES (
        NEW.author_id,
        'best_answer',
        'ベストアンサーに選ばれました！🎉',
        question_record.author_name || 'さんがあなたの回答をベストアンサーに選びました',
        NEW.question_id,
        NEW.id,
        question_record.author_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_best_answer_notification ON answers;
CREATE TRIGGER on_best_answer_notification
  AFTER UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION notify_on_best_answer();

-- ============================================
-- 7.1 RPC: ベストアンサー確定（RLSを広げずにSECURITY DEFINERで実行）
-- ============================================

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

-- ============================================
-- 8. インデックス（検索高速化）
-- ============================================

CREATE INDEX IF NOT EXISTS idx_questions_author_id ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_question_likes_question_id ON question_likes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_likes_user_id ON question_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_gratitudes_answer_id ON answer_gratitudes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_gratitudes_to_user_id ON answer_gratitudes(to_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- 8. MBTI AIキャリアアドバイス：ログイン必須 + 1日3回まで
-- ============================================
CREATE TABLE IF NOT EXISTS public.mbti_ai_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT (timezone('Asia/Tokyo', now())::date),
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.mbti_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mbti_ai_usage"
  ON public.mbti_ai_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own mbti_ai_usage"
  ON public.mbti_ai_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own mbti_ai_usage"
  ON public.mbti_ai_usage FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

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
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  INSERT INTO public.mbti_ai_usage (user_id, usage_date, count)
  VALUES (p_user_id, v_date, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

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

-- ============================================
-- 9. モデレーション（ブロック / 通報）
-- ============================================
CREATE TABLE IF NOT EXISTS public.blocks (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT blocks_no_self_block CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can create own blocks"
  ON public.blocks FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can delete own blocks"
  ON public.blocks FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON public.blocks(blocked_id);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer', 'user')),
  target_id UUID,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Service role can view reports"
  ON public.reports FOR SELECT
  TO service_role
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);

-- ============================================
-- 8.1 列権限（改ざん防止）
-- ============================================
-- RLS は行単位の制御なので、システム管理カラムは列権限で書き込みを制限する

REVOKE INSERT (tier, total_gratitude, current_title) ON public.profiles FROM authenticated;
REVOKE UPDATE (tier, total_gratitude, current_title) ON public.profiles FROM authenticated;

REVOKE INSERT (likes_count, answers_count, has_accepted_answer) ON public.questions FROM authenticated;
REVOKE UPDATE (likes_count, answers_count, has_accepted_answer) ON public.questions FROM authenticated;

REVOKE INSERT (gratitude_count, is_accepted) ON public.answers FROM authenticated;
REVOKE UPDATE (gratitude_count, is_accepted) ON public.answers FROM authenticated;

-- ============================================
-- 完了メッセージ
-- ============================================
-- このSQLを実行後、以下のテーブルが作成されます：
-- - profiles（ユーザープロフィール）
-- - questions（質問）
-- - answers（回答）
-- - question_likes（いいね）
-- - answer_gratitudes（感謝）
--
-- また、以下の自動処理が設定されます：
-- - 新規ユーザー登録時に自動的にprofile作成
-- - いいね/感謝時に自動的にカウント更新
-- ============================================
