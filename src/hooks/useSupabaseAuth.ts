/**
 * Supabase認証フック
 *
 * このフックはSupabaseを使った認証機能を提供します。
 * - メール/パスワードでのサインアップ
 * - ログイン/ログアウト
 * - セッション管理
 * - ユーザー情報の取得
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

const AUTH_REQUEST_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      reject(new Error(message));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

// アプリで使うユーザー型
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tier: 'basic' | 'verified' | 'expert';
  isEmailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

function toAppUser(user: SupabaseUser): AppUser {
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー';

  return {
    id: user.id,
    email: user.email || '',
    name: userName,
    role: '医療従事者',
    tier: 'basic',
    isEmailVerified: !!user.email_confirmed_at,
    createdAt: new Date(user.created_at || Date.now()),
    lastLoginAt: new Date()
  };
}

export const useSupabaseAuth = () => {
  // Supabaseのユーザー情報
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  // セッション情報
  const [session, setSession] = useState<Session | null>(null);
  // アプリ用のユーザー情報（プロフィール含む）
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  // 読み込み中フラグ
  const [isLoading, setIsLoading] = useState(true);
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  /**
   * 初期化時にセッションを確認し、認証状態の変更を監視
   */
  useEffect(() => {
    // 現在のセッションを取得（タイムアウト付き）
    const getInitialSession = async () => {
      try {
        const result = (await withTimeout(
          supabase.auth.getSession(),
          3000,
          '接続タイムアウト'
        )) as { data: { session: any }; error: any };
        
        if (result.error) throw result.error;

        setSession(result.data.session);
        setSupabaseUser(result.data.session?.user ?? null);

        if (result.data.session?.user) {
          setAppUser(toAppUser(result.data.session.user));
        }
      } catch (err) {
        console.error('セッション取得エラー:', err);
        // エラー時はローカルストレージモードで続行（エラーメッセージは表示しない）
        setSession(null);
        setSupabaseUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('認証状態変更:', event);
        setSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          setAppUser(toAppUser(session.user));
        } else {
          setAppUser(null);
        }
      }
    );

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * メール/パスワードでサインアップ
   *
   * @param email - メールアドレス
   * @param password - パスワード（6文字以上）
   * @param name - 表示名
   */
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name // メタデータに名前を保存
          }
        }
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        'サインアップに時間がかかっています。ネットワークをご確認の上、もう一度お試しください。'
      );

      if (error) throw error;

      // サインアップ成功
      console.log('サインアップ成功:', data);
      return { success: true, data };

    } catch (err: any) {
      console.error('サインアップエラー:', err);
      setError(err.message || 'サインアップに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * メール/パスワードでログイン
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        'ログインに時間がかかっています。ネットワークをご確認の上、もう一度お試しください。'
      );

      if (error) throw error;

      console.log('ログイン成功:', data);
      return { success: true, data };

    } catch (err: any) {
      console.error('ログインエラー:', err);
      setError(err.message || 'ログインに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ログアウト
   */
  const signOut = async () => {
    setIsLoading(true);

    try {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        AUTH_REQUEST_TIMEOUT_MS,
        'ログアウトに時間がかかっています。ネットワークをご確認ください。'
      );
      if (error) throw error;

      setAppUser(null);
      console.log('ログアウト成功');
      return { success: true };

    } catch (err: any) {
      console.error('ログアウトエラー:', err);
      setError(err.message || 'ログアウトに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * パスワードリセットメールを送信
   */
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        'パスワードリセットに時間がかかっています。ネットワークをご確認ください。'
      );

      if (error) throw error;

      return { success: true };

    } catch (err: any) {
      console.error('パスワードリセットエラー:', err);
      setError(err.message || 'パスワードリセットに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ユーザーティア情報を取得
   */
  const getUserTierInfo = (tier: AppUser['tier']) => {
    switch (tier) {
      case 'basic':
        return {
          label: '一般ユーザー',
          badge: null,
          color: 'text-gray-600'
        };
      case 'verified':
        return {
          label: '認証済み医療従事者',
          badge: '認証済み',
          color: 'text-blue-600'
        };
      case 'expert':
        return {
          label: '検証済み専門家',
          badge: '専門家',
          color: 'text-yellow-600'
        };
    }
  };

  /**
   * 自分のコンテンツかどうか判定
   */
  const isMyContent = (authorId: string) => {
    return appUser?.id === authorId;
  };

  return {
    // 状態
    user: appUser,
    supabaseUser,
    session,
    isLoading,
    error,
    isAuthenticated: !!session,

    // 認証アクション
    signUp,
    signIn,
    signOut,
    resetPassword,

    // ユーティリティ
    getUserTierInfo,
    isMyContent
  };
};
