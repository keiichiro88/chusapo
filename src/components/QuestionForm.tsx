import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Question } from '../types';

interface User {
  id: string;
  name: string;
  role: string;
}

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questionData: Omit<Question, 'id' | 'likes' | 'answers' | 'hasAcceptedAnswer' | 'createdAt' | 'timeAgo'>) => void;
  currentUser: User | null;
}

const DRAFT_STORAGE_KEY = 'medconsult_question_draft';

const QuestionForm: React.FC<QuestionFormProps> = ({ isOpen, onClose, onSubmit, currentUser }) => {
  // ローカルストレージから下書きを復元
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        return {
          ...draft,
          author: currentUser?.name || '匿名ユーザー',
          authorRole: currentUser?.role || ''
        };
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return {
      title: '',
      content: '',
      category: '',
      author: currentUser?.name || '匿名ユーザー',
      authorRole: currentUser?.role || ''
    };
  };

  const [formData, setFormData] = useState(loadDraft);
  const [showDraftNotification, setShowDraftNotification] = useState(false);

  const categories = [
    '注射',
    '採血',
    'ルート確保',
    '動脈穿刺',
    'その他'
  ];

  // 自動保存機能
  const saveDraft = (data: typeof formData) => {
    try {
      const draftData = {
        title: data.title,
        content: data.content,
        category: data.category
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // 下書きをクリア
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // フォームに入力内容があるかチェック
  const hasContent = () => {
    return formData.title.trim() || formData.content.trim() || formData.category;
  };

  // モーダルが開いた時に下書きがあるかチェック＆背景スクロール制御
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        setShowDraftNotification(true);
        setTimeout(() => setShowDraftNotification(false), 5000);
      }
      
      // 背景のスクロールを無効化
      document.body.style.overflow = 'hidden';
      
      // iOSでの背景スクロール対策
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Escキーでモーダルを閉じる
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (hasContent()) {
            const confirmClose = window.confirm('入力中の内容は下書きとして保存されます。フォームを閉じますか？');
            if (confirmClose) {
              onClose();
            }
          } else {
            onClose();
          }
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY.toString()) * -1);
        }
      };
    } else {
      // モーダルが閉じた時に元に戻す
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isOpen, onClose]);

  // フォームデータが変更された時に自動保存
  useEffect(() => {
    if (hasContent()) {
      const timeoutId = setTimeout(() => {
        saveDraft(formData);
      }, 1000); // 1秒後に保存

      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  // ページを離れる時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOpen && hasContent()) {
        e.preventDefault();
        e.returnValue = '入力中の内容が失われます。このページを離れますか？';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen, formData]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // カテゴリーをタグとして設定
    const finalTags = [];
    if (formData.category) finalTags.push(formData.category);
    
    const questionData = {
      title: formData.title,
      content: formData.content,
      category: formData.category, // Supabase用にcategoryを追加
      author: formData.author || '匿名ユーザー',
      authorRole: formData.authorRole || '医療従事者',
      tags: finalTags
    };
    
    onSubmit(questionData);
    
    // 下書きをクリア
    clearDraft();
    
    // フォームをリセット
    setFormData({
      title: '',
      content: '',
      category: '',
      author: currentUser?.name || '匿名ユーザー',
      authorRole: currentUser?.role || ''
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-900">質問を投稿</h2>
          <button
            onClick={() => {
              if (hasContent()) {
                const confirmClose = window.confirm('入力中の内容は下書きとして保存されます。フォームを閉じますか？');
                if (confirmClose) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-3 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 下書き復元通知 */}
        {showDraftNotification && (
          <div className="mx-8 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                前回の入力内容を復元しました
              </p>
              <p className="text-xs text-blue-600 mt-1">
                入力内容は自動的に下書きとして保存されます
              </p>
            </div>
            <button
              onClick={() => setShowDraftNotification(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              質問タイトル *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              placeholder="質問を簡潔に記述してください..."
              required
            />
          </div>

          {/* ログイン中は自動入力（表示のみ）、未ログイン時は編集可能 */}
          {currentUser ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-gray-600">{currentUser.role || '医療従事者'}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  ログイン中
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  あなたのお名前
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                  placeholder="匿名ユーザー"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  職種・役職
                </label>
                <input
                  type="text"
                  value={formData.authorRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorRole: e.target.value }))}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                  placeholder="例: 看護師、医師、技師など"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              カテゴリー *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              required
            >
              <option value="">カテゴリーを選択</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              詳細説明 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium resize-none"
              placeholder="患者の状況、試行した手法、具体的な懸念事項など、詳細な情報を記載してください..."
              required
            />
          </div>


          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="text-sm text-amber-800">
                <p className="font-bold mb-2">プロフェッショナルガイドライン</p>
                <p className="leading-relaxed">
                  患者のプライバシーを保護し、HIPAA ガイドラインに従ってください。患者を特定できる情報は一切含めないでください。
                </p>
              </div>
            </div>
          </div>

          {/* 下書きクリアボタン */}
          {hasContent() && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  const confirmClear = window.confirm('下書きをクリアしますか？入力内容は失われます。');
                  if (confirmClear) {
                    clearDraft();
                    setFormData({
                      title: '',
                      content: '',
                      category: '',
                      author: currentUser?.name || '匿名ユーザー',
                      authorRole: currentUser?.role || ''
                    });
                  }
                }}
                className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                下書きをクリア
              </button>
            </div>
          )}

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => {
                if (hasContent()) {
                  const confirmClose = window.confirm('入力中の内容は下書きとして保存されます。フォームを閉じますか？');
                  if (confirmClose) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              質問を投稿
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;