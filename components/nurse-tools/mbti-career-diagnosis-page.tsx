import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Heart,
  History as HistoryIcon,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';
import { QUESTIONS, PERSONALITY_TYPES } from '../../lib/nurse-tools/mbti-constants';
import {
  AIAdvice,
  DiagnosisHistoryItem,
  LikertScale,
  LIKERT_SCORES,
  MBTIDimension,
  MBTIScores,
  PersonalityResult,
} from '../../lib/nurse-tools/mbti-types';
import { MBTIButton, MBTICard, MBTIProgressBar, SkipLink, LikertButtonGroup } from './mbti-ui';
import { MBTIHistory } from './mbti-history';
import { MBTIResultSection } from './mbti-result-section';
import { useSupabaseAuth } from '../../src/hooks/useSupabaseAuth';
import { generateUUID } from '../../src/lib/uuid';

enum AppState {
  WELCOME,
  QUIZ,
  CALCULATING,
  DEEP_DIVE,
  RESULT,
}

type DeepDiveAnswers = {
  experienceYears?: string;
  currentArea?: string;
  desiredTiming?: string;
  constraints?: string[];
  priorities?: string[];
  stressors?: string[];
  freeText?: string;
};

const DEEP_DIVE_TOTAL = 7;
const EXPERIENCE_YEAR_OPTIONS = ['0-1年', '2-3年', '4-6年', '7-10年', '11年以上'] as const;
const CURRENT_AREA_OPTIONS = [
  '病棟（急性期）',
  '病棟（慢性期・療養）',
  '外来',
  'ICU・救急',
  '手術室',
  '訪問看護',
  '施設',
  'その他',
] as const;
const DESIRED_TIMING_OPTIONS = ['今すぐ', '3か月以内', '半年以内', '1年以内', '未定（情報収集）'] as const;
const CONSTRAINT_OPTIONS = [
  '夜勤不可',
  '残業少なめ',
  '土日休み',
  '転居不可',
  '通勤時間を短くしたい',
  '時短希望',
  '子育て・家庭と両立',
  '介護と両立',
  '人間関係が穏やかな職場が良い',
  '体力負担の少ない職場が良い',
] as const;
const PRIORITY_OPTIONS = [
  '収入',
  '休み・生活リズム',
  '成長・スキルアップ',
  '人間関係',
  '患者さんと深く関わる',
  '体力負担の少なさ',
  '安定',
  '教育体制',
  '裁量の大きさ',
] as const;
const STRESSOR_OPTIONS = [
  '急変が多い',
  'クレーム対応',
  '人間関係の摩擦',
  '夜勤の体力負担',
  'マルチタスク',
  'ルールが曖昧',
  '忙しすぎる',
  '教育体制が弱い',
  '相談できる人がいない',
] as const;
const DEEP_DIVE_FREE_TEXT_MAX = 500;

const STORAGE_KEY = 'mbti-diagnosis-result';
const SESSION_KEY = 'mbti-diagnosis-session';
const HISTORY_KEY = 'mbti-diagnosis-history';
const MAX_HISTORY_ITEMS = 10;

interface SavedResult {
  result: PersonalityResult;
  aiAdvice: AIAdvice | null;
  savedAt: string;
}

