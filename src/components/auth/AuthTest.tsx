/**
 * Supabase認証テストコンポーネント
 *
 * このコンポーネントはSupabase認証が正しく動作するかテストするためのものです。
 * 本番環境では使用しません。
 */

import React, { useState } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AuthTest: React.FC = () => {
  const { user, isLoading, isAuthenticated, error, signUp, signIn, signOut } = useSupabaseAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (mode === 'signup') {
      const result = await signUp(email, password, name);
      if (result.success) {
        setMessage({
          type: 'success',
          text: '登録成功！メールを確認してください（確認メールが届く場合があります）'
        });
      } else {
        setMessage({ type: 'error', text: result.error || '登録に失敗しました' });
      }
    } else {
      const result = await signIn(email, password);
      if (result.success) {
        setMessage({ type: 'success', text: 'ログイン成功！' });
      } else {
        setMessage({ type: 'error', text: result.error || 'ログインに失敗しました' });
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setMessage({ type: 'success', text: 'ログアウトしました' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          🧪 Supabase認証テスト
        </h1>

        {/* 認証状態表示 */}
        <div className="mb-6 p-4 bg-gray-100 rounded-xl">
          <h2 className="font-bold mb-2">認証状態:</h2>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">ログイン中</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">未ログイン</span>
              </>
            )}
          </div>
          {user && (
            <div className="mt-2 text-sm text-gray-600">
              <p>ID: {user.id.slice(0, 8)}...</p>
              <p>Email: {user.email}</p>
              <p>名前: {user.name}</p>
            </div>
          )}
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`mb-4 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {isAuthenticated ? (
          /* ログアウトボタン */
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              'ログアウト'
            )}
          </button>
        ) : (
          /* ログイン/サインアップフォーム */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* モード切り替え */}
            <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 font-bold transition-colors ${
                  mode === 'signup'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                新規登録
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 font-bold transition-colors ${
                  mode === 'login'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                ログイン
              </button>
            </div>

            {/* 名前（サインアップのみ） */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  名前
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="山田太郎"
                  required
                />
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="test@example.com"
                required
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                パスワード（6文字以上）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                mode === 'signup' ? '登録する' : 'ログイン'
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-center text-gray-400">
          このページは開発テスト用です
        </p>
      </div>
    </div>
  );
};

export default AuthTest;
