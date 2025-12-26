import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { RECRUITMENT_SITES } from '../../lib/nurse-tools/mbti-constants.js';
import type { AIAdvice, PersonalityResult } from '../../lib/nurse-tools/mbti-types.js';

type RequestLike = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
};

type QuotaResult = {
  allowed: boolean;
  remaining: number;
  used: number;
  daily_limit: number;
};

type DeepDiveAnswers = {
  experienceYears?: string;
  currentArea?: string;
  desiredTiming?: string;
  constraints?: string[];
  priorities?: string[];
  stressors?: string[];
  freeText?: string;
};

const LIMITS = {
  maxBodyChars: 50_000,
  maxPersonalityText: 2_000,
  maxStrengthItemChars: 80,
  maxDeepDiveItemChars: 80,
  maxDeepDiveFreeTextChars: 500,
  maxDeepDiveConstraints: 5,
  maxDeepDivePriorities: 3,
  maxDeepDiveStressors: 3,
} as const;

let cachedGeminiKey = '';
let cachedGenAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;

  // ローカル開発や運用中のキー差し替えを考慮して、キーが変わったら再生成する
  if (!cachedGenAI || cachedGeminiKey !== apiKey) {
    cachedGeminiKey = apiKey;
    cachedGenAI = new GoogleGenerativeAI(apiKey);
  }
  return cachedGenAI;
}

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

function extractFirstJsonObject(text: string): string | null {
  // GeminiがJSON以外の文字を混ぜても耐えられるように、最初にパース可能なJSONオブジェクトを抽出する
  let start = text.indexOf('{');
  while (start !== -1) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === '{') depth += 1;
      if (ch === '}') depth -= 1;

      if (depth === 0 && i > start) {
        const candidate = text.slice(start, i + 1);
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          break;
        }
      }
    }

    start = text.indexOf('{', start + 1);
  }
  return null;
}

function stripDoubleAsterisks(text: string): string {
  // 画面側はMarkdownを解釈しないため、AIが付与した ** がそのまま見えて読みにくくなる。
  // ここで ** を除去してプレーンテキストに整える。
  return text.replace(/\*\*/g, '');
}

function normalizeString(value: unknown, maxChars: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= maxChars) return trimmed;
  return trimmed.slice(0, maxChars);
}

function normalizeStringArray(value: unknown, maxItems: number, maxItemChars: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .map((v) => normalizeString(v, maxItemChars))
    .filter((v): v is string => typeof v === 'string' && v.length > 0);
  const unique = Array.from(new Set(cleaned));
  return unique.slice(0, maxItems);
}

function normalizeMbtiType(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim().toUpperCase();
  if (!/^[EI][SN][TF][JP]$/.test(t)) return null;
  return t;
}

function normalizePersonalityData(value: unknown, mbtiType: string): PersonalityResult | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Partial<PersonalityResult>;

  const title = normalizeString(v.title, 80);
  const description = normalizeString(v.description, LIMITS.maxPersonalityText);
  const workStyle = normalizeString(v.workStyle, 600);
  const strengthsRaw = Array.isArray(v.strengths) ? v.strengths : [];
  const strengths = strengthsRaw
    .map((s) => normalizeString(s, LIMITS.maxStrengthItemChars))
    .filter((s): s is string => typeof s === 'string');

  if (!title || !description || !workStyle || strengths.length === 0) return null;

  return {
    type: mbtiType,
    title,
    description,
    strengths,
    workStyle,
    characterImage: typeof v.characterImage === 'string' ? v.characterImage : undefined,
  };
}

