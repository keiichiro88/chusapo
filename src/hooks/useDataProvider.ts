/**
 * データプロバイダーフック
 *
 * このフックは認証状態に応じてデータソースを自動的に切り替えます。
 * - 未ログイン時：LocalStorageのデモデータを使用
 * - ログイン時：Supabaseのリアルデータを使用（サーバーサイドページング対応）
 *
 * これにより、既存のデモ機能を維持しながら、
 * 認証済みユーザーには本番データを提供できます。
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useSupabaseQuestions, DisplayQuestion, QuestionFilters } from './useSupabaseQuestions';
import { useSupabaseAnswers, DisplayAnswer } from './useSupabaseAnswers';
import { useQuestions as useLocalQuestions } from './useQuestions';
import { useAnswers as useLocalAnswers } from './useAnswers';
import { Question, Answer } from '../types';

/**
 * useDataProviderの戻り値の型
 */
interface DataProviderReturn {
  // 認証状態
  isAuthenticated: boolean;
  isLoading: boolean;

  // 質問関連
  questions: Question[];
  totalQuestionCount: number | null;
  hasMoreQuestions: boolean;
  isLoadingMoreQuestions: boolean;
  addQuestion: (questionData: {
    title: string;
    content: string;
    category: string;
    author: string;
    authorRole: string;
    tags: string[];
  }, authorId?: string) => Promise<{ success: boolean; error?: string }>;
  likeQuestion: (questionId: string) => Promise<{ success: boolean; error?: string }>;
  isQuestionLiked: (questionId: string) => boolean;
  deleteQuestion: (questionId: string) => Promise<{ success: boolean; error?: string }>;
  refreshQuestions: () => Promise<void>;
  loadMoreQuestions: () => Promise<void>;
  applyQuestionFilters: (filters: QuestionFilters) => Promise<void>;

  // 回答関連
  answers: Answer[];
  addAnswer: (answerData: {
    questionId: string;
    content: string;
    author: string;
    authorRole: string;
  }, authorId?: string) => Promise<{ success: boolean; error?: string }>;
  getAnswersForQuestion: (questionId: string) => Answer[];
  fetchAnswersForQuestion: (questionId: string) => Promise<{ answers: Answer[]; hasMore: boolean; totalCount: number | null }>;
  loadMoreAnswers: (questionId: string) => Promise<{ answers: Answer[]; hasMore: boolean }>;
  getAnswerCacheInfo: (questionId: string) => { hasMore: boolean; totalCount: number | null } | null;
  toggleGratitude: (answerId: string, answerAuthorId: string) => Promise<{ success: boolean; error?: string }>;
  isAnswerGratitude: (answerId: string) => boolean;
  selectBestAnswer: (questionId: string, answerId: string) => Promise<{ success: boolean; error?: string }>;
  updateAnswerGratitude: (answerId: string, newGratitudeCount: number) => void;

  // データソース情報（デバッグ用）
  dataSource: 'supabase' | 'localStorage';
}

/**
 * DisplayQuestionをQuestionに変換
 */
const convertDisplayToQuestion = (dq: DisplayQuestion): Question => ({
  id: dq.id,
  title: dq.title,
  content: dq.content,
  author: dq.author,
  authorRole: dq.authorRole,
  authorId: dq.authorId,
  timeAgo: dq.timeAgo,
  likes: dq.likes,
  answers: dq.answers,
  tags: dq.tags,
  hasAcceptedAnswer: dq.hasAcceptedAnswer,
  createdAt: dq.createdAt
});

/**
 * DisplayAnswerをAnswerに変換
 */
const convertDisplayToAnswer = (da: DisplayAnswer): Answer => ({
  id: da.id,
  questionId: da.questionId,
  content: da.content,
  author: da.author,
  authorRole: da.authorRole,
  authorId: da.authorId,
  gratitude: da.gratitude,
  isAccepted: da.isAccepted,
  createdAt: da.createdAt
});

