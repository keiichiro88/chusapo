import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { devLog } from '../lib/logger';

// アプリで使うユーザー型
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  specialty?: string;
  tier: 'basic' | 'verified' | 'expert';
  isEmailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

type AuthResult<T = any> = { success: boolean; data?: T; error?: string };

export interface SupabaseAuthContextValue {
  // 状態
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // 認証アクション
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;

  // ユーティリティ
  getUserTierInfo: (tier: AppUser['tier']) => { label: string; badge: string | null; color: string };
  isMyContent: (authorId: string) => boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfileWithUser = async (user: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, tier, speciality, created_at')
        .eq('id', user.id)
        .single();

      if (error) {
        // profilesが取れない場合でも、認証自体は成立しているのでフォールバックで表示名だけは作る
        const defaultProfile: AppUser = {
          id: user.id,
          email: user.email || '',
          name: (user.user_metadata as any)?.name || user.email?.split('@')[0] || 'ユーザー',
          role: '医療従事者',
          tier: 'basic',
          isEmailVerified: !!user.email_confirmed_at,
          createdAt: new Date(user.created_at || Date.now()),
          lastLoginAt: new Date()
        };
        setAppUser(defaultProfile);
        return;
      }

      const profile: AppUser = {
        id: data.id,
        email: user.email || '',
        name: data.name || 'ユーザー',
        role: data.role || '医療従事者',
        specialty: data.speciality,
        tier: data.tier || 'basic',
        isEmailVerified: !!user.email_confirmed_at,
        createdAt: new Date(data.created_at || Date.now()),
        lastLoginAt: new Date()
      };
      setAppUser(profile);
    } catch (err) {
      console.error('プロフィール読み込みエラー:', err);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        await loadUserProfileWithUser(user);
        return;
      }

      // 取得できない場合はprofilesのみで最低限作る
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, tier, speciality, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const profile: AppUser = {
        id: data.id,
        email: '',
        name: data.name || 'ユーザー',
        role: data.role || '医療従事者',
        specialty: data.speciality,
        tier: data.tier || 'basic',
        isEmailVerified: false,
        createdAt: new Date(data.created_at || Date.now()),
        lastLoginAt: new Date()
      };
      setAppUser(profile);
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setAppUser(null);
        }
      } catch (err) {
        console.error('セッション取得エラー:', err);
        setError('セッションの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      devLog('認証状態変更:', event);
      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        // UI固まりを避けるため、ここではawaitせず背景で更新
        loadUserProfile(session.user.id).catch(console.error);
      } else {
        setAppUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      setError(err.message || 'サインアップに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // ここで状態を即座に反映（UIの固まり回避）
      if (data.session) setSession(data.session);
      if (data.user) {
        setSupabaseUser(data.user);
        loadUserProfileWithUser(data.user).catch(console.error);
      }

      return { success: true, data };
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAppUser(null);
      setSession(null);
      setSupabaseUser(null);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'ログアウトに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'パスワードリセットに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTierInfo = (tier: AppUser['tier']) => {
    switch (tier) {
      case 'basic':
        return { label: '一般ユーザー', badge: null, color: 'text-gray-600' };
      case 'verified':
        return { label: '認証済み医療従事者', badge: '認証済み', color: 'text-blue-600' };
      case 'expert':
        return { label: '検証済み専門家', badge: '専門家', color: 'text-yellow-600' };
    }
  };

  const isMyContent = (authorId: string) => appUser?.id === authorId;

  const value = useMemo<SupabaseAuthContextValue>(() => ({
    user: appUser,
    supabaseUser,
    session,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getUserTierInfo,
    isMyContent
  }), [appUser, supabaseUser, session, isLoading, error]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
};

export const useSupabaseAuth = (): SupabaseAuthContextValue => {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  return ctx;
};


