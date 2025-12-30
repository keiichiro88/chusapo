-- MBTIタイプをプロフィールに保存するためのカラム追加
-- 診断結果をプロフィールに反映する機能用

-- mbti_type: MBTIタイプ（例: ESTJ, INFP など）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mbti_type VARCHAR(4) DEFAULT NULL;

-- mbti_title: MBTIタイプの日本語タイトル（例: 厳格な幹部ナース）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mbti_title VARCHAR(100) DEFAULT NULL;

-- show_mbti_on_profile: プロフィールにMBTIタイプを表示するかどうか
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_mbti_on_profile BOOLEAN DEFAULT FALSE;

-- インデックス（MBTIタイプでの検索用）
CREATE INDEX IF NOT EXISTS idx_profiles_mbti_type ON profiles(mbti_type) WHERE mbti_type IS NOT NULL;

-- コメント
COMMENT ON COLUMN profiles.mbti_type IS 'ナースキャリア診断AIで判定されたMBTIタイプ（4文字）';
COMMENT ON COLUMN profiles.mbti_title IS 'MBTIタイプの日本語タイトル（例: 厳格な幹部ナース）';
COMMENT ON COLUMN profiles.show_mbti_on_profile IS 'プロフィールにMBTIタイプを公開表示するかどうか';

