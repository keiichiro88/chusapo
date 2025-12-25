import { createClient } from '@supabase/supabase-js';

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
};

type QuotaResult = {
  remaining: number;
  used: number;
  daily_limit: number;
};

function getBearerToken(headers?: RequestLike['headers']): string | null {
  const raw = headers?.authorization ?? headers?.Authorization;
  const headerValue = Array.isArray(raw) ? raw[0] : raw;
  if (!headerValue) return null;
  const match = headerValue.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function getSupabaseClient(accessToken: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars are not set (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = getBearerToken(req.headers);
    if (!accessToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'AIキャリアアドバイスの利用にはログインが必要です。',
      });
    }

    const supabase = getSupabaseClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    const user = userData?.user;
    if (userError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'セッションが無効です。再ログインしてください。',
      });
    }

    const { data: quotaRows, error: quotaError } = await supabase.rpc('get_mbti_ai_quota', {
      p_user_id: user.id,
    });
    if (quotaError) {
      console.error('get_mbti_ai_quota error:', quotaError);
      return res.status(500).json({
        error: 'Quota check failed',
        message: 'AI利用制限の初期化が必要です（Supabaseのマイグレーションを適用してください）。',
      });
    }

    const quota = (Array.isArray(quotaRows) ? quotaRows[0] : quotaRows) as QuotaResult | undefined;
    if (!quota) {
      return res.status(500).json({
        error: 'Quota check failed',
        message: 'AI利用制限の取得に失敗しました。',
      });
    }

    res.setHeader('X-RateLimit-Remaining', String(quota.remaining ?? 0));
    return res.status(200).json({
      remaining: quota.remaining ?? 0,
      used: quota.used ?? 0,
      dailyLimit: quota.daily_limit ?? 3,
    });
  } catch (error) {
    console.error('MBTI Quota error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


