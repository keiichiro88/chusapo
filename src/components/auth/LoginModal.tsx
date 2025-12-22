import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignupClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onSignupClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await onLogin(email, password);

      // NOTE: onClose() 後に setState すると、アンマウントと競合して
      // ReactのDOM削除（removeChild）で例外が出ることがあるため、状態更新順を固定する。
      const shouldClose = !!result?.success;
      const nextError = !shouldClose ? (result?.error || '') : '';

      setIsLoading(false);

      if (nextError) {
        setError(nextError);
        return;
      }

      if (shouldClose) {
        setEmail('');
        setPassword('');
        onClose();
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'メールアドレスまたはパスワードが正しくありません');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-xs w-full mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">ログイン</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない方は
                <button
                  type="button"
                  onClick={onSignupClick}
                  className="text-blue-600 hover:text-blue-700 font-bold ml-1 underline"
                >
                  新規登録
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default LoginModal;