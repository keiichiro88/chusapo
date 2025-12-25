import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { RECRUITMENT_SITES } from '../../lib/nurse-tools/mbti-constants';
import type { AIAdvice, PersonalityResult } from '../../lib/nurse-tools/mbti-types';

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

function getJsonFromText(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function stripDoubleAsterisks(text: string): string {
  // 画面側はMarkdownを解釈しないため、AIが付与した ** がそのまま見えて読みにくくなる。
  // ここで ** を除去してプレーンテキストに整える。
  return text.replace(/\*\*/g, '');
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

  try {
    // ログイン必須（Bearerトークン必須）
    const accessToken = getBearerToken(req.headers);
    if (!accessToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'AIキャリアアドバイスの利用にはログインが必要です。',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { mbtiType, personalityData, sessionId } = body as {
      mbtiType: string;
      personalityData: PersonalityResult;
      sessionId?: string;
    };

    if (!mbtiType || !personalityData) {
      return res.status(400).json({ error: 'mbtiType and personalityData are required' });
    }

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
        temperature: 0.8,
        maxOutputTokens: 4096,
      },
    });

    const prompt = `
あなたは看護師専門のキャリアカウンセラーです。豊富な臨床経験と心理学の知識を持ち、看護師一人ひとりの個性を理解し、具体的で実践的なアドバイスを提供します。

【対象者の性格タイプ】
- MBTIタイプ: ${String(mbtiType).toUpperCase()}
- タイプ名: ${personalityData.title}
- 特徴: ${personalityData.description}
- 強み: ${personalityData.strengths.join('、')}
- 適した働き方: ${personalityData.workStyle}

【重要】以下の3つの項目について、${String(mbtiType).toUpperCase()}タイプの看護師に特化した、詳細で具体的なアドバイスを提供してください。

1. **careerAdvice（キャリアアドバイス）**
   - このタイプの強み（${personalityData.strengths.join('、')}）を看護現場でどう活かすか、具体的なシーン例を含めて説明
   - ${String(mbtiType).toUpperCase()}タイプに最適な診療科・職場環境・キャリアパスの提案
   - 5年後、10年後のキャリアビジョンの描き方
   - 認定看護師・専門看護師など、スペシャリストの道も含めた選択肢
   - 最低400文字以上、できれば500-600文字で詳しく

2. **stressManagement（ストレス管理）**
   - ${String(mbtiType).toUpperCase()}タイプが特に感じやすいストレスの種類（例：人間関係、業務量、価値観の不一致など）
   - 夜勤、多職種連携、患者・家族対応における具体的なストレスシーンと対処法
   - このタイプに効果的なストレス解消法（休日の過ごし方、リフレッシュ方法）
   - 燃え尽き症候群を防ぐための実践的なアドバイス
   - 最低400文字以上、できれば500-600文字で詳しく

3. **teamCompatibility（チーム連携のコツ）**
   - ${String(mbtiType).toUpperCase()}タイプの看護師が、医師・他職種とスムーズに連携するための具体的なコミュニケーション術
   - 申し送り、カンファレンス、緊急時の報告など、実際の場面での振る舞い方
   - 自分と異なるタイプの同僚・上司との付き合い方（具体例を含む）
   - チーム内で自分の強みを発揮しつつ、周囲とも調和する方法
   - 最低400文字以上、できれば500-600文字で詳しく

4. **personalizedSiteRecommendations（転職サイト推薦）**
   - 以下の転職サイトから、${String(mbtiType).toUpperCase()}タイプに最も合うサイトを2つ選び、なぜそのサイトが合うのか理由を説明
   - 利用可能なサイト: ${RECRUITMENT_SITES.map((s) => s.name).join('、')}
   - 各サイトの特徴: ${RECRUITMENT_SITES.map((s) => `${s.name}(${s.tags.join(',')})`).join(' / ')}
   - 必ず2つのサイトを推薦し、${String(mbtiType).toUpperCase()}タイプの性格特性と照らし合わせた具体的な理由を述べる
   - matchScore（0-100）: そのタイプとの相性スコア

【トーン】
- 温かく、共感的でありながら、プロフェッショナルな視点を保つ
- 看護師の現場の大変さを理解し、励ましと実践的なアドバイスのバランスを取る
- 一般論ではなく、${String(mbtiType).toUpperCase()}タイプならではの個別性を徹底的に意識する
- 具体的な職場のシーン、実例、数字を含める

【表記ルール（重要）】
- 返答の文章内ではMarkdown記法を使わないでください（例：**太字**、*斜体*、#見出し、\`\`\`コード\`\`\` など）
- 強調したい場合は「」や『』など日本語の括弧を用いてください

必ず以下のJSON形式で回答してください。各項目は十分な情報量と具体性を持たせてください：
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

    const result = await model.generateContent([{ text: prompt }]);
    const response = await result.response;
    const text = response.text();

    const json = getJsonFromText(text);
    if (!json) {
      throw new Error('Failed to parse AI response as JSON');
    }

    const advice = sanitizeAdvice(JSON.parse(json) as AIAdvice);
    return res.status(200).json(advice);
  } catch (error) {
    console.error('MBTI Advice error:', error);
    const fallbackAdvice: AIAdvice = {
      careerAdvice: 'あなたの強みを活かせる職場を探しましょう。自信を持って自分に合う環境を見つけてください。',
      stressManagement: '一人で抱え込まず、信頼できる同期や先輩に相談する時間を作ってください。',
      teamCompatibility:
        'あなたの誠実さはチームに伝わります。感謝の言葉を積極的に伝えることで、より円滑な関係が築けます。',
    };
    return res.status(200).json(fallbackAdvice);
  }
}