function normalizeDeepDive(value: unknown): DeepDiveAnswers | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const v = value as Partial<DeepDiveAnswers>;

  const normalized: DeepDiveAnswers = {};
  const experienceYears = normalizeString(v.experienceYears, LIMITS.maxDeepDiveItemChars);
  const currentArea = normalizeString(v.currentArea, LIMITS.maxDeepDiveItemChars);
  const desiredTiming = normalizeString(v.desiredTiming, LIMITS.maxDeepDiveItemChars);
  const constraints = normalizeStringArray(v.constraints, LIMITS.maxDeepDiveConstraints, LIMITS.maxDeepDiveItemChars);
  const priorities = normalizeStringArray(v.priorities, LIMITS.maxDeepDivePriorities, LIMITS.maxDeepDiveItemChars);
  const stressors = normalizeStringArray(v.stressors, LIMITS.maxDeepDiveStressors, LIMITS.maxDeepDiveItemChars);
  const freeText = normalizeString(v.freeText, LIMITS.maxDeepDiveFreeTextChars);

  if (experienceYears) normalized.experienceYears = experienceYears;
  if (currentArea) normalized.currentArea = currentArea;
  if (desiredTiming) normalized.desiredTiming = desiredTiming;
  if (constraints && constraints.length > 0) normalized.constraints = constraints;
  if (priorities && priorities.length > 0) normalized.priorities = priorities;
  if (stressors && stressors.length > 0) normalized.stressors = stressors;
  if (freeText) normalized.freeText = freeText;

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function toSafeAdvice(value: unknown): AIAdvice {
  const v = (value && typeof value === 'object' ? (value as Partial<AIAdvice>) : {}) as Partial<AIAdvice>;
  const careerAdvice = typeof v.careerAdvice === 'string' ? v.careerAdvice : '';
  const stressManagement = typeof v.stressManagement === 'string' ? v.stressManagement : '';
  const teamCompatibility = typeof v.teamCompatibility === 'string' ? v.teamCompatibility : '';

  const recsRaw = (v as any)?.personalizedSiteRecommendations;
  const personalizedSiteRecommendations = Array.isArray(recsRaw)
    ? recsRaw
        .map((r: any) => {
          if (!r || typeof r !== 'object') return null;
          const siteName = typeof r.siteName === 'string' ? r.siteName : '';
          const reason = typeof r.reason === 'string' ? r.reason : '';
          const matchScore = typeof r.matchScore === 'number' ? r.matchScore : Number(r.matchScore);
          if (!siteName || !reason || !Number.isFinite(matchScore)) return null;
          const clamped = Math.max(0, Math.min(100, Math.round(matchScore)));
          return { siteName, reason, matchScore: clamped };
        })
        .filter(Boolean)
    : undefined;

  return sanitizeAdvice({
    careerAdvice,
    stressManagement,
    teamCompatibility,
    ...(personalizedSiteRecommendations ? { personalizedSiteRecommendations } : {}),
  });
}

