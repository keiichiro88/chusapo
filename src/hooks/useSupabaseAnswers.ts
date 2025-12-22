/**
 * Supabase回答フック
 *
 * このフックはSupabaseを使った回答のCRUD操作を提供します。
 * - 回答一覧の取得（ページング対応）
 * - 回答の投稿
 * - 感謝機能
 * - ベストアンサー選択
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ページングの設定
const ANSWER_PAGE_SIZE = 10; // 1ページあたりの回答数

// 回答の型定義
export interface SupabaseAnswer {
  id: string;
  question_id: string;
  author_id: string;
  content: string;
  gratitude_count: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  // JOINで取得するプロフィール情報
  profiles?: {
    id: string;
    name: string;
    role: string;
    tier: string;
  };
}

// 表示用に変換した回答の型
export interface DisplayAnswer {
  id: string;
  questionId: string;
  content: string;
  author: string;
  authorRole: string;
  authorId: string;
  gratitude: number;
  isAccepted: boolean;
  createdAt: Date;
}

// 質問ごとの回答キャッシュ
interface AnswerCache {
  answers: DisplayAnswer[];
  hasMore: boolean;
  totalCount: number | null;
  currentPage: number;
}

export const useSupabaseAnswers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 感謝済みの回答IDを管理
  const [gratitudeAnswerIds, setGratitudeAnswerIds] = useState<Set<string>>(new Set());
  // 質問ごとの回答キャッシュ
  const answerCache = useRef<Map<string, AnswerCache>>(new Map());

  /**
   * Supabaseの回答データを表示用に変換
   */
  const convertToDisplayAnswer = useCallback((a: SupabaseAnswer): DisplayAnswer => {
    return {
      id: a.id,
      questionId: a.question_id,
      content: a.content,
      author: a.profiles?.name || '匿名ユーザー',
      authorRole: a.profiles?.role || '医療従事者',
      authorId: a.author_id,
      gratitude: a.gratitude_count,
      isAccepted: a.is_accepted,
      createdAt: new Date(a.created_at)
    };
  }, []);

  /**
   * 特定の質問の回答を取得（ページング対応）
   */
  const fetchAnswersForQuestion = useCallback(async (
    questionId: string,
    page: number = 0,
    append: boolean = false
  ): Promise<{ answers: DisplayAnswer[]; hasMore: boolean; totalCount: number | null }> => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // ページング範囲を計算
      const from = page * ANSWER_PAGE_SIZE;
      const to = from + ANSWER_PAGE_SIZE - 1;

      // まず総件数を取得（初回のみ）
      let totalCount: number | null = null;
      if (!append) {
        const { count } = await supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', questionId);
        totalCount = count;
      } else {
        // キャッシュから総件数を取得
        const cached = answerCache.current.get(questionId);
        totalCount = cached?.totalCount ?? null;
      }

      // 回答を取得（ベストアンサー優先、感謝数順）
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          profiles (
            id,
            name,
            role,
            tier
          )
        `)
        .eq('question_id', questionId)
        .order('is_accepted', { ascending: false })
        .order('gratitude_count', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const displayAnswers = (data || []).map(convertToDisplayAnswer);
      const hasMore = displayAnswers.length === ANSWER_PAGE_SIZE;

      // キャッシュを更新
      const existingCache = answerCache.current.get(questionId);
      const newAnswers = append && existingCache
        ? [...existingCache.answers, ...displayAnswers]
        : displayAnswers;

      answerCache.current.set(questionId, {
        answers: newAnswers,
        hasMore,
        totalCount: totalCount ?? existingCache?.totalCount ?? null,
        currentPage: page
      });

      return {
        answers: newAnswers,
        hasMore,
        totalCount: totalCount ?? existingCache?.totalCount ?? null
      };

    } catch (err: any) {
      console.error('回答取得エラー:', err);
      setError(err.message || '回答の取得に失敗しました');
      return { answers: [], hasMore: false, totalCount: null };
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [convertToDisplayAnswer]);

  /**
   * 質問の回答をさらに読み込む
   */
  const loadMoreAnswers = useCallback(async (questionId: string): Promise<{ answers: DisplayAnswer[]; hasMore: boolean }> => {
    const cached = answerCache.current.get(questionId);
    if (!cached || !cached.hasMore || isLoadingMore) {
      return { answers: cached?.answers || [], hasMore: cached?.hasMore || false };
    }

    return await fetchAnswersForQuestion(questionId, cached.currentPage + 1, true);
  }, [fetchAnswersForQuestion, isLoadingMore]);

  /**
   * キャッシュから回答を取得（データがなければfetch）
   */
  const getAnswersForQuestion = useCallback(async (questionId: string): Promise<DisplayAnswer[]> => {
    const cached = answerCache.current.get(questionId);
    if (cached) {
      return cached.answers;
    }
    const result = await fetchAnswersForQuestion(questionId);
    return result.answers;
  }, [fetchAnswersForQuestion]);

  /**
   * 質問の回答キャッシュ情報を取得
   */
  const getAnswerCacheInfo = useCallback((questionId: string) => {
    return answerCache.current.get(questionId) || null;
  }, []);

  /**
   * キャッシュをクリア
   */
  const clearCache = useCallback((questionId?: string) => {
    if (questionId) {
      answerCache.current.delete(questionId);
    } else {
      answerCache.current.clear();
    }
  }, []);

  /**
   * 現在のユーザーが感謝した回答を取得
   */
  const fetchUserGratitudes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('answer_gratitudes')
        .select('answer_id')
        .eq('from_user_id', user.id);

      if (error) throw error;

      const gratitudeIds = new Set((data || []).map(g => g.answer_id));
      setGratitudeAnswerIds(gratitudeIds);

    } catch (err) {
      console.error('感謝情報取得エラー:', err);
    }
  }, []);

  /**
   * 初期データを読み込む
   */
  useEffect(() => {
    fetchUserGratitudes();
  }, [fetchUserGratitudes]);

  /**
   * 回答を投稿
   */
  const addAnswer = async (answerData: {
    questionId: string;
    content: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ログインが必要です' };
    }

    try {
      const { data, error } = await supabase
        .from('answers')
        .insert({
          question_id: answerData.questionId,
          author_id: user.id,
          content: answerData.content
        })
        .select(`
          *,
          profiles (
            id,
            name,
            role,
            tier
          )
        `)
        .single();

      if (error) throw error;

      const newAnswer = convertToDisplayAnswer(data);
      
      // キャッシュを更新（先頭に追加）
      const cached = answerCache.current.get(answerData.questionId);
      if (cached) {
        answerCache.current.set(answerData.questionId, {
          ...cached,
          answers: [newAnswer, ...cached.answers],
          totalCount: (cached.totalCount ?? 0) + 1
        });
      }

      return { success: true, data: newAnswer };

    } catch (err: any) {
      console.error('回答投稿エラー:', err);
      return { success: false, error: err.message || '回答の投稿に失敗しました' };
    }
  };

  /**
   * 回答に感謝する/取り消す（トグル）
   */
  const toggleGratitude = async (answerId: string, answerAuthorId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ログインが必要です' };
    }

    // 自分の回答には感謝できない
    if (user.id === answerAuthorId) {
      return { success: false, error: '自分の回答には感謝できません' };
    }

    const hasGratitude = gratitudeAnswerIds.has(answerId);

    try {
      if (hasGratitude) {
        // 感謝を取り消す
        const { error } = await supabase
          .from('answer_gratitudes')
          .delete()
          .eq('answer_id', answerId)
          .eq('from_user_id', user.id);

        if (error) throw error;

        // ローカル状態を更新
        setGratitudeAnswerIds(prev => {
          const next = new Set(prev);
          next.delete(answerId);
          return next;
        });

        // キャッシュ内の感謝数を更新
        updateAnswerGratitudeInCache(answerId, -1);

      } else {
        // 感謝する
        const { error } = await supabase
          .from('answer_gratitudes')
          .insert({
            answer_id: answerId,
            from_user_id: user.id,
            to_user_id: answerAuthorId
          });

        if (error) throw error;

        // ローカル状態を更新
        setGratitudeAnswerIds(prev => new Set(prev).add(answerId));

        // キャッシュ内の感謝数を更新
        updateAnswerGratitudeInCache(answerId, 1);
      }

      return { success: true, isGratitude: !hasGratitude };

    } catch (err: any) {
      console.error('感謝エラー:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * キャッシュ内の回答の感謝数を更新
   */
  const updateAnswerGratitudeInCache = (answerId: string, delta: number) => {
    answerCache.current.forEach((cache, questionId) => {
      const updatedAnswers = cache.answers.map(a =>
        a.id === answerId ? { ...a, gratitude: a.gratitude + delta } : a
      );
      answerCache.current.set(questionId, { ...cache, answers: updatedAnswers });
    });
  };

  /**
   * 回答が感謝済みかどうか確認
   */
  const isAnswerGratitude = (answerId: string): boolean => {
    return gratitudeAnswerIds.has(answerId);
  };

  /**
   * ベストアンサーを選択
   */
  const selectBestAnswer = async (questionId: string, answerId: string) => {
    try {
      // セキュリティのため、RLSを広げずにRPC（SECURITY DEFINER）で確定処理を実行
      const { error } = await supabase.rpc('select_best_answer', {
        p_question_id: questionId,
        p_answer_id: answerId
      });

      if (error) throw error;

      // キャッシュを更新
      const cached = answerCache.current.get(questionId);
      if (cached) {
        const updatedAnswers = cached.answers.map(a => ({
          ...a,
          isAccepted: a.id === answerId
        }));
        answerCache.current.set(questionId, { ...cached, answers: updatedAnswers });
      }

      return { success: true };

    } catch (err: any) {
      console.error('ベストアンサー選択エラー:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * 回答を削除
   */
  const deleteAnswer = async (answerId: string, questionId: string) => {
    try {
      const { error } = await supabase
        .from('answers')
        .delete()
        .eq('id', answerId);

      if (error) throw error;

      // キャッシュから削除
      const cached = answerCache.current.get(questionId);
      if (cached) {
        answerCache.current.set(questionId, {
          ...cached,
          answers: cached.answers.filter(a => a.id !== answerId),
          totalCount: (cached.totalCount ?? 1) - 1
        });
      }

      return { success: true };

    } catch (err: any) {
      console.error('回答削除エラー:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    isLoading,
    isLoadingMore,
    error,
    fetchAnswersForQuestion,
    loadMoreAnswers,
    getAnswersForQuestion,
    getAnswerCacheInfo,
    clearCache,
    addAnswer,
    toggleGratitude,
    isAnswerGratitude,
    selectBestAnswer,
    deleteAnswer,
    refreshGratitudes: fetchUserGratitudes,
    pageSize: ANSWER_PAGE_SIZE
  };
};
