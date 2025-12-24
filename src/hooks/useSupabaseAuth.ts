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
        // 3秒でタイムアウト
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('接続タイムアウト')), 3000);
        });

        const sessionPromise = supabase.auth.getSession();

        const result = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: any }, error: any };
        
        if (result.error) throw result.error;

        setSession(result.data.session);
        setSupabaseUser(result.data.session?.user ?? null);

        if (result.data.session?.user) {
          await loadUserProfile(result.data.session.user.id);
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
      async (event, session) => {
        console.log('認証状態変更:', event);
        setSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
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
   * ユーザープロフィールをデータベースから読み込む
   * ※ まだprofilesテーブルを作成していない場合はダミーデータを返す
   */
  const loadUserProfile = async (userId: string) => {
    try {
      // TODO: profilesテーブルからデータを取得
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', userId)
      //   .single();

      // 現時点ではダミーデータを設定
      const dummyProfile: AppUser = {
        id: userId,
        email: supabaseUser?.email || '',
        name: supabaseUser?.email?.split('@')[0] || 'ユーザー',
        role: '医療従事者',
        tier: 'basic',
        isEmailVerified: supabaseUser?.email_confirmed_at ? true : false,
        createdAt: new Date(supabaseUser?.created_at || Date.now()),
        lastLoginAt: new Date()
      };

      setAppUser(dummyProfile);
    } catch (err) {
      console.error('プロフィール読み込みエラー:', err);
    }
  };

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name // メタデータに名前を保存
          }
        }
      });

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

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
      const { error } = await supabase.auth.signOut();
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

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