function sanitizeAdvice(advice: AIAdvice): AIAdvice {
  return {
    ...advice,
    careerAdvice: stripDoubleAsterisks(advice.careerAdvice ?? ''),
    stressManagement: stripDoubleAsterisks(advice.stressManagement ?? ''),
    teamCompatibility: stripDoubleAsterisks(advice.teamCompatibility ?? ''),
    personalizedSiteRecommendations: advice.personalizedSiteRecommendations?.map((rec) => ({
      ...rec,
      siteName: stripDoubleAsterisks(rec.siteName ?? ''),
      reason: stripDoubleAsterisks(rec.reason ?? ''),
    })),
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // キャッシュされないように（診断は個人に紐づく可能性があるため）
  res.setHeader('Cache-Control', 'no-store');

  // ログイン必須（Bearerトークン必須）
  const accessToken = getBearerToken(req.headers);
  if (!accessToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'AIキャリアアドバイスの利用にはログインが必要です。',
    });
  }

  // 入力（JSON）を安全にパース＆上限チェック
  if (typeof req.body === 'string' && req.body.length > LIMITS.maxBodyChars) {
    return res.status(413).json({
      error: 'Payload too large',
      message: `入力が長すぎます。自由記述は${LIMITS.maxDeepDiveFreeTextChars}文字以内にしてください。`,
    });
  }

  let parsedBody: unknown = req.body;
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body);
    } catch {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'リクエスト形式が不正です。もう一度お試しください。',
      });
    }
  }

  if (!parsedBody || typeof parsedBody !== 'object') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'リクエスト形式が不正です。もう一度お試しください。',
    });
  }

  const body = parsedBody as any;
  const mbtiType = normalizeMbtiType(body.mbtiType);
  if (!mbtiType) {
    return res.status(400).json({ error: 'Bad Request', message: 'MBTIタイプが不正です。' });
  }

  const personalityData = normalizePersonalityData(body.personalityData, mbtiType);
  if (!personalityData) {
    return res.status(400).json({ error: 'Bad Request', message: 'personalityData が不正です。' });
  }

  const deepDive = normalizeDeepDive(body.deepDive);

  const genAI = getGenAI();
  if (!genAI) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set',
      message: 'サーバー側の環境変数（GEMINI_API_KEY）が未設定です。',
    });
  }

  // 1ユーザーあたり「1日3回」まで（DBで厳密に制限）
  const supabase = getSupabaseClient(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  const user = userData?.user;
  if (userError || !user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'セッションが無効です。再ログインしてください。',
    });
  }

  const { data: quotaRows, error: quotaError } = await supabase.rpc('consume_mbti_ai_quota', {
    p_user_id: user.id,
  });
  if (quotaError) {
    console.error('consume_mbti_ai_quota error:', quotaError);
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
  if (!quota.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: '本日のAIアドバイス取得回数（3回）に達しました。明日再度お試しください。',
      remaining: 0,
    });
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      // フォーマット崩れ（JSON崩壊）を減らすため、温度は控えめに
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });

  const hasDeepDive =
    !!deepDive &&
    !!(
      deepDive.experienceYears ||
      deepDive.currentArea ||
      deepDive.desiredTiming ||
      (deepDive.constraints?.length ?? 0) > 0 ||
      (deepDive.priorities?.length ?? 0) > 0 ||
      (deepDive.stressors?.length ?? 0) > 0 ||
      (deepDive.freeText?.trim() ?? '') !== ''
    );

  const prompt = `
あなたは看護師専門のキャリアカウンセラーです。豊富な臨床経験と心理学の知識を持ち、看護師一人ひとりの個性を理解し、具体的で実践的なアドバイスを提供します。

【対象者の性格タイプ】
- MBTIタイプ: ${mbtiType}
- タイプ名: ${personalityData.title}
- 特徴: ${personalityData.description}
- 強み: ${personalityData.strengths.join('、')}
- 適した働き方: ${personalityData.workStyle}

${hasDeepDive ? `【任意の深掘り回答（未回答は推測しない）】
- 経験年数: ${deepDive?.experienceYears ?? '未回答'}
- 現在の働き方（領域）: ${deepDive?.currentArea ?? '未回答'}
- 希望時期: ${deepDive?.desiredTiming ?? '未回答'}
- 譲れない条件: ${(deepDive?.constraints?.length ?? 0) > 0 ? deepDive?.constraints?.join('、') : '未回答'}
- 優先順位Top3: ${(deepDive?.priorities?.length ?? 0) > 0 ? deepDive?.priorities?.join('、') : '未回答'}
- ストレス要因Top3: ${(deepDive?.stressors?.length ?? 0) > 0 ? deepDive?.stressors?.join('、') : '未回答'}
- 自由記述: ${(deepDive?.freeText?.trim() ?? '') !== '' ? deepDive?.freeText?.trim() : '未回答'}
` : ''}

【重要】以下の4項目について、${mbtiType}タイプの看護師に特化した、詳細で具体的なアドバイスを提供してください。

1. careerAdvice（キャリアアドバイス）
  - このタイプの強み（${personalityData.strengths.join('、')}）を看護現場でどう活かすか、具体的なシーン例を含めて説明
  - ${mbtiType}タイプに最適な診療科・職場環境・キャリアパスの提案
  - 上の「任意の深掘り回答」がある場合は必ず反映（経験年数/領域/制約/優先順位/希望時期を踏まえて具体化）
  - 5年後、10年後のキャリアビジョンの描き方
  - 認定看護師・専門看護師など、スペシャリストの道も含めた選択肢
  - 最低400文字以上、できれば500-600文字で詳しく

2. stressManagement（ストレス管理）
  - ${mbtiType}タイプが特に感じやすいストレスの種類（例：人間関係、業務量、価値観の不一致など）
  - 夜勤、多職種連携、患者・家族対応における具体的なストレスシーンと対処法
  - 上の「任意の深掘り回答」にストレス要因がある場合は最優先で対策を具体化
  - このタイプに効果的なストレス解消法（休日の過ごし方、リフレッシュ方法）
  - 燃え尽き症候群を防ぐための実践的なアドバイス
  - 最低400文字以上、できれば500-600文字で詳しく

3. teamCompatibility（チーム連携のコツ）
  - ${mbtiType}タイプの看護師が、医師・他職種とスムーズに連携するための具体的なコミュニケーション術
  - 申し送り、カンファレンス、緊急時の報告など、実際の場面での振る舞い方
  - 自分と異なるタイプの同僚・上司との付き合い方（具体例を含む）
  - チーム内で自分の強みを発揮しつつ、周囲とも調和する方法
  - 最低400文字以上、できれば500-600文字で詳しく

4. personalizedSiteRecommendations（転職サイト推薦）
  - 以下の転職サイトから、${mbtiType}タイプに最も合うサイトを2つ選び、なぜそのサイトが合うのか理由を説明
  - 利用可能なサイト: ${RECRUITMENT_SITES.map((s) => s.name).join('、')}
  - 各サイトの特徴: ${RECRUITMENT_SITES.map((s) => `${s.name}(${s.tags.join(',')})`).join(' / ')}
  - 上の「任意の深掘り回答」がある場合は、希望時期や制約・優先順位に配慮した理由にする（未回答は推測しない）
  - 必ず2つのサイトを推薦し、${mbtiType}タイプの性格特性と照らし合わせた具体的な理由を述べる
  - matchScore（0-100）: そのタイプとの相性スコア

【表記ルール（重要）】
- 返答の文章内ではMarkdown記法を使わないでください（太字、斜体、見出し、コードブロック等）
- 強調したい場合は「」や『』など日本語の括弧を用いてください
- 深掘り回答の「未回答」は埋めずに、その前提で一般化しすぎない助言をしてください

必ず以下のJSON形式で、JSONだけを出力してください（JSONの前後に説明文を付けない）：
{
  "careerAdvice": "キャリアアドバイスの内容",
  "stressManagement": "ストレス管理の内容",
  "teamCompatibility": "チーム連携のコツの内容",
  "personalizedSiteRecommendations": [
    { "siteName": "サイト名1", "reason": "このタイプに合う理由", "matchScore": 85 },
    { "siteName": "サイト名2", "reason": "このタイプに合う理由", "matchScore": 80 }
  ]
}
`;

  try {
    const result = await model.generateContent([{ text: prompt }]);
    const response = await result.response;
    const text = response.text();

    const json = extractFirstJsonObject(text);
    if (!json) {
      throw new Error('AI応答をJSONとして解析できませんでした。時間をおいて再度お試しください。');
    }

    const parsed = JSON.parse(json);
    const advice = toSafeAdvice(parsed);

    if (!advice.careerAdvice || !advice.stressManagement || !advice.teamCompatibility) {
      throw new Error('AI応答の形式が不正でした。時間をおいて再度お試しください。');
    }

    return res.status(200).json(advice);
  } catch (error) {
    console.error('MBTI Advice error:', error);
    const fallbackAdvice: AIAdvice = {
      careerAdvice: 'あなたの強みを活かせる職場を探しましょう。自信を持って自分に合う環境を見つけてください。',
      stressManagement: '一人で抱え込まず、信頼できる同期や先輩に相談する時間を作ってください。',
      teamCompatibility: 'あなたの誠実さはチームに伝わります。感謝の言葉を積極的に伝えることで、より円滑な関係が築けます。',
    };
    return res.status(200).json(fallbackAdvice);
  }
}