export const useDataProvider = (): DataProviderReturn => {
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();

  // Supabaseフック
  const supabaseQuestions = useSupabaseQuestions();
  const supabaseAnswers = useSupabaseAnswers();

  // LocalStorageフック
  const localQuestions = useLocalQuestions();
  const localAnswers = useLocalAnswers();

  // 回答データのキャッシュ（Supabase用）
  const [supabaseAnswersCache, setSupabaseAnswersCache] = useState<Map<string, DisplayAnswer[]>>(new Map());

  // データソースを決定
  const dataSource = isAuthenticated ? 'supabase' : 'localStorage';

  // ローディング状態
  const isLoading = authLoading || (isAuthenticated && supabaseQuestions.isLoading);

  /**
   * 質問データの取得
   */
  const questions: Question[] = useMemo(() => {
    if (isAuthenticated) {
      return supabaseQuestions.questions.map(convertDisplayToQuestion);
    }
    return localQuestions.questions;
  }, [isAuthenticated, supabaseQuestions.questions, localQuestions.questions]);

  /**
   * 回答データの取得（全キャッシュを統合）
   */
  const answers: Answer[] = useMemo(() => {
    if (isAuthenticated) {
      const allAnswers: DisplayAnswer[] = [];
      supabaseAnswersCache.forEach(questionAnswers => {
        allAnswers.push(...questionAnswers);
      });
      return allAnswers.map(convertDisplayToAnswer);
    }
    return localAnswers.answers;
  }, [isAuthenticated, supabaseAnswersCache, localAnswers.answers]);

  /**
   * 質問を追加
   */
  const addQuestion = useCallback(async (
    questionData: {
      title: string;
      content: string;
      category: string;
      author: string;
      authorRole: string;
      tags: string[];
    },
    authorId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isAuthenticated) {
      const result = await supabaseQuestions.addQuestion({
        title: questionData.title,
        content: questionData.content,
        category: questionData.category
      });
      return { success: result.success, error: result.error };
    } else {
      localQuestions.addQuestion(questionData, authorId);
      return { success: true };
    }
  }, [isAuthenticated, supabaseQuestions, localQuestions]);

  /**
   * 質問にいいね
   */
  const likeQuestion = useCallback(async (questionId: string): Promise<{ success: boolean; error?: string }> => {
    if (isAuthenticated) {
      const result = await supabaseQuestions.toggleLike(questionId);
      return { success: result.success, error: result.error };
    } else {
      localQuestions.likeQuestion(questionId);
      return { success: true };
    }
  }, [isAuthenticated, supabaseQuestions, localQuestions]);

  /**
   * いいね済みチェック
   */
  const isQuestionLiked = useCallback((questionId: string): boolean => {
    if (isAuthenticated) {
      return supabaseQuestions.isQuestionLiked(questionId);
    }
    return localQuestions.isQuestionLiked(questionId);
  }, [isAuthenticated, supabaseQuestions, localQuestions]);

  /**
   * 質問を削除
   */
  const deleteQuestion = useCallback(async (questionId: string): Promise<{ success: boolean; error?: string }> => {
    if (isAuthenticated) {
      const result = await supabaseQuestions.deleteQuestion(questionId);
      return { success: result.success, error: result.error };
    } else {
      localQuestions.deleteQuestion(questionId);
      return { success: true };
    }
  }, [isAuthenticated, supabaseQuestions, localQuestions]);

  /**
   * 質問一覧を更新
   */
  const refreshQuestions = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      await supabaseQuestions.refreshQuestions();
    }
    // LocalStorageの場合はリロード不要（状態で管理されている）
  }, [isAuthenticated, supabaseQuestions]);

  /**
   * 質問をさらに読み込む
   */
  const loadMoreQuestions = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      await supabaseQuestions.loadMore();
    }
    // LocalStorageの場合はクライアントサイドで表示件数を増やす（App.tsx側で管理）
  }, [isAuthenticated, supabaseQuestions]);

  /**
   * 質問フィルターを適用
   */
  const applyQuestionFilters = useCallback(async (filters: QuestionFilters): Promise<void> => {
    if (isAuthenticated) {
      await supabaseQuestions.applyFilters(filters);
    }
    // LocalStorageの場合はクライアントサイドでフィルタリング（App.tsx側で管理）
  }, [isAuthenticated, supabaseQuestions]);

  /**
   * 回答を追加
   */
  const addAnswer = useCallback(async (
    answerData: {
      questionId: string;
      content: string;
      author: string;
      authorRole: string;
    },
    authorId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isAuthenticated) {
      const result = await supabaseAnswers.addAnswer({
        questionId: answerData.questionId,
        content: answerData.content
      });

      // 成功したら回答キャッシュを更新
      if (result.success && result.data) {
        setSupabaseAnswersCache(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(answerData.questionId) || [];
          newMap.set(answerData.questionId, [result.data!, ...existing]);
          return newMap;
        });
      }

      return { success: result.success, error: result.error };
    } else {
      localAnswers.addAnswer(answerData, authorId);
      return { success: true };
    }
  }, [isAuthenticated, supabaseAnswers, localAnswers]);

  /**
   * 特定の質問の回答を取得（キャッシュから）
   */
  const getAnswersForQuestion = useCallback((questionId: string): Answer[] => {
    if (isAuthenticated) {
      const cached = supabaseAnswersCache.get(questionId) || [];
      return cached.map(convertDisplayToAnswer).sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return b.gratitude - a.gratitude;
      });
    }
    return localAnswers.getAnswersForQuestion(questionId);
  }, [isAuthenticated, supabaseAnswersCache, localAnswers]);

  /**
   * 特定の質問の回答をSupabaseから取得してキャッシュを更新
   */
  const fetchAnswersForQuestion = useCallback(async (questionId: string): Promise<{ answers: Answer[]; hasMore: boolean; totalCount: number | null }> => {
    if (!isAuthenticated) {
      return { 
        answers: localAnswers.getAnswersForQuestion(questionId), 
        hasMore: false, 
        totalCount: null 
      };
    }

    const result = await supabaseAnswers.fetchAnswersForQuestion(questionId);
    
    // キャッシュを更新
    setSupabaseAnswersCache(prev => {
      const newMap = new Map(prev);
      newMap.set(questionId, result.answers);
      return newMap;
    });

    return {
      answers: result.answers.map(convertDisplayToAnswer),
      hasMore: result.hasMore,
      totalCount: result.totalCount
    };
  }, [isAuthenticated, supabaseAnswers, localAnswers]);

  /**
   * 回答をさらに読み込む
   */
  const loadMoreAnswers = useCallback(async (questionId: string): Promise<{ answers: Answer[]; hasMore: boolean }> => {
    if (!isAuthenticated) {
      return { answers: localAnswers.getAnswersForQuestion(questionId), hasMore: false };
    }

    const result = await supabaseAnswers.loadMoreAnswers(questionId);
    
    // キャッシュを更新
    setSupabaseAnswersCache(prev => {
      const newMap = new Map(prev);
      newMap.set(questionId, result.answers);
      return newMap;
    });

    return {
      answers: result.answers.map(convertDisplayToAnswer),
      hasMore: result.hasMore
    };
  }, [isAuthenticated, supabaseAnswers, localAnswers]);

  /**
   * 回答キャッシュ情報を取得
   */
  const getAnswerCacheInfo = useCallback((questionId: string): { hasMore: boolean; totalCount: number | null } | null => {
    if (!isAuthenticated) return null;
    const info = supabaseAnswers.getAnswerCacheInfo(questionId);
    if (!info) return null;
    return { hasMore: info.hasMore, totalCount: info.totalCount };
  }, [isAuthenticated, supabaseAnswers]);

  /**
   * 感謝をトグル
   */
  const toggleGratitude = useCallback(async (
    answerId: string,
    answerAuthorId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isAuthenticated) {
      const result = await supabaseAnswers.toggleGratitude(answerId, answerAuthorId);

      // 成功したらキャッシュを更新
      if (result.success) {
        setSupabaseAnswersCache(prev => {
          const newMap = new Map(prev);
          newMap.forEach((answers, qId) => {
            const updated = answers.map(a => {
              if (a.id === answerId) {
                return {
                  ...a,
                  gratitude: result.isGratitude ? a.gratitude + 1 : a.gratitude - 1
                };
              }
              return a;
            });
            newMap.set(qId, updated);
          });
          return newMap;
        });
      }

      return { success: result.success, error: result.error };
    } else {
      // LocalStorageの場合は感謝機能がないので何もしない
      return { success: true };
    }
  }, [isAuthenticated, supabaseAnswers]);

  /**
   * 感謝済みチェック
   */
  const isAnswerGratitude = useCallback((answerId: string): boolean => {
    if (isAuthenticated) {
      return supabaseAnswers.isAnswerGratitude(answerId);
    }
    // LocalStorageの場合は常にfalse
    return false;
  }, [isAuthenticated, supabaseAnswers]);

  /**
   * ベストアンサーを選択
   */
  const selectBestAnswer = useCallback(async (
    questionId: string,
    answerId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isAuthenticated) {
      const result = await supabaseAnswers.selectBestAnswer(questionId, answerId);

      // 成功したらキャッシュを更新
      if (result.success) {
        setSupabaseAnswersCache(prev => {
          const newMap = new Map(prev);
          const answers = newMap.get(questionId);
          if (answers) {
            const updated = answers.map(a => ({
              ...a,
              isAccepted: a.id === answerId
            }));
            newMap.set(questionId, updated);
          }
          return newMap;
        });
      }

      return { success: result.success, error: result.error };
    } else {
      localAnswers.acceptAnswer(answerId, questionId);
      return { success: true };
    }
  }, [isAuthenticated, supabaseAnswers, localAnswers]);

  /**
   * 回答の感謝数を更新（LocalStorage用）
   */
  const updateAnswerGratitude = useCallback((answerId: string, newGratitudeCount: number): void => {
    if (!isAuthenticated) {
      localAnswers.updateAnswerGratitude(answerId, newGratitudeCount);
    }
    // Supabaseの場合はトリガーで自動更新されるので何もしない
  }, [isAuthenticated, localAnswers]);

  return {
    // 認証状態
    isAuthenticated,
    isLoading,

    // 質問関連
    questions,
    totalQuestionCount: isAuthenticated ? supabaseQuestions.totalCount : localQuestions.questions.length,
    hasMoreQuestions: isAuthenticated ? supabaseQuestions.hasMore : false,
    isLoadingMoreQuestions: isAuthenticated ? supabaseQuestions.isLoadingMore : false,
    addQuestion,
    likeQuestion,
    isQuestionLiked,
    deleteQuestion,
    refreshQuestions,
    loadMoreQuestions,
    applyQuestionFilters,

    // 回答関連
    answers,
    addAnswer,
    getAnswersForQuestion,
    fetchAnswersForQuestion,
    loadMoreAnswers,
    getAnswerCacheInfo,
    toggleGratitude,
    isAnswerGratitude,
    selectBestAnswer,
    updateAnswerGratitude,

    // データソース情報
    dataSource
  };
};
