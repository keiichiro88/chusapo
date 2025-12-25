-- モデレーション: ブロック / 通報
-- 目的:
-- - ブロック: 特定ユーザーの投稿/回答を見えなくする（ユーザー単位）
-- - 通報: スパム/誹謗中傷/個人情報などの報告を蓄積し運営が確認できるようにする

-- ============================================
-- 1) blocks テーブル（ブロック関係）
-- ============================================
CREATE TABLE IF NOT EXISTS public.blocks (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT blocks_no_self_block CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- 自分のブロック一覧のみ閲覧可能
CREATE POLICY "Users can view own blocks"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid());

-- 自分のブロックのみ作成可能
CREATE POLICY "Users can create own blocks"
  ON public.blocks FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid());

-- 自分のブロックのみ解除可能
CREATE POLICY "Users can delete own blocks"
  ON public.blocks FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON public.blocks(blocked_id);

-- ============================================
-- 2) reports テーブル（通報）
-- ============================================
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

-- ログインユーザーは通報を作成可能（自分のIDのみ）
CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- 運営（service_role）のみ参照可能
CREATE POLICY "Service role can view reports"
  ON public.reports FOR SELECT
  TO service_role
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);


