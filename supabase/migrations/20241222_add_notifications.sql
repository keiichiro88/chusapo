-- ============================================
-- 通知機能のマイグレーション
-- ============================================

-- notifications テーブル（通知）
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('answer', 'gratitude', 'best_answer', 'like', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  related_answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化
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

-- トリガーからの挿入を許可
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- 自動通知トリガー
-- ============================================

-- 回答が投稿されたときに質問者に通知を送る関数
CREATE OR REPLACE FUNCTION notify_on_new_answer()
RETURNS TRIGGER AS $$
DECLARE
  question_record RECORD;
  answerer_name TEXT;
BEGIN
  SELECT q.*, p.name as author_name
  INTO question_record
  FROM questions q
  JOIN profiles p ON q.author_id = p.id
  WHERE q.id = NEW.question_id;
  
  SELECT name INTO answerer_name FROM profiles WHERE id = NEW.author_id;
  
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
  SELECT a.*, q.title as question_title
  INTO answer_record
  FROM answers a
  JOIN questions q ON a.question_id = q.id
  WHERE a.id = NEW.answer_id;
  
  SELECT name INTO giver_name FROM profiles WHERE id = NEW.from_user_id;
  
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
    SELECT q.*, p.name as author_name
    INTO question_record
    FROM questions q
    JOIN profiles p ON q.author_id = p.id
    WHERE q.id = NEW.question_id;
    
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

