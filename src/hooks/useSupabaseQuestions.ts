/**
 * Supabase質問フック
 *
 * このフックはSupabaseを使った質問のCRUD操作を提供します。
 * - 質問一覧の取得（サーバーサイドページング対応）
 * - 質問の投稿
 * - 質問の更新・削除
 * - いいね機能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ページングの設定
const PAGE_SIZE = 20; // 1ページあたりの件数

// 質問の型定義
export interface SupabaseQuestion {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  answers_count: number;
  has_accepted_answer: boolean;
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

// 表示用に変換した質問の型
export interface DisplayQuestion {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  authorId: string;
  timeAgo: string;
  likes: number;
  answers: number;
  tags: string[];
  hasAcceptedAnswer: boolean;
  createdAt: Date;
}

// フィルター条件の型
export interface QuestionFilters {
  category?: string;
  searchQuery?: string;
  hasAcceptedAnswer?: boolean;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'unanswered';
}

export const useSupabaseQuestions = () => {
  const [questions, setQuestions] = useState<DisplayQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  // いいね済みの質問IDを管理
  const [likedQuestionIds, setLikedQuestionIds] = useState<Set<string>>(new Set());
  // 現在のページ（0始まり）
  const currentPage = useRef(0);
  // 現在のフィルター
  const currentFilters = useRef<QuestionFilters>({});

  /**
   * 経過時間を「○分前」「○時間前」形式に変換
   */
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  /**
   * Supabaseの質問データを表示用に変換
   */
  const convertToDisplayQuestion = useCallback((q: SupabaseQuestion): DisplayQuestion => {
    const extractHashtags = (content: string): string[] => {
      if (!content) return [];
      return content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith('#') || line.startsWith('＃'))
        .map((line) => line.replace(/^[#＃]+/, '').trim())
        .filter(Boolean)
        .slice(0, 20); // 念のため上限
    };

    const tags = Array.from(new Set([q.category, ...extractHashtags(q.content)])).filter(Boolean);

    return {
      id: q.id,
      title: q.title,
      content: q.content,
      author: q.profiles?.name || '匿名ユーザー',
      authorRole: q.profiles?.role || '医療従事者',
      authorId: q.author_id,
      timeAgo: getTimeAgo(q.created_at),
      likes: q.likes_count,
      answers: q.answers_count,
      tags, // 本文のハッシュタグも表示用タグに反映
      hasAcceptedAnswer: q.has_accepted_answer,
      createdAt: new Date(q.created_at)
    };
  }, []);

  /**
   * クエリビルダーにフィルターを適用
   */
  const applyFilters = (query: any, filters: QuestionFilters) => {
    let q = query;

    // カテゴリーフィルター
    if (filters.category && filters.category !== 'all') {
      q = q.eq('category', filters.category);
    }

    // 解決済みフィルター
    if (filters.hasAcceptedAnswer !== undefined) {
      q = q.eq('has_accepted_answer', filters.hasAcceptedAnswer);
    }

    // 検索クエリ（タイトルと内容）
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = `%${filters.searchQuery.trim()}%`;
      q = q.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
    }

    // ソート
    switch (filters.sortBy) {
      case 'oldest':
        q = q.order('created_at', { ascending: true });
        break;
      case 'popular':
        q = q.order('likes_count', { ascending: false });
        break;
      case 'unanswered':
        q = q.eq('answers_count', 0).order('created_at', { ascending: false });
        break;
      case 'newest':
      default:
        q = q.order('created_at', { ascending: false });
        break;
    }

    return q;
  };

  /**
   * 総件数を取得
   */
  const fetchTotalCount = useCallback(async (filters: QuestionFilters = {}) => {
    try {
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      query = applyFilters(query, filters);
      const { count, error } = await query;

      if (error) throw error;
      setTotalCount(count);
      return count;
    } catch (err) {
      console.error('総件数取得エラー:', err);
      return null;
    }
  }, []);

  /**
   * 質問一覧を取得（ページング対応）
   */
  const fetchQuestions = useCallback(async (
    page: number = 0,
    filters: QuestionFilters = {},
    append: boolean = false
  ) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      currentPage.current = 0;
    }
    setError(null);

    try {
      // ページング範囲を計算
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('questions')
        .select(`
          *,
          profiles (
            id,
            name,
            role,
            tier
          )
        `);

      // フィルター適用
      query = applyFilters(query, filters);
      
      // ページング適用
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      const displayQuestions = (data || []).map(convertToDisplayQuestion);
      
      if (append) {
        setQuestions(prev => [...prev, ...displayQuestions]);
      } else {
        setQuestions(displayQuestions);
        // 総件数も取得
        fetchTotalCount(filters);
      }

      // まだデータがあるかチェック
      setHasMore(displayQuestions.length === PAGE_SIZE);
      currentPage.current = page;
      currentFilters.current = filters;

    } catch (err: any) {
      console.error('質問取得エラー:', err);
      setError(err.message || '質問の取得に失敗しました');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [convertToDisplayQuestion, fetchTotalCount]);

  /**
   * 次のページを読み込む
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    await fetchQuestions(currentPage.current + 1, currentFilters.current, true);
  }, [fetchQuestions, isLoadingMore, hasMore]);

  /**
   * フィルターを適用して再取得
   */
  const applyNewFilters = useCallback(async (filters: QuestionFilters) => {
    await fetchQuestions(0, filters, false);
  }, [fetchQuestions]);

  /**
   * 現在のユーザーがいいねした質問を取得
   */
  const fetchUserLikes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('question_likes')
        .select('question_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const likedIds = new Set((data || []).map(like => like.question_id));
      setLikedQuestionIds(likedIds);

    } catch (err) {
      console.error('いいね情報取得エラー:', err);
    }
  }, []);

  /**
   * 初期データを読み込む
   */
  useEffect(() => {
    fetchQuestions(0, {});
    fetchUserLikes();
  }, [fetchQuestions, fetchUserLikes]);

  /**
   * 質問を投稿
   */
  const addQuestion = async (questionData: {
    title: string;
    content: string;
    category: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ログインが必要です' };
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          author_id: user.id,
          title: questionData.title,
          content: questionData.content,
          category: questionData.category
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

      // 新しい質問を一覧の先頭に追加
      const newQuestion = convertToDisplayQuestion(data);
      setQuestions(prev => [newQuestion, ...prev]);
      
      // 総件数を更新
      if (totalCount !== null) {
        setTotalCount(totalCount + 1);
      }

      return { success: true, data: newQuestion };

    } catch (err: any) {
      console.error('質問投稿エラー:', err);
      return { success: false, error: err.message || '質問の投稿に失敗しました' };
    }
  };

  /**
   * 質問にいいねする/取り消す（トグル）
   */
  const toggleLike = async (questionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ログインが必要です' };
    }

    const isLiked = likedQuestionIds.has(questionId);

    try {
      if (isLiked) {
        // いいねを取り消す
        const { error } = await supabase
          .from('question_likes')
          .delete()
          .eq('question_id', questionId)
          .eq('user_id', user.id);

        if (error) throw error;

        // ローカル状態を更新
        setLikedQuestionIds(prev => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
        setQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...q, likes: q.likes - 1 } : q
        ));

      } else {
        // いいねする
        const { error } = await supabase
          .from('question_likes')
          .insert({
            question_id: questionId,
            user_id: user.id
          });

        if (error) throw error;

        // ローカル状態を更新
        setLikedQuestionIds(prev => new Set(prev).add(questionId));
        setQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...q, likes: q.likes + 1 } : q
        ));
      }

      return { success: true };

    } catch (err: any) {
      console.error('いいねエラー:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * 質問がいいね済みかどうか確認
   */
  const isQuestionLiked = (questionId: string): boolean => {
    return likedQuestionIds.has(questionId);
  };

  /**
   * 質問を削除
   */
  const deleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      // ローカル状態から削除
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      
      // 総件数を更新
      if (totalCount !== null) {
        setTotalCount(totalCount - 1);
      }

      return { success: true };

    } catch (err: any) {
      console.error('質問削除エラー:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    questions,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    addQuestion,
    toggleLike,
    isQuestionLiked,
    deleteQuestion,
    loadMore,
    applyFilters: applyNewFilters,
    refreshQuestions: () => fetchQuestions(0, currentFilters.current),
    pageSize: PAGE_SIZE
  };
};
