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

enum AppState {
  WELCOME,
  QUIZ,
  CALCULATING,
  RESULT,
}

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
    const newSessionId = crypto.randomUUID();
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
      id: crypto.randomUUID(),
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
            const newId = crypto.randomUUID();
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
    async (mbtiType: string, personalityData: PersonalityResult): Promise<AIAdvice> => {
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
        const response = await fetch('/api/nurse-tools/mbti-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ mbtiType, personalityData, sessionId: currentSession }),
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
        if (error instanceof Error && error.message.includes('マイグレーション')) {
          const msg = error.message;
          return { careerAdvice: msg, stressManagement: msg, teamCompatibility: msg };
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

  const selectFromHistory = useCallback(
    (item: DiagnosisHistoryItem) => {
      const personalityResult = PERSONALITY_TYPES[item.mbtiType];
      if (!personalityResult) return;

      setResult(personalityResult);
      setFinalScores(item.scores);
      setAiAdvice(null);
      setAiError(false);
      setAppState(AppState.RESULT);
      setShowHistory(false);

      setIsLoadingAi(true);
      fetchAIAdvice(personalityResult.type, personalityResult)
        .then((advice) => setAiAdvice(advice))
        .catch((err) => {
          console.error(err);
          setAiError(true);
        })
        .finally(() => setIsLoadingAi(false));
    },
    [fetchAIAdvice]
  );

  const loadSavedResult = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data: SavedResult = JSON.parse(saved);
    setResult(data.result);
    setAiAdvice(data.aiAdvice);
    setAiError(false);

    // 履歴にスコアがあれば拾って表示（レーダーチャート用）
    const matched = diagnosisHistory.find((h) => h.mbtiType === data.result.type);
    setFinalScores(matched?.scores ?? null);

    setAppState(AppState.RESULT);
  }, [diagnosisHistory]);

  const handleStart = useCallback(() => {
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setFinalScores(null);
    setResult(null);
    setAiAdvice(null);
    setAiError(false);
    setAnswerHistory([]);
  }, []);

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

        setIsLoadingAi(true);
        setAiError(false);
        fetchAIAdvice(personality.type, personality)
          .then((advice) => {
            setAiAdvice(advice);
            saveResult(personality, advice, newScores);
          })
          .catch((err) => {
            console.error(err);
            setAiError(true);
          })
          .finally(() => setIsLoadingAi(false));

        setTimeout(() => setAppState(AppState.RESULT), 1200);
      }
    },
    [currentQuestionIndex, fetchAIAdvice, recordMbtiResult, saveResult, scores]
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
    fetchAIAdvice(result.type, result)
      .then((advice) => {
        setAiAdvice(advice);
        saveResult(result, advice);
      })
      .catch((err) => {
        console.error(err);
        setAiError(true);
      })
      .finally(() => setIsLoadingAi(false));
  }, [fetchAIAdvice, result, saveResult]);

  const resetToWelcome = useCallback(() => {
    setAppState(AppState.WELCOME);
    setCurrentQuestionIndex(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setFinalScores(null);
    setResult(null);
    setAiAdvice(null);
    setAiError(false);
    setAnswerHistory([]);
  }, []);

  return (
    <div className="w-full">
      <SkipLink targetId="mbti-main">メインコンテンツへスキップ</SkipLink>

      <div id="mbti-main" className="max-w-3xl mx-auto">
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
              <div className="w-full relative h-56 bg-teal-100 rounded-3xl overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-blue-200 opacity-50" />
                <div className="relative z-10 bg-white/90 p-6 rounded-2xl shadow-lg max-w-xs">
                  <Stethoscope className="w-10 h-10 text-teal-500 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-teal-800">あなたに合う働き方は？</h3>
                </div>
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
                    <item.icon className="w-6 h-6 text-pink-500 mb-2" />
                    <span className="text-sm font-medium">{item.text}</span>
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

