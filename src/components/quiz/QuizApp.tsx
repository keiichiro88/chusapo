import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Flame,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { quizLessons, QUIZ_BOOK_TITLE } from '../../quiz/quizData';
import { QuizLesson, QuizQuestion } from '../../quiz/quizTypes';

interface QuizAppProps {
  onBack: () => void;
}

type LessonAttempt = {
  correct: number;
  total: number;
  percent: number;
  at: string; // ISO
};

type LessonProgress = {
  attempts: number;
  bestCorrect: number;
  bestTotal: number;
  bestPercent: number;
  lastCorrect: number;
  lastTotal: number;
  lastPercent: number;
  updatedAt: string; // ISO
  /** 直近の履歴（推移表示用）。古い保存データとの互換のため optional */
  history?: LessonAttempt[];
};

const PROGRESS_STORAGE_KEY = 'chusapo.quiz.progress.v1';
const STATS_STORAGE_KEY = 'chusapo.quiz.stats.v1';

type QuizStats = {
  totalXp: number;
  totalAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  dailyCompletions: Record<string, number>; // YYYY-MM-DD => completions
  updatedAt: string; // ISO
};

const safeParseJson = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const loadProgress = (): Record<string, LessonProgress> => {
  const parsed = safeParseJson<Record<string, LessonProgress>>(localStorage.getItem(PROGRESS_STORAGE_KEY));
  if (!parsed || typeof parsed !== 'object') return {};
  return parsed;
};

const saveProgress = (data: Record<string, LessonProgress>) => {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
};

const formatPercent = (n: number) => `${Math.max(0, Math.min(100, Math.round(n)))}%`;

const calcPercent = (correct: number, total: number) => (total <= 0 ? 0 : (correct / total) * 100);

const defaultStats = (): QuizStats => ({
  totalXp: 0,
  totalAttempts: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  dailyCompletions: {},
  updatedAt: new Date().toISOString()
});

const isValidStats = (raw: unknown): raw is QuizStats => {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Partial<QuizStats>;
  return (
    typeof r.totalXp === 'number' &&
    typeof r.totalAttempts === 'number' &&
    typeof r.totalCorrect === 'number' &&
    typeof r.totalQuestions === 'number' &&
    typeof r.updatedAt === 'string' &&
    !!r.dailyCompletions &&
    typeof r.dailyCompletions === 'object'
  );
};

const calcXpGain = (correct: number, total: number) => {
  const percent = calcPercent(correct, total);
  let xp = 20 + correct * 10; // 完走ボーナス + 正答ボーナス
  if (percent === 100) xp += 100;
  else if (percent >= 90) xp += 60;
  else if (percent >= 80) xp += 30;
  return xp;
};

const pruneDailyCompletions = (daily: Record<string, number>) => {
  // 直近180日分のみ保持
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 180);
  const next: Record<string, number> = {};
  Object.entries(daily).forEach(([key, value]) => {
    const d = new Date(`${key}T00:00:00`);
    if (d.getTime() >= cutoff.getTime()) next[key] = value;
  });
  return next;
};

const loadStats = (): QuizStats => {
  const parsed = safeParseJson<unknown>(localStorage.getItem(STATS_STORAGE_KEY));
  if (isValidStats(parsed)) return parsed;

  // 既存のprogressから可能な範囲で復元（historyがあればそれを優先）
  const progress = loadProgress();
  const attempts: LessonAttempt[] = [];
  Object.values(progress).forEach((p) => {
    if (p?.history?.length) attempts.push(...p.history);
    else if ((p?.attempts ?? 0) > 0 && p.updatedAt) {
      attempts.push({ correct: p.lastCorrect, total: p.lastTotal, percent: p.lastPercent, at: p.updatedAt });
    }
  });

  const daily: Record<string, number> = {};
  let totalXp = 0;
  let totalCorrect = 0;
  let totalQuestions = 0;
  attempts.forEach((a) => {
    const dayKey = toLocalDayKey(a.at);
    daily[dayKey] = (daily[dayKey] ?? 0) + 1;
    totalXp += calcXpGain(a.correct, a.total);
    totalCorrect += a.correct;
    totalQuestions += a.total;
  });

  const next: QuizStats = {
    totalXp,
    totalAttempts: attempts.length,
    totalCorrect,
    totalQuestions,
    dailyCompletions: pruneDailyCompletions(daily),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
  return next;
};

const saveStats = (data: QuizStats) => {
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(data));
};

