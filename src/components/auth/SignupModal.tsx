import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import Modal from './Modal';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
  onLoginClick: () => void;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  acceptedTerms: boolean;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSignup, onLoginClick }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptedTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }

    if (!formData.acceptedTerms) {
      setError('利用規約と免責事項に同意してください');
      return;
    }

    setIsLoading(true);

    try {
      const result = await onSignup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        acceptedTerms: formData.acceptedTerms
      });
      
      setIsLoading(false);

      // onClose() 後に setState すると、アンマウントと競合して例外が出ることがあるため順序固定
      const shouldClose = !!result?.success;
      const nextError = !shouldClose ? (result?.error || '') : '';

      if (nextError) {
        setError(nextError);
        return;
      }

      if (shouldClose) {
        // フォームリセット
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          acceptedTerms: false
        });
        onClose();
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || '登録に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-sm w-full mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-black text-gray-900">新規登録</h2>
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
              お名前（ニックネーム可）
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                placeholder="山田太郎"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              パスワード（8文字以上）
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              パスワード（確認）
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-bold mb-1">プライバシー保護について</p>
                <p className="leading-relaxed">
                  お客様の個人情報は厳重に管理され、医療情報のプライバシーは最優先で保護されます。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                className="mt-0.5 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="text-sm text-gray-700">
                <span>
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold underline"
                  >
                    利用規約と免責事項
                  </button>
                  に同意します
                </span>
              </div>
            </label>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !formData.acceptedTerms}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '登録中...' : '新規登録'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                すでにアカウントをお持ちの方は
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-blue-600 hover:text-blue-700 font-bold ml-1 underline"
                >
                  ログイン
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* 利用規約モーダル */}
      {showTerms && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 1000001 }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6">利用規約と免責事項</h3>
              
              <div className="space-y-6 text-gray-700">
                <section>
                  <h4 className="font-bold text-lg mb-3">1. サービスの性質</h4>
                  <p className="leading-relaxed">
                    本サービス「チューサポ」は、医療従事者間の情報共有プラットフォームです。
                    本サービスで提供される情報は、医療行為や医療アドバイスではありません。
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-lg mb-3">2. 免責事項</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>本サービスの情報は参考情報であり、実際の医療判断は必ず資格を持つ医療従事者が行ってください</li>
                    <li>本サービスの利用により生じたいかなる損害についても、運営者は責任を負いません</li>
                    <li>緊急の医療相談は、本サービスではなく適切な医療機関にご相談ください</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-lg mb-3">3. 個人情報保護</h4>
                  <p className="leading-relaxed">
                    患者の個人情報を含む投稿は禁止されています。
                    投稿内容には患者を特定できる情報を含めないでください。
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-lg mb-3">4. 利用者の責任</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>投稿内容の正確性について、投稿者が責任を負います</li>
                    <li>他の利用者への敬意を持った行動を心がけてください</li>
                    <li>著作権や知的財産権を侵害する内容の投稿は禁止です</li>
                  </ul>
                </section>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowTerms(false)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SignupModal;