export function MBTICareerDiagnosisPage() {
  const { session, isAuthenticated } = useSupabaseAuth();
  const accessToken = session?.access_token || null;
  const isDebug = import.meta.env.DEV && new URLSearchParams(window.location.search).has('mbti-debug');

  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<MBTIScores>({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [aiQuota, setAiQuota] = useState<{ remaining: number | null; dailyLimit: number } | null>(null);
  const [finalScores, setFinalScores] = useState<MBTIScores | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<
    Array<{
      questionIndex: number;
      likertValue: LikertScale;
      optionAType: MBTIDimension;
      optionBType: MBTIDimension;
    }>
  >([]);
  const [deepDiveIndex, setDeepDiveIndex] = useState(0);
  const [deepDiveAnswers, setDeepDiveAnswers] = useState<DeepDiveAnswers>({});

  // 初期ロード：保存結果/履歴
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHasSavedResult(true);

    const history = localStorage.getItem(HISTORY_KEY);
    if (history) {
      try {
        setDiagnosisHistory(JSON.parse(history));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  // セッションID（匿名集計用）
  useEffect(() => {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      setSessionId(existing);
      return;
    }
    const newSessionId = generateUUID();
    localStorage.setItem(SESSION_KEY, newSessionId);
    setSessionId(newSessionId);
  }, []);

  // AI残回数の取得（消費しない）
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setAiQuota(null);
      return;
    }

    let isCancelled = false;
    fetch('/api/nurse-tools/mbti-quota', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json().catch(() => null)) as
          | { remaining?: number; dailyLimit?: number }
          | null;
        if (!data) return null;
        const remaining =
          typeof data.remaining === 'number' && Number.isFinite(data.remaining) ? data.remaining : null;
        const dailyLimit =
          typeof data.dailyLimit === 'number' && Number.isFinite(data.dailyLimit) ? data.dailyLimit : 3;
        return { remaining, dailyLimit };
      })
      .then((quota) => {
        if (isCancelled) return;
        if (quota) setAiQuota(quota);
      })
      .catch(() => {
        // no-op（UIは「1日3回まで」表示でフォールバック）
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, isAuthenticated]);

  const latestHistoryItem = useMemo(() => diagnosisHistory[0] || null, [diagnosisHistory]);

  const addToHistory = useCallback((personalityResult: PersonalityResult, scoresToSave: MBTIScores) => {
    const newItem: DiagnosisHistoryItem = {
      id: generateUUID(),
      mbtiType: personalityResult.type,
      title: personalityResult.title,
      scores: scoresToSave,
      savedAt: new Date().toISOString(),
    };

    setDiagnosisHistory((prev) => {
      const filtered = prev.filter((item) => item.mbtiType !== personalityResult.type);
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveResult = useCallback(
    (personalityResult: PersonalityResult, advice: AIAdvice | null, scoresToSave?: MBTIScores) => {
      const data: SavedResult = {
        result: personalityResult,
        aiAdvice: advice,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setHasSavedResult(true);

      if (scoresToSave) addToHistory(personalityResult, scoresToSave);
    },
    [addToHistory]
  );

  const deleteFromHistory = useCallback((id: string) => {
    setDiagnosisHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    if (confirm('診断履歴をすべて削除しますか？')) {
      setDiagnosisHistory([]);
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const recordMbtiResult = useCallback(
    async (mbtiType: string) => {
      try {
        const currentSession =
          sessionId ||
          (() => {
            const newId = generateUUID();
            localStorage.setItem(SESSION_KEY, newId);
            setSessionId(newId);
            return newId;
          })();

        await fetch('/api/nurse-tools/mbti-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mbtiType, sessionId: currentSession }),
        });
      } catch (error) {
        console.error('Failed to record MBTI result:', error);
      }
    },
    [sessionId]
  );

  const fetchAIAdvice = useCallback(
    async (mbtiType: string, personalityData: PersonalityResult, deepDive?: DeepDiveAnswers): Promise<AIAdvice> => {
      try {
        // ログイン必須（未ログイン時は固定文）
        if (!isAuthenticated || !accessToken) {
          return {
            careerAdvice: 'AIキャリアアドバイスはログイン後に利用できます（1日3回まで）。',
            stressManagement: 'ログインするとAIがあなたのタイプに合わせたストレス対策を提案します（1日3回まで）。',
            teamCompatibility: 'ログインするとAIがチームでの立ち回りを提案します（1日3回まで）。',
          };
        }

        const currentSession = sessionId || localStorage.getItem(SESSION_KEY);
        const deepDivePayload =
          deepDive && Object.keys(deepDive).length > 0 ? deepDive : undefined;
        const response = await fetch('/api/nurse-tools/mbti-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ mbtiType, personalityData, sessionId: currentSession, deepDive: deepDivePayload }),
        });

        // 残回数をヘッダから反映（あれば）
        const remainingHeader = response.headers.get('X-RateLimit-Remaining');
        if (remainingHeader) {
          const n = Number(remainingHeader);
          if (Number.isFinite(n)) {
            setAiQuota((prev) => ({ remaining: n, dailyLimit: prev?.dailyLimit ?? 3 }));
          }
        }

        if (response.status === 401) {
          return {
            careerAdvice: 'AIキャリアアドバイスはログイン後に利用できます（1日3回まで）。',
            stressManagement: 'ログインするとAIがあなたのタイプに合わせたストレス対策を提案します（1日3回まで）。',
            teamCompatibility: 'ログインするとAIがチームでの立ち回りを提案します（1日3回まで）。',
          };
        }

        if (response.status === 429) {
          const data = await response.json();
          const msg = (data as { message?: string })?.message || '本日のAIアドバイス取得回数の上限に達しました';
          setAiQuota((prev) => ({ remaining: 0, dailyLimit: prev?.dailyLimit ?? 3 }));
          return {
            careerAdvice: msg,
            stressManagement: msg,
            teamCompatibility: msg,
          };
        }
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(data?.message || 'AIアドバイスの取得に失敗しました');
        }
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch AI advice:', error);
        if (error instanceof Error) {
          const raw = error.message || '';
          const msg =
            raw === 'Failed to fetch'
              ? '通信エラーが発生しました。時間をおいて再度お試しください。'
              : raw;
          // サーバーからのユーザー向けメッセージはそのまま表示する
          if (
            msg.includes('マイグレーション') ||
            msg.includes('環境変数') ||
            msg.includes('不正') ||
            msg.includes('上限') ||
            msg.includes('長すぎ')
          ) {
            return { careerAdvice: msg, stressManagement: msg, teamCompatibility: msg };
          }
        }
        return {
          careerAdvice: `${mbtiType}のあなたは、独自の強みを持っています。自信を持って自分に合う環境を探しましょう。`,
          stressManagement: '一人で抱え込まず、信頼できる同期や先輩に相談する時間を作ってください。',
          teamCompatibility: 'あなたの誠実さはチームに伝わります。感謝の言葉を積極的に伝えることで、より円滑な関係が築けます。',
        };
      }
    },
    [accessToken, isAuthenticated, sessionId]
  );

  const trackSiteClick = useCallback(async (siteName: string, mbtiType: string) => {
    try {
      await fetch('/api/nurse-tools/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          mbtiType,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }, []);

  // 深掘り（任意）回答を初期化（※他のuseCallbackの依存配列で参照されるため、先に定義する）
  const resetDeepDive = useCallback(() => {
    setDeepDiveIndex(0);
    setDeepDiveAnswers({});
  }, []);

  const selectFromHistory = useCallback(
    (item: DiagnosisHistoryItem) => {
      const personalityResult = PERSONALITY_TYPES[item.mbtiType];
      if (!personalityResult) return;

      setResult(personalityResult);
      setFinalScores(item.scores);
      setAiAdvice(null);
      setAiError(false);
      setIsLoadingAi(false);
      resetDeepDive();
      setAppState(AppState.RESULT);
      setShowHistory(false);
    },
    [resetDeepDive]
  );

  const loadSavedResult = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data: SavedResult = JSON.parse(saved);
    setResult(data.result);
    setAiAdvice(data.aiAdvice);
    setAiError(false);
    setIsLoadingAi(false);
    resetDeepDive();

    // 履歴にスコアがあれば拾って表示（レーダーチャート用）
    const matched = diagnosisHistory.find((h) => h.mbtiType === data.result.type);
    setFinalScores(matched?.scores ?? null);

    setAppState(AppState.RESULT);
  }, [diagnosisHistory, resetDeepDive]);

  const toggleMulti = useCallback(
    (key: 'constraints' | 'priorities' | 'stressors', value: string, max: number) => {
      setDeepDiveAnswers((prev) => {
        const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
        const exists = current.includes(value);
        if (exists) {
          return { ...prev, [key]: current.filter((v) => v !== value) };
        }
        if (current.length >= max) {
          return prev;
        }
        return { ...prev, [key]: [...current, value] };
      });
    },
    []
  );

  const goToResult = useCallback(() => {
    setAppState(AppState.RESULT);
  }, []);

  const goNextDeepDive = useCallback(() => {
    setDeepDiveIndex((prev) => {
      const next = prev + 1;
      if (next >= DEEP_DIVE_TOTAL) {
        goToResult();
        return prev;
      }
      return next;
    });
  }, [goToResult]);

  const goPrevDeepDive = useCallback(() => {
    setDeepDiveIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const skipDeepDiveAll = useCallback(() => {
    goToResult();
  }, [goToResult]);

  const handleStart = useCallback(() => {
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setFinalScores(null);
    setResult(null);
    setAiAdvice(null);
    setAiError(false);
    setAnswerHistory([]);
    resetDeepDive();
  }, [resetDeepDive]);

  const handleLikertAnswer = useCallback(
    (likertValue: LikertScale) => {
      const question = QUESTIONS[currentQuestionIndex];
      const optionAType = question.optionA.type;
      const optionBType = question.optionB.type;

      const scoreConfig = LIKERT_SCORES[likertValue];
      const newScores: MBTIScores = {
        ...scores,
        [optionAType]: scores[optionAType] + scoreConfig.primary,
        [optionBType]: scores[optionBType] + scoreConfig.secondary,
      };
      setScores(newScores);
      setAnswerHistory((prev) => [
        ...prev,
        { questionIndex: currentQuestionIndex, likertValue, optionAType, optionBType },
      ]);

      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 250);
      } else {
        // 最終回答 → 計算へ
        setAppState(AppState.CALCULATING);
        setFinalScores(newScores);

        const e_i = newScores.E >= newScores.I ? 'E' : 'I';
        const s_n = newScores.S >= newScores.N ? 'S' : 'N';
        const t_f = newScores.T >= newScores.F ? 'T' : 'F';
        const j_p = newScores.J >= newScores.P ? 'J' : 'P';

        const mbtiType = `${e_i}${s_n}${t_f}${j_p}`;
        const personality = PERSONALITY_TYPES[mbtiType];
        setResult(personality);

        recordMbtiResult(mbtiType);

        // AIは結果画面の「取得する」ボタン押下時のみ（= コスト発生タイミングが明確）
        setAiAdvice(null);
        setIsLoadingAi(false);
        setAiError(false);
        resetDeepDive();
        saveResult(personality, null, newScores);

        setTimeout(() => setAppState(AppState.DEEP_DIVE), 1200);
      }
    },
    [currentQuestionIndex, recordMbtiResult, resetDeepDive, saveResult, scores]
  );

  const handleBack = useCallback(() => {
    if (currentQuestionIndex <= 0) return;
    const lastAnswer = answerHistory[answerHistory.length - 1];
    if (!lastAnswer) return;

    const scoreConfig = LIKERT_SCORES[lastAnswer.likertValue];
    setScores((prev) => ({
      ...prev,
      [lastAnswer.optionAType]: prev[lastAnswer.optionAType] - scoreConfig.primary,
      [lastAnswer.optionBType]: prev[lastAnswer.optionBType] - scoreConfig.secondary,
    }));
    setAnswerHistory((prev) => prev.slice(0, -1));
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  }, [answerHistory, currentQuestionIndex]);

  const retryAIAdvice = useCallback(() => {
    if (!result) return;
    setIsLoadingAi(true);
    setAiError(false);
    fetchAIAdvice(result.type, result, deepDiveAnswers)
      .then((advice) => {
        setAiAdvice(advice);
        saveResult(result, advice);
      })
      .catch((err) => {
        console.error(err);
        setAiError(true);
      })
      .finally(() => setIsLoadingAi(false));
  }, [deepDiveAnswers, fetchAIAdvice, result, saveResult]);

  const resetToWelcome = useCallback(() => {
    setAppState(AppState.WELCOME);
    setCurrentQuestionIndex(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setFinalScores(null);
    setResult(null);
    setAiAdvice(null);
    setAiError(false);
    setAnswerHistory([]);
    setIsLoadingAi(false);
    resetDeepDive();
  }, [resetDeepDive]);

  return (
    <div className="w-full">
      <SkipLink targetId="mbti-main">メインコンテンツへスキップ</SkipLink>

      <div id="mbti-main" className="max-w-3xl mx-auto">
        {isDebug && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <span className="text-xs font-bold text-amber-800">DEV: mbti-debug</span>
            <button
              type="button"
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-amber-200 text-amber-800 hover:bg-amber-100"
              onClick={() => {
                const demo = PERSONALITY_TYPES.ESTJ;
                setResult(demo);
                setFinalScores({ E: 18, I: 12, S: 16, N: 14, T: 17, F: 13, J: 16, P: 14 });
                setAiAdvice(null);
                setAiError(false);
                setIsLoadingAi(false);
                resetDeepDive();
                setAppState(AppState.DEEP_DIVE);
              }}
            >
              深掘りへ
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-amber-200 text-amber-800 hover:bg-amber-100"
              onClick={() => {
                const demo = PERSONALITY_TYPES.ESTJ;
                setResult(demo);
                setFinalScores({ E: 18, I: 12, S: 16, N: 14, T: 17, F: 13, J: 16, P: 14 });
                setAiAdvice(null);
                setAiError(false);
                setIsLoadingAi(false);
                resetDeepDive();
                setAppState(AppState.RESULT);
              }}
            >
              結果へ
            </button>
          </div>
        )}

        {/* タイトル */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-teal-700">
            <Activity className="w-5 h-5" aria-hidden="true" />
            <h2 className="text-xl font-black">ナースキャリア診断AI</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            性格タイプ（MBTI）から、あなたに合う働き方・キャリアのヒントを提案します（所要時間：約2分）。
          </p>
        </div>

        {/* Welcome */}
        {appState === AppState.WELCOME && (
          <MBTICard className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-full relative h-56 sm:h-64 md:h-72 bg-teal-100 rounded-3xl overflow-hidden flex items-center justify-center">
                <img 
                  src="/AI診断画像.png" 
                  alt="ナースキャリア診断AI - あなたはどのタイプ？AIがあなたの強みと働き方を分析！" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                  性格タイプから導く
                  <br />
                  <span className="text-teal-600">理想の看護師キャリア</span>
                </h3>
                <p className="text-slate-600 leading-relaxed max-w-md mx-auto">
                  強みが活かせる職場環境や、相性の良いサービスの傾向をまとめて確認できます。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                {[
                  { icon: Sparkles, text: 'AIによる性格分析' },
                  { icon: Activity, text: '適職・職場診断' },
                  { icon: Heart, text: '相性の良いサイト紹介' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                    <item.icon className="w-6 h-6 text-teal-500 mb-2" />
                    <span className="text-sm font-medium text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 w-full max-w-sm">
                <MBTIButton onClick={handleStart} className="w-full text-lg shadow-teal-300/50">
                  診断を始める <ArrowRight className="w-5 h-5" />
                </MBTIButton>

                {hasSavedResult && (
                  <button
                    onClick={loadSavedResult}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-teal-700 border-2 border-teal-200 hover:bg-teal-50 transition-all"
                    aria-label="前回の診断結果を見る"
                  >
                    <HistoryIcon className="w-5 h-5" />
                    前回の結果を見る
                  </button>
                )}

                {diagnosisHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-slate-600 hover:text-teal-700 transition-all"
                    aria-label="診断履歴を見る"
                  >
                    <HistoryIcon className="w-4 h-4" />
                    診断履歴 {latestHistoryItem ? `(最新: ${latestHistoryItem.mbtiType})` : ''}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400">完全無料 / 匿名で利用できます</p>
            </div>
          </MBTICard>
        )}

        {/* Quiz */}
        {appState === AppState.QUIZ && QUESTIONS[currentQuestionIndex] && (
          <div className="space-y-6">
            <MBTIProgressBar current={currentQuestionIndex + 1} total={QUESTIONS.length} />

            <MBTICard className="min-h-[420px] flex flex-col justify-center items-center text-center space-y-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed">
                Q{QUESTIONS[currentQuestionIndex].id}. {QUESTIONS[currentQuestionIndex].text}
              </h3>

              <div className="w-full space-y-3">
                <div className="flex justify-between items-start gap-4 px-2">
                  <div className="flex-1 text-left">
                    <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded mb-1">A</span>
                    <p className="text-sm text-slate-700 font-medium">{QUESTIONS[currentQuestionIndex].optionA.text}</p>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="inline-block px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold rounded mb-1">B</span>
                    <p className="text-sm text-slate-700 font-medium">{QUESTIONS[currentQuestionIndex].optionB.text}</p>
                  </div>
                </div>
              </div>

              <LikertButtonGroup
                questionText={QUESTIONS[currentQuestionIndex].text}
                optionAText={QUESTIONS[currentQuestionIndex].optionA.text}
                optionBText={QUESTIONS[currentQuestionIndex].optionB.text}
                onSelect={(v) => handleLikertAnswer(v as LikertScale)}
              />

              <div className="w-full flex items-center justify-between pt-2">
                <MBTIButton onClick={handleBack} variant="outline" disabled={currentQuestionIndex === 0}>
                  <ArrowLeft className="w-4 h-4" />
                  戻る
                </MBTIButton>
                <span className="text-xs text-slate-400">※直感で選ぶのがおすすめです</span>
              </div>
            </MBTICard>
          </div>
        )}

        {/* Calculating */}
        {appState === AppState.CALCULATING && (
          <MBTICard className="text-center py-10 space-y-4">
            <div className="mx-auto w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            <div>
              <p className="font-bold text-slate-800">診断結果を計算中...</p>
              <p className="text-sm text-slate-500">もう少しだけお待ちください</p>
            </div>
          </MBTICard>
        )}

        {/* Deep Dive（任意） */}
        {appState === AppState.DEEP_DIVE && result && (
          <MBTICard className="bg-gradient-to-br from-white to-teal-50/30 border border-teal-100">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">深掘り質問（任意）</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    答えるほどAIアドバイスが「あなたの状況」に合わせて具体的になります。答えたくない質問はスキップできます。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={skipDeepDiveAll}
                  className="text-xs font-bold text-slate-600 hover:text-teal-700 underline whitespace-nowrap"
                >
                  スキップして結果を見る
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  深掘り {Math.min(deepDiveIndex + 1, DEEP_DIVE_TOTAL)} / {DEEP_DIVE_TOTAL}
                </span>
                <span>目安：約60秒</span>
              </div>

              {/* Q1 経験年数 */}
              {deepDiveIndex === 0 && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-800">看護師経験はどれくらいですか？</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXPERIENCE_YEAR_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setDeepDiveAnswers((prev) => ({ ...prev, experienceYears: opt }));
                          setTimeout(() => goNextDeepDive(), 120);
                        }}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition-colors ${
                          deepDiveAnswers.experienceYears === opt
                            ? 'bg-teal-500 text-white border-teal-500'
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Q2 現在の領域 */}
              {deepDiveIndex === 1 && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-800">今の働き方に一番近いのは？</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CURRENT_AREA_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setDeepDiveAnswers((prev) => ({ ...prev, currentArea: opt }));
                          setTimeout(() => goNextDeepDive(), 120);
                        }}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition-colors ${
                          deepDiveAnswers.currentArea === opt
                            ? 'bg-teal-500 text-white border-teal-500'
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Q3 希望時期 */}
              {deepDiveIndex === 2 && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-800">転職・異動の希望時期は？</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DESIRED_TIMING_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setDeepDiveAnswers((prev) => ({ ...prev, desiredTiming: opt }));
                          setTimeout(() => goNextDeepDive(), 120);
                        }}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition-colors ${
                          deepDiveAnswers.desiredTiming === opt
                            ? 'bg-teal-500 text-white border-teal-500'
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Q4 制約 */}
              {deepDiveIndex === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-800">譲れない条件（最大5つ）</p>
                    <span className="text-xs text-slate-500">
                      {(deepDiveAnswers.constraints?.length ?? 0)}/5
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CONSTRAINT_OPTIONS.map((opt) => {
                      const selected = deepDiveAnswers.constraints?.includes(opt) ?? false;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleMulti('constraints', opt, 5)}
                          className={`px-3 py-2 rounded-full text-xs font-black border transition-colors ${
                            selected
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500">※未選択でもOKです</p>
                </div>
              )}

              {/* Q5 優先順位 */}
              {deepDiveIndex === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-800">いま優先したいもの（上位3つ）</p>
                    <span className="text-xs text-slate-500">
                      {(deepDiveAnswers.priorities?.length ?? 0)}/3
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITY_OPTIONS.map((opt) => {
                      const selected = deepDiveAnswers.priorities?.includes(opt) ?? false;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleMulti('priorities', opt, 3)}
                          className={`px-3 py-2 rounded-full text-xs font-black border transition-colors ${
                            selected
                              ? 'bg-indigo-500 text-white border-indigo-500'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500">※3つ選ぶとAIが提案の優先度を調整できます</p>
                </div>
              )}

              {/* Q6 ストレス要因 */}
              {deepDiveIndex === 5 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-800">つらくなりやすい状況（最大3つ）</p>
                    <span className="text-xs text-slate-500">
                      {(deepDiveAnswers.stressors?.length ?? 0)}/3
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STRESSOR_OPTIONS.map((opt) => {
                      const selected = deepDiveAnswers.stressors?.includes(opt) ?? false;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleMulti('stressors', opt, 3)}
                          className={`px-3 py-2 rounded-full text-xs font-black border transition-colors ${
                            selected
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500">※ストレス対策の具体性が上がります</p>
                </div>
              )}

              {/* Q7 自由記述 */}
              {deepDiveIndex === 6 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-800">今いちばんの悩み／叶えたい働き方（任意）</p>
                    <span className="text-xs text-slate-500">
                      {(deepDiveAnswers.freeText?.length ?? 0)}/{DEEP_DIVE_FREE_TEXT_MAX}
                    </span>
                  </div>
                  <textarea
                    value={deepDiveAnswers.freeText ?? ''}
                    onChange={(e) => setDeepDiveAnswers((prev) => ({ ...prev, freeText: e.target.value }))}
                    placeholder="例：夜勤がきついので日勤中心で、患者さんと関われる仕事がしたい…など"
                    maxLength={DEEP_DIVE_FREE_TEXT_MAX}
                    className="w-full min-h-[120px] rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-slate-500">※空欄でもOKです</p>
                </div>
              )}

              {/* ナビゲーション */}
              <div className="pt-2 flex items-center justify-between">
                <MBTIButton variant="outline" onClick={goPrevDeepDive} disabled={deepDiveIndex === 0}>
                  <ArrowLeft className="w-4 h-4" />
                  戻る
                </MBTIButton>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goNextDeepDive}
                    className="px-4 py-2 rounded-full text-sm font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    この質問はスキップ
                  </button>
                  {deepDiveIndex >= 3 && deepDiveIndex <= 5 && (
                    <MBTIButton onClick={goNextDeepDive}>
                      次へ <ArrowRight className="w-4 h-4" />
                    </MBTIButton>
                  )}
                  {deepDiveIndex === 6 && (
                    <MBTIButton onClick={goNextDeepDive} className="shadow-teal-300/50">
                      結果を見る <ArrowRight className="w-4 h-4" />
                    </MBTIButton>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-white/70 border border-slate-100 rounded-xl p-3">
                ※AIは「AIキャリアアドバイスを取得」を押した時だけ実行されます（1日3回まで）。
              </div>
            </div>
          </MBTICard>
        )}

        {/* Result */}
        {appState === AppState.RESULT && result && (
          <MBTIResultSection
            result={result}
            aiAdvice={aiAdvice}
            isLoadingAi={isLoadingAi}
            aiError={aiError}
            aiQuota={aiQuota ? { ...aiQuota, isLoggedIn: isAuthenticated } : { remaining: null, dailyLimit: 3, isLoggedIn: isAuthenticated }}
            finalScores={finalScores}
            diagnosisHistory={diagnosisHistory}
            onRetryAIAdvice={retryAIAdvice}
            onReset={resetToWelcome}
            onTrackSiteClick={trackSiteClick}
            onSelectFromHistory={selectFromHistory}
            onDeleteFromHistory={deleteFromHistory}
            onClearHistory={clearHistory}
          />
        )}
      </div>

      {/* 履歴モーダル（Welcome から開く用） */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-xl">
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full shadow p-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="履歴を閉じる"
            >
              <X className="w-4 h-4" />
            </button>
            <MBTIHistory
              history={diagnosisHistory}
              onSelect={(item) => selectFromHistory(item)}
              onDelete={(id) => deleteFromHistory(id)}
              onClear={() => clearHistory()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