const percentColorClass = (percent: number) => {
  if (percent >= 90) return 'bg-emerald-500';
  if (percent >= 80) return 'bg-blue-600';
  if (percent >= 70) return 'bg-sky-500';
  if (percent >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const gradeLabel = (percent: number) => {
  if (percent >= 90) return 'S';
  if (percent >= 80) return 'A';
  if (percent >= 70) return 'B';
  if (percent >= 60) return 'C';
  return 'D';
};

const toLocalDayKey = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toDayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const xpForLevel = (level: number) => 50 * level * (level - 1); // Lv1=0, Lv2=100, Lv3=300...

const calcLevelInfo = (xp: number) => {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const progress = next === start ? 1 : (xp - start) / (next - start);
  const remaining = Math.max(0, next - xp);
  return { level, start, next, progress: Math.max(0, Math.min(1, progress)), remaining };
};

const QuizApp: React.FC<QuizAppProps> = ({ onBack }) => {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>(() => loadProgress());
  const [stats, setStats] = useState<QuizStats>(() => loadStats());
  const [tab, setTab] = useState<'lessons' | 'stats'>('lessons');

  const activeLesson = useMemo<QuizLesson | null>(() => {
    if (!activeLessonId) return null;
    return quizLessons.find(l => l.id === activeLessonId) ?? null;
  }, [activeLessonId]);

  const handleLessonCompleted = (lesson: QuizLesson, correct: number, total: number) => {
    const percent = calcPercent(correct, total);
    const attempt: LessonAttempt = {
      correct,
      total,
      percent,
      at: new Date().toISOString()
    };
    setProgress(prev => {
      const existing = prev[lesson.id];
      const next: LessonProgress = {
        attempts: (existing?.attempts ?? 0) + 1,
        bestCorrect: existing ? Math.max(existing.bestCorrect, correct) : correct,
        bestTotal: existing?.bestTotal ?? total,
        bestPercent: existing ? Math.max(existing.bestPercent, percent) : percent,
        lastCorrect: correct,
        lastTotal: total,
        lastPercent: percent,
        updatedAt: attempt.at,
        history: [...(existing?.history ?? []), attempt].slice(-30)
      };
      const merged = { ...prev, [lesson.id]: next };
      saveProgress(merged);
      return merged;
    });

    // 統計（XP/日別完走数）も更新
    setStats(prev => {
      const dayKey = toLocalDayKey(attempt.at);
      const daily = { ...(prev.dailyCompletions ?? {}) };
      daily[dayKey] = (daily[dayKey] ?? 0) + 1;
      const next: QuizStats = {
        totalXp: (prev.totalXp ?? 0) + calcXpGain(correct, total),
        totalAttempts: (prev.totalAttempts ?? 0) + 1,
        totalCorrect: (prev.totalCorrect ?? 0) + correct,
        totalQuestions: (prev.totalQuestions ?? 0) + total,
        dailyCompletions: pruneDailyCompletions(daily),
        updatedAt: attempt.at
      };
      saveStats(next);
      return next;
    });
  };

  const resetAllProgress = () => {
    const ok = window.confirm('成績（正答率・履歴）をリセットします。よろしいですか？');
    if (!ok) return;
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    localStorage.removeItem(STATS_STORAGE_KEY);
    setProgress({});
    setStats(defaultStats());
    setTab('lessons');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <button
            onClick={activeLesson ? () => setActiveLessonId(null) : onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">{activeLesson ? 'Lesson一覧に戻る' : 'ホームに戻る'}</span>
          </button>
          <h1 className="text-3xl font-black text-gray-900 mb-2">学習クイズ</h1>
          <p className="text-gray-600">
            4択クイズで学習を進めます。解説には書籍の参照ページを表示します（例：『{QUIZ_BOOK_TITLE}』）。
          </p>

          {!activeLesson && (
            <div className="mt-4 inline-flex rounded-xl border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setTab('lessons')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                  tab === 'lessons' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                レッスン一覧
              </button>
              <button
                type="button"
                onClick={() => setTab('stats')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${
                  tab === 'stats' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                成績
              </button>
            </div>
          )}
        </div>

        {/* アイキャッチ（レッスン一覧のときだけ表示） */}
        {!activeLesson && tab === 'lessons' && (
          <div className="mt-6 lg:mt-0 lg:ml-8 shrink-0 w-full lg:w-auto">
            <img
              src="/quiz-eyecatch.png"
              alt="学習クイズのアイキャッチ画像"
              className="w-full max-w-xl rounded-2xl border border-gray-200 shadow-sm object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
      </div>

      {activeLesson ? (
        <LessonRunner
          lesson={activeLesson}
          onExit={() => setActiveLessonId(null)}
          onCompleted={(correct, total) => handleLessonCompleted(activeLesson, correct, total)}
        />
      ) : (
        <>
          {tab === 'stats' ? (
            <StatsDashboard
              progress={progress}
              stats={stats}
              onResetAll={resetAllProgress}
              onStartLesson={(lessonId) => setActiveLessonId(lessonId)}
            />
          ) : (
            <LessonList
              progress={progress}
              onStartLesson={(lessonId) => setActiveLessonId(lessonId)}
            />
          )}
        </>
      )}
    </div>
  );
};

const LessonList: React.FC<{
  progress: Record<string, LessonProgress>;
  onStartLesson: (lessonId: string) => void;
}> = ({ progress, onStartLesson }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {quizLessons.map((lesson) => {
        const p = progress[lesson.id];
        const last = p?.lastPercent ?? 0;
        return (
          <div key={lesson.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-black text-gray-900 truncate">{lesson.title}</h2>
                {lesson.description && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{lesson.description}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold text-gray-500">問題数</div>
                <div className="text-2xl font-black text-gray-900">{lesson.questions.length}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-xs font-bold text-gray-500 mb-1">ベスト</div>
                <div className="text-sm font-bold text-gray-900">
                  {p ? formatPercent(p.bestPercent) : '--'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-xs font-bold text-gray-500 mb-1">前回</div>
                <div className="text-sm font-bold text-gray-900">
                  {p ? formatPercent(p.lastPercent) : '--'}
                </div>
              </div>
            </div>

            {/* 前回正答率（ミニチャート） */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                <span>前回の正答率</span>
                <span className="text-gray-700">{p ? `${gradeLabel(last)}ランク` : '--'}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${percentColorClass(last)}`}
                  style={{ width: `${Math.max(0, Math.min(100, last))}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => onStartLesson(lesson.id)}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Lesson{lesson.id.replace('lesson-', '')}を開始</span>
            </button>

            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              ※ 解説には参照ページを表示します（例：『{QUIZ_BOOK_TITLE}』 p.xx）。
            </p>
          </div>
        );
      })}
    </div>
  );
};

const StatsDashboard: React.FC<{
  progress: Record<string, LessonProgress>;
  stats: QuizStats;
  onResetAll: () => void;
  onStartLesson: (lessonId: string) => void;
}> = ({ progress, stats, onResetAll, onStartLesson }) => {
  const lessons = useMemo(() => {
    return quizLessons.map((lesson) => {
      const p = progress[lesson.id];
      const history =
        p?.history?.length
          ? p.history
          : p && (p.attempts ?? 0) > 0
            ? [{ correct: p.lastCorrect, total: p.lastTotal, percent: p.lastPercent, at: p.updatedAt }]
            : [];
      const lastPercent = p?.lastPercent ?? 0;
      const bestPercent = p?.bestPercent ?? 0;
      return {
        lesson,
        progress: p,
        history,
        lastPercent,
        bestPercent
      };
    });
  }, [progress]);

  const attempts = useMemo(() => lessons.flatMap(l => l.history), [lessons]);

  const summary = useMemo(() => {
    const hasStatsTotals = (stats?.totalAttempts ?? 0) > 0 || (stats?.totalQuestions ?? 0) > 0;
    const totalCorrect = hasStatsTotals ? (stats.totalCorrect ?? 0) : attempts.reduce((acc, a) => acc + a.correct, 0);
    const totalTotal = hasStatsTotals ? (stats.totalQuestions ?? 0) : attempts.reduce((acc, a) => acc + a.total, 0);
    const overallPercent = calcPercent(totalCorrect, totalTotal);

    const uniqueLessons = lessons.filter(l => (l.progress?.attempts ?? 0) > 0).length;
    const totalAttempts = hasStatsTotals ? (stats.totalAttempts ?? 0) : attempts.length;

    // 連続学習（最終学習日からの連続日数）
    const days = Array.from(
      new Set(
        Object.entries(stats?.dailyCompletions ?? {})
          .filter(([, count]) => (count ?? 0) > 0)
          .map(([day]) => day)
      )
    )
      .sort()
      .reverse();
    let streak = 0;
    if (days.length > 0) {
      streak = 1;
      for (let i = 0; i < days.length - 1; i++) {
        const d1 = new Date(`${days[i]}T00:00:00`);
        const d2 = new Date(`${days[i + 1]}T00:00:00`);
        const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak += 1;
        else break;
      }
    }

    const lastDay = days[0] ?? null;
    const today = toLocalDayKey(new Date().toISOString());
    const studiedToday = lastDay === today;

    return {
      overallPercent,
      totalCorrect,
      totalTotal,
      uniqueLessons,
      totalAttempts,
      streak,
      lastDay,
      studiedToday,
      totalXp: stats?.totalXp ?? 0
    };
  }, [attempts, lessons, stats]);

  const level = useMemo(() => calcLevelInfo(summary.totalXp), [summary.totalXp]);

  const heatmap = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monIndex = (today.getDay() + 6) % 7; // Mon=0..Sun=6
    const monday = new Date(today);
    monday.setDate(today.getDate() - monIndex);
    const start = new Date(monday);
    start.setDate(monday.getDate() - 21); // 過去4週

    const cells: Array<{ key: string; count: number; isToday: boolean }> = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toDayKey(d);
      const count = (stats?.dailyCompletions?.[key] ?? 0) as number;
      cells.push({ key, count, isToday: key === toDayKey(today) });
    }

    const total = cells.reduce((acc, c) => acc + c.count, 0);
    const thisWeek = cells.slice(21).reduce((acc, c) => acc + c.count, 0);

    return { cells, total, thisWeek, startKey: toDayKey(start), endKey: toDayKey(today) };
  }, [stats]);

  const heatColor = (count: number) => {
    if (count <= 0) return 'bg-gray-100 border-gray-200';
    if (count === 1) return 'bg-emerald-200 border-emerald-200';
    if (count === 2) return 'bg-emerald-400 border-emerald-400';
    if (count === 3) return 'bg-emerald-600 border-emerald-600';
    return 'bg-emerald-800 border-emerald-800';
  };

  const weakest = useMemo(() => {
    return lessons
      .filter(l => (l.progress?.attempts ?? 0) > 0)
      .sort((a, b) => a.lastPercent - b.lastPercent)
      .slice(0, 3);
  }, [lessons]);

  const sortedForChart = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const aHas = (a.progress?.attempts ?? 0) > 0;
      const bHas = (b.progress?.attempts ?? 0) > 0;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return a.lastPercent - b.lastPercent; // 低い順（苦手が見つけやすい）
    });
  }, [lessons]);

  return (
    <div className="space-y-6">
      {/* 成績アイキャッチ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <img
          src="/quiz-stats-eyecatch.png"
          alt="学習クイズ 成績のアイキャッチ画像"
          className="w-full h-auto object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500">学習レベル</div>
            <div className="text-xs font-black text-gray-900">XP {summary.totalXp}</div>
          </div>
          <div className="mt-2 text-3xl font-black text-gray-900">Lv.{level.level}</div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${Math.round(level.progress * 100)}%` }} />
          </div>
          <div className="mt-1 text-sm text-gray-600 font-medium">
            次のLvまで {level.remaining}XP
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="text-xs font-bold text-gray-500">全体の正答率</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{formatPercent(summary.overallPercent)}</div>
          <div className="mt-1 text-sm text-gray-600 font-medium">
            {summary.totalCorrect}/{summary.totalTotal} 正解
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="text-xs font-bold text-gray-500">挑戦回数</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{summary.totalAttempts}</div>
          <div className="mt-1 text-sm text-gray-600 font-medium">学習したLesson: {summary.uniqueLessons}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500">連続学習</div>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-gray-900">{summary.streak}日</div>
          <div className="mt-1 text-sm text-gray-600 font-medium">
            {summary.lastDay ? `最終: ${summary.lastDay}` : 'まだ記録がありません'}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="text-xs font-bold text-gray-500">今日の学習</div>
          <div className={`mt-2 text-3xl font-black ${summary.studiedToday ? 'text-emerald-600' : 'text-gray-900'}`}>
            {summary.studiedToday ? 'OK' : '未'}
          </div>
          <div className="mt-1 text-sm text-gray-600 font-medium">
            {summary.studiedToday ? 'ナイスです。続けましょう。' : '1レッスンだけでもやると流れが作れます。'}
          </div>
        </div>
      </div>

      {/* 週間ヒートマップ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">週間ヒートマップ（過去4週間）</h2>
            <p className="text-sm text-gray-600 mt-1">
              1マス=1日（色が濃いほど、その日に完走したレッスン数が多い）
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-500">今週</div>
            <div className="text-2xl font-black text-gray-900">{heatmap.thisWeek}回</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-7 gap-2 text-xs font-bold text-gray-500 mb-2">
            {['月', '火', '水', '木', '金', '土', '日'].map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {heatmap.cells.map((c) => (
              <div
                key={c.key}
                title={`${c.key}：${c.count}回`}
                className={`h-8 rounded-lg border ${heatColor(c.count)} ${c.isToday ? 'ring-2 ring-blue-500/40' : ''}`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-500">
            <span>{heatmap.startKey}</span>
            <div className="flex items-center gap-1">
              <span className="mr-2">少</span>
              {[0, 1, 2, 3, 4].map((n) => (
                <div key={n} className={`h-3 w-3 rounded border ${heatColor(n)}`} />
              ))}
              <span className="ml-2">多</span>
            </div>
            <span>{heatmap.endKey}</span>
          </div>
        </div>
      </div>

      {/* 苦手TOP3 */}
      {weakest.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">苦手Lesson（前回が低い順）</h2>
              <p className="text-sm text-gray-600 mt-1">ここを潰すと、全体の正答率が一気に上がります。</p>
            </div>
            <button
              onClick={onResetAll}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
            >
              成績リセット
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {weakest.map(({ lesson, lastPercent }) => (
              <div key={lesson.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-sm font-black text-gray-900 line-clamp-2">{lesson.title}</div>
                <div className="mt-2 flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>前回</span>
                  <span className="text-gray-900">{formatPercent(lastPercent)}（{gradeLabel(lastPercent)}）</span>
                </div>
                <div className="mt-2 h-2 bg-white rounded-full overflow-hidden border border-gray-200">
                  <div
                    className={`h-2 ${percentColorClass(lastPercent)}`}
                    style={{ width: `${Math.max(0, Math.min(100, lastPercent))}%` }}
                  />
                </div>
                <button
                  onClick={() => onStartLesson(lesson.id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>今すぐ挑戦</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* レッスン別チャート */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">レッスン別 正答率チャート</h2>
            <p className="text-sm text-gray-600 mt-1">「前回」「ベスト」を棒グラフで比較できます。</p>
          </div>
          <button
            onClick={onResetAll}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
          >
            成績リセット
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {sortedForChart.map(({ lesson, progress: p, lastPercent, bestPercent }) => {
            const has = (p?.attempts ?? 0) > 0;
            return (
              <div key={lesson.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-black text-gray-900 line-clamp-2">{lesson.title}</div>
                    <div className="mt-1 text-xs font-bold text-gray-500">
                      {has ? `挑戦: ${p?.attempts ?? 0}回 / 前回: ${formatPercent(lastPercent)} / ベスト: ${formatPercent(bestPercent)}` : '未挑戦'}
                    </div>
                  </div>
                  <button
                    onClick={() => onStartLesson(lesson.id)}
                    className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>開始</span>
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-xs font-bold text-gray-500">前回</div>
                    <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-gray-200">
                      <div
                        className={`h-2.5 ${percentColorClass(lastPercent)}`}
                        style={{ width: `${Math.max(0, Math.min(100, lastPercent))}%` }}
                      />
                    </div>
                    <div className="w-14 text-right text-xs font-black text-gray-900">{formatPercent(lastPercent)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-xs font-bold text-gray-500">ベスト</div>
                    <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-gray-200">
                      <div
                        className="h-2.5 bg-gray-400"
                        style={{ width: `${Math.max(0, Math.min(100, bestPercent))}%` }}
                      />
                    </div>
                    <div className="w-14 text-right text-xs font-black text-gray-900">{formatPercent(bestPercent)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LessonRunner: React.FC<{
  lesson: QuizLesson;
  onExit: () => void;
  onCompleted: (correct: number, total: number) => void;
}> = ({ lesson, onExit, onCompleted }) => {
  const total = lesson.questions.length;
  const [step, setStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<{ selectedIndex: number; isCorrect: boolean }>>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion: QuizQuestion | null = lesson.questions[step] ?? null;
  const isAnswered = selectedIndex !== null;

  const correctCount = useMemo(() => answers.filter(a => a.isCorrect).length, [answers]);

  const resetLesson = () => {
    setStep(0);
    setSelectedIndex(null);
    setAnswers([]);
    setIsFinished(false);
  };

  const handleSelect = (idx: number) => {
    if (!currentQuestion) return;
    if (isAnswered) return;
    
    // 正解判定
    const isCorrect = currentQuestion.options[idx].isCorrect;
    
    setSelectedIndex(idx);
    setAnswers(prev => [...prev, { selectedIndex: idx, isCorrect }]);
  };

  const goNext = () => {
    if (!currentQuestion) return;
    if (step + 1 >= total) {
      const finalCorrect = correctCount;
      setIsFinished(true);
      onCompleted(finalCorrect, total);
      return;
    }
    setStep(prev => prev + 1);
    setSelectedIndex(null);
  };

  const goPrev = () => {
    // MVPでは「戻る」は実装しない
  };

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-700">このLessonには問題がまだありません。</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
        >
          Lesson一覧へ戻る
        </button>
      </div>
    );
  }

  if (isFinished) {
    const percent = calcPercent(correctCount, total);
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-black text-gray-900">結果</h2>
        <div className="mt-4 flex items-center gap-3">
          <div className="text-4xl font-black text-gray-900">{formatPercent(percent)}</div>
          <div className="text-gray-600 font-medium">{correctCount}/{total} 正解</div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetLesson}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>もう一度挑戦</span>
          </button>
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Lesson一覧へ戻る</span>
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = calcPercent(step, Math.max(1, total));
  const selected = selectedIndex;

  // レッスンIDからアイキャッチ画像のパスを取得
  const lessonEyecatchMap: Record<string, string> = {
    'lesson-1': '/ Lesson１.png',
    'lesson-2': '/ Lesson２.png',
    'lesson-3': '/ Lesson３.png',
    'lesson-4': '/ Lesson４.png',
    'lesson-5': '/ Lesson５.png',
    'lesson-6': '/ Lesson６.png',
    'lesson-7': '/ Lesson７.png',
    'lesson-8': '/ Lesson８.png',
    'lesson-9': '/ Lesson９.png',
    'lesson-10': '/ Lesson１０.png',
    'lesson-11': '/ Lesson１１.png',
  };
  const lessonEyecatch = lessonEyecatchMap[lesson.id];

  return (
    <div className="space-y-4">
      {/* レッスンアイキャッチ画像 */}
      {lessonEyecatch && (
        <div className="w-full">
          <img
            src={lessonEyecatch}
            alt={`${lesson.title} アイキャッチ`}
            className="w-full max-w-3xl mx-auto rounded-2xl shadow-sm object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-gray-900 truncate">{lesson.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {step + 1}/{total} 問目
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-3 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
          >
            終了
          </button>
        </div>

      {/* 進捗バー */}
      <div className="mt-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 問題文 */}
      <div className="mt-6">
        <p className="text-gray-900 font-bold leading-relaxed">{currentQuestion.questionText}</p>
      </div>

      {/* 選択肢 */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrect = option.isCorrect;
          
          // 正解表示条件: 回答済み かつ (この選択肢が正解)
          const showCorrect = isAnswered && isCorrect;
          // 不正解表示条件: 回答済み かつ 自分が選んだ かつ (不正解)
          const showWrong = isAnswered && isSelected && !isCorrect;

          const base =
            'w-full text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30';
          const classes = showCorrect
            ? 'border-emerald-300 bg-emerald-50'
            : showWrong
              ? 'border-red-300 bg-red-50'
              : isSelected
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50';

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`${base} ${classes} ${isAnswered ? 'cursor-default' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {showCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : showWrong ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                      {String.fromCharCode(65 + idx)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 leading-relaxed">{option.text}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 解説 */}
      {isAnswered && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-black text-gray-900">解説</h3>
          </div>

          {/* Lesson 1 の特定問題用の挿絵（解説の補助） */}
          {lesson.id === 'lesson-1' && ['q1-1', 'q1-2', 'q1-3', 'q1-6', 'q1-7', 'q1-10'].includes(currentQuestion.id) && (
            <div className="mb-4">
              <img
                src={
                  currentQuestion.id === 'q1-1'
                    ? '/quiz-lesson1-explanation-illust.png'
                    : currentQuestion.id === 'q1-2'
                    ? '/quiz-lesson1-q2-illust.png'
                    : currentQuestion.id === 'q1-3'
                    ? '/quiz-lesson1-q3-illust.png'
                    : currentQuestion.id === 'q1-6'
                    ? '/quiz-lesson1-q6-illust.png'
                    : currentQuestion.id === 'q1-7'
                    ? '/quiz-lesson1-q7-illust.png'
                    : '/quiz-lesson1-q10-illust.png'
                }
                alt={`Lesson 1-${currentQuestion.id.replace('q1-', '')} 解説の挿絵`}
                className="w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {/* Lesson 2 の特定問題用の挿絵（解説の補助） */}
          {lesson.id === 'lesson-2' && ['q2-1', 'q2-2', 'q2-3', 'q2-6', 'q2-10'].includes(currentQuestion.id) && (
            <div className="mb-4">
              <img
                src={
                  currentQuestion.id === 'q2-1'
                    ? '/quiz-lesson2-q1-illust.png'
                    : currentQuestion.id === 'q2-2'
                    ? '/quiz-lesson2-q2-illust.png'
                    : currentQuestion.id === 'q2-3'
                    ? '/quiz-lesson2-q3-illust.png'
                    : currentQuestion.id === 'q2-6'
                    ? '/quiz-lesson2-q6-illust.png'
                    : '/quiz-lesson2-q10-illust.png'
                }
                alt={`Lesson 2-${currentQuestion.id.replace('q2-', '')} 解説の挿絵`}
                className="w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {/* Lesson 3 の特定問題用の挿絵（解説の補助） */}
          {lesson.id === 'lesson-3' && ['q3-1', 'q3-2', 'q3-7'].includes(currentQuestion.id) && (
            <div className="mb-4">
              <img
                src={
                  currentQuestion.id === 'q3-1'
                    ? '/quiz-lesson3-q1-illust.png'
                    : currentQuestion.id === 'q3-2'
                    ? '/quiz-lesson3-q2-illust.png'
                    : '/quiz-lesson3-q7-illust.png'
                }
                alt={`Lesson 3-${currentQuestion.id.replace('q3-', '')} 解説の挿絵`}
                className="w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {/* Lesson 4 の特定問題用の挿絵（解説の補助） */}
          {lesson.id === 'lesson-4' && currentQuestion.id === 'q4-2' && (
            <div className="mb-4">
              <img
                src="/quiz-lesson4-q2-illust.png"
                alt="Lesson 4-2 解説の挿絵（穿刺時の支え）"
                className="w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{currentQuestion.explanation}</p>
        </div>
      )}

        {/* ナビゲーション */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-400 font-bold cursor-not-allowed"
            title="MVPでは「戻る」は未対応です"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>戻る</span>
          </button>
          <button
            onClick={goNext}
            disabled={!isAnswered}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-colors ${
              isAnswered ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{step + 1 >= total ? '結果を見る' : '次へ'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
