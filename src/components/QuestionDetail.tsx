import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  HandHeart,
  MessageCircle, 
  Clock, 
  User, 
  CheckCircle,
  Tag,
  ArrowUp,
  Award,
  Star,
  Send,
  AlertCircle,
  Stethoscope,
  Shield
} from 'lucide-react';
import { Question, Answer } from '../types';

interface User {
  id: string;
  name: string;
  role: string;
}

interface QuestionDetailProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  scrollToAnswers?: boolean;
  isQuestionLiked?: boolean;
  currentUser?: User | null;
  isMyQuestion?: boolean;
  onUserProfileClick?: (authorName: string) => void;
  onBestAnswerChange?: () => void;
  // useDataProvider からの Props
  answers: Answer[];
  onAddAnswer: (answerData: {
    questionId: string;
    content: string;
    author: string;
    authorRole: string;
  }, authorId?: string) => Promise<{ success: boolean; error?: string }>;
  onToggleGratitude: (answerId: string, answerAuthorId: string) => Promise<{ success: boolean; error?: string }>;
  isAnswerGratitude: (answerId: string) => boolean;
  onSelectBestAnswer: (questionId: string, answerId: string) => Promise<{ success: boolean; error?: string }>;
  // ページング関連
  hasMoreAnswers?: boolean;
  isLoadingMoreAnswers?: boolean;
  onLoadMoreAnswers?: () => Promise<void>;
  totalAnswerCount?: number | null;
}

interface AnswerFormData {
  content: string;
  author: string;
  authorRole: string;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ 
  question, 
  isOpen, 
  onClose, 
  onLike,
  scrollToAnswers = false,
  isQuestionLiked = false,
  onUserProfileClick,
  currentUser = null,
  isMyQuestion = false,
  onBestAnswerChange,
  answers,
  onAddAnswer,
  onToggleGratitude,
  isAnswerGratitude,
  onSelectBestAnswer,
  hasMoreAnswers = false,
  isLoadingMoreAnswers = false,
  onLoadMoreAnswers,
  totalAnswerCount
}) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerForm, setAnswerForm] = useState<AnswerFormData>({
    content: '',
    author: currentUser?.name || '',
    authorRole: currentUser?.role || ''
  });
  const answersRef = React.useRef<HTMLDivElement>(null);
  const [sparkleAnimations, setSparkleAnimations] = useState<{[key: string]: boolean}>({});
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [answerToRemove, setAnswerToRemove] = useState<string | null>(null);
  // 感謝済み状態のローカルキャッシュ（アニメーション用）
  const [gratitudeCache, setGratitudeCache] = useState<{[key: string]: boolean}>({});

  // Props からの回答データをこの質問用にフィルタリング & ソート
  const questionAnswers = answers
    .filter(a => a.questionId === question.id)
    .sort((a, b) => {
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      return b.gratitude - a.gratitude;
    });
  const hasAcceptedAnswer = questionAnswers.some(answer => answer.isAccepted);

  useEffect(() => {
    if (isOpen && scrollToAnswers && answersRef.current) {
      // モーダルが開いた後、少し遅延させてからスクロール
      setTimeout(() => {
        answersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isOpen, scrollToAnswers]);

  // モーダルのアクセシビリティ：Escキー、背景スクロール制御
  useEffect(() => {
    if (!isOpen) return;

    // Escキーでモーダルを閉じる
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // 背景スクロール無効化
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, onClose]);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerForm.content.trim()) return;

    const result = await onAddAnswer({
      questionId: question.id,
      content: answerForm.content,
      author: answerForm.author || '匿名ユーザー',
      authorRole: answerForm.authorRole || '医療従事者'
    }, currentUser?.id);

    if (result.success) {
      setAnswerForm({ 
        content: '', 
        author: currentUser?.name || '', 
        authorRole: currentUser?.role || '' 
      });
      setShowAnswerForm(false);
    } else {
      alert(result.error || '回答の投稿に失敗しました。');
    }
  };

  // ベストアンサー解除の確認ダイアログを表示
  const handleRemoveBestAnswer = (answerId: string) => {
    setAnswerToRemove(answerId);
    setShowRemoveConfirm(true);
  };

  // ベストアンサー解除の実行
  const confirmRemoveBestAnswer = async () => {
    if (answerToRemove) {
      // 空のIDを渡してすべて解除
      const result = await onSelectBestAnswer(question.id, '');
      if (result.success) {
        onBestAnswerChange?.();
      } else {
        alert(result.error || 'ベストアンサーの解除に失敗しました。');
      }
    }
    setShowRemoveConfirm(false);
    setAnswerToRemove(null);
  };

  // ベストアンサー解除のキャンセル
  const cancelRemoveBestAnswer = () => {
    setShowRemoveConfirm(false);
    setAnswerToRemove(null);
  };

  // 感謝ボタンのクリック処理（トグル対応）
  const handleGratitude = async (answerId: string, authorId: string) => {
    if (!currentUser) {
      alert('感謝を贈るにはログインが必要です。');
      return;
    }
    
    if (currentUser.id === authorId) {
      alert('自分の回答には感謝を贈れません。');
      return;
    }

    const isCurrentlyGiven = isAnswerGratitude(answerId);
    
    // 感謝を贈る場合のみアニメーションを実行
    if (!isCurrentlyGiven) {
      // キラキラアニメーションを開始
      setSparkleAnimations(prev => ({ ...prev, [answerId]: true }));
      
      // 1.2秒後にアニメーションを停止
      setTimeout(() => {
        setSparkleAnimations(prev => ({ ...prev, [answerId]: false }));
      }, 1200);
    }

    // ローカルキャッシュを即時更新（オプティミスティック更新）
    setGratitudeCache(prev => ({ ...prev, [answerId]: !isCurrentlyGiven }));

    const result = await onToggleGratitude(answerId, authorId);
    
    if (result.success) {
      console.log(isCurrentlyGiven ? '感謝を取り消しました。' : '感謝を贈りました！');
    } else {
      // 失敗した場合はキャッシュを戻す
      setGratitudeCache(prev => ({ ...prev, [answerId]: isCurrentlyGiven }));
      alert(result.error || '操作に失敗しました。');
    }
  };

  // 感謝済み状態を取得（ローカルキャッシュ or Props）
  const getGratitudeState = (answerId: string): boolean => {
    if (answerId in gratitudeCache) {
      return gratitudeCache[answerId];
    }
    return isAnswerGratitude(answerId);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  };

  // ユーザーアバターの生成
  const generateUserAvatar = (author: string, role: string) => {
    const initials = author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600', 
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-violet-500 to-purple-600'
    ];
    const colorIndex = author.charCodeAt(0) % colors.length;
    return { initials, gradient: colors[colorIndex] };
  };

  // 専門家バッジの取得
  const getExpertBadge = (role: string) => {
    if (role.includes('医師') || role.includes('医') || role.includes('Dr')) {
      return { icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-100', label: '医師' };
    }
    if (role.includes('看護師') || role.includes('ナース')) {
      return { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100', label: '看護師' };
    }
    if (role.includes('技師') || role.includes('技士')) {
      return { icon: Star, color: 'text-purple-600', bg: 'bg-purple-100', label: '技師' };
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white rounded-t-3xl flex-shrink-0 z-10">
          <h2 className="text-2xl font-black text-gray-900">質問詳細</h2>
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* スクロール可能なコンテンツエリア */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* 質問情報 */}
            <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4 relative z-0">
                {/* Instagram風アバター */}
                <div 
                  className="relative flex-shrink-0 cursor-pointer group"
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      onUserProfileClick?.(question.author);
                    }, 100);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClose();
                      setTimeout(() => {
                        onUserProfileClick?.(question.author);
                      }, 100);
                    }
                  }}
                  title={`${question.author}さんのプロフィールを表示`}
                >
                  {/* ストーリー風リング */}
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px] shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                    <div className={`h-full w-full bg-gradient-to-br ${generateUserAvatar(question.author, question.authorRole).gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                      {generateUserAvatar(question.author, question.authorRole).initials}
                    </div>
                  </div>
                  
                  {/* 専門家バッジ */}
                  {(() => {
                    const badge = getExpertBadge(question.authorRole);
                    if (!badge) return null;
                    const BadgeIcon = badge.icon;
                    return (
                      <div className={`absolute -bottom-1 -right-1 ${badge.bg} ${badge.color} rounded-full p-1.5 shadow-lg border-2 border-white z-10`}>
                        <BadgeIcon className="h-3 w-3" />
                      </div>
                    );
                  })()}
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap mb-1">
                    <h4 className="font-black text-gray-900 text-xl">{question.author}</h4>
                    {/* X風認証バッジ */}
                    {(() => {
                      const badge = getExpertBadge(question.authorRole);
                      if (!badge) return null;
                      const BadgeIcon = badge.icon;
                      return (
                        <div className={`flex items-center space-x-1 px-2 py-1 ${badge.bg} ${badge.color} rounded-full`}>
                          <BadgeIcon className="h-3 w-3" />
                          <span className="text-xs font-bold">{badge.label}</span>
                        </div>
                      );
                    })()}
                    {isMyQuestion && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex-shrink-0">
                        あなたの質問
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 font-semibold text-sm">{question.authorRole}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500 font-medium">認証済みプロフェッショナル</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-gray-500 text-sm font-medium whitespace-nowrap">
                <Clock className="h-4 w-4 mr-1.5" />
                {question.timeAgo}
              </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
              {question.title}
            </h1>

            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              {question.content}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              {question.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-all duration-200"
                >
                  <Tag className="h-3 w-3 mr-1.5" />
                  {tag}
                </span>
              ))}
            </div>

            {/* 統計情報とアクション */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => {
                    // いいねを追加する場合のみアニメーションを実行
                    if (!isQuestionLiked) {
                      // 触覚フィードバック（バイブレーション）
                      if (navigator.vibrate) {
                        navigator.vibrate(120); // 120ミリ秒の適度な振動
                      }
                      
                      // ハートアニメーションを開始
                      setIsHeartAnimating(true);
                      
                      // アニメーション終了後に停止（CSS側の duration と合わせる）
                      setTimeout(() => {
                        setIsHeartAnimating(false);
                      }, 800);
                    }
                    
                    // 元のonLike関数を実行
                    if (onLike) {
                      onLike();
                    }
                  }}
                  className={`flex items-center space-x-2 transition-colors duration-200 group ${
                    isQuestionLiked 
                      ? 'text-gray-700' 
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                  title={
                    isQuestionLiked
                      ? "クリックでいいねを取り消し"
                      : "この質問が参考になる場合にクリック"
                  }
                >
                  <div className={`p-2 rounded-xl transition-colors duration-200 overflow-visible ${
                    isQuestionLiked 
                      ? 'bg-red-100' 
                      : 'group-hover:bg-red-50'
                  }`}>
                    <Heart 
                      className={`h-5 w-5 transition-all duration-200 ${
                        isQuestionLiked 
                          ? 'text-red-500 fill-red-500 scale-110' 
                          : 'text-gray-600 group-hover:text-red-500'
                      } ${isHeartAnimating ? 'text-red-500 fill-red-500' : ''}`}
                      style={{
                        animation: isHeartAnimating ? 'heartPulse 0.8s ease-out' : 'none',
                        animationFillMode: 'forwards'
                      }}
                    />
                  </div>
                  <span className="font-bold">{question.likes}</span>
                  <span className="text-sm">いいね</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (answersRef.current) {
                      answersRef.current.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
                  title="回答セクションに移動"
                >
                  <MessageCircle className="h-5 w-5 group-hover:text-blue-600 transition-colors duration-200" />
                  <span className="font-bold">{questionAnswers.length}</span>
                  <span className="text-sm">回答</span>
                </button>
                
                {hasAcceptedAnswer && (
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold">解決済み</span>
                  </div>
                )}
              </div>
              
              {!isMyQuestion && (
                <button 
                  onClick={() => setShowAnswerForm(!showAnswerForm)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  質問に回答する
                </button>
              )}
              {isMyQuestion && (
                <div className="px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-2xl text-center">
                  あなたの質問です
                </div>
              )}
            </div>
          </div>

          {/* 回答フォーム */}
          {showAnswerForm && !isMyQuestion && (
            <div className="bg-gray-50 rounded-3xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">回答を投稿</h3>
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={answerForm.author}
                    onChange={(e) => setAnswerForm(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="あなたのお名前（任意）"
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                  />
                  <input
                    type="text"
                    value={answerForm.authorRole}
                    onChange={(e) => setAnswerForm(prev => ({ ...prev, authorRole: e.target.value }))}
                    placeholder="職種・役職（任意）"
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                  />
                </div>
                <textarea
                  value={answerForm.content}
                  onChange={(e) => setAnswerForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  placeholder="あなたの経験や知識に基づいた回答を記載してください..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium resize-none"
                  required
                />
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-bold mb-1">注意事項</p>
                      <p className="leading-relaxed">
                        医療アドバイスは教育目的のみです。実際の医療判断は必ず医療従事者に相談してください。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAnswerForm(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>回答を投稿</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 回答一覧 */}
          <div ref={answersRef}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              回答 ({questionAnswers.length}件)
            </h3>
            
            {questionAnswers.length > 0 ? (
              <div className="space-y-6">
                {questionAnswers.map((answer) => (
                  <div 
                    key={answer.id} 
                    className={`p-6 rounded-3xl border-2 transition-all duration-200 ${
                      answer.isAccepted 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4 relative z-0">
                        {/* Instagram風アバター */}
                        <div 
                          className="relative flex-shrink-0 cursor-pointer group"
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              onUserProfileClick?.(answer.author);
                            }, 100);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onClose();
                              setTimeout(() => {
                                onUserProfileClick?.(answer.author);
                              }, 100);
                            }
                          }}
                          title={`${answer.author}さんのプロフィールを表示`}
                        >
                          {/* ベストアンサーの金色リング */}
                          {answer.isAccepted && (
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600"></div>
                          )}
                          
                          {/* ストーリー風リング */}
                          <div className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px] shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                            <div className={`h-full w-full bg-gradient-to-br ${generateUserAvatar(answer.author, answer.authorRole).gradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                              {generateUserAvatar(answer.author, answer.authorRole).initials}
                            </div>
                          </div>
                          
                          {/* 専門家バッジ */}
                          {(() => {
                            const badge = getExpertBadge(answer.authorRole);
                            if (!badge) return null;
                            const BadgeIcon = badge.icon;
                            return (
                              <div className={`absolute -bottom-1 -right-1 ${badge.bg} ${badge.color} rounded-full p-1 shadow-lg border-2 border-white z-10`}>
                                <BadgeIcon className="h-2.5 w-2.5" />
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap mb-1">
                            <h4 className="font-black text-gray-900">{answer.author}</h4>
                            {/* X風認証バッジ */}
                            {(() => {
                              const badge = getExpertBadge(answer.authorRole);
                              if (!badge) return null;
                              const BadgeIcon = badge.icon;
                              return (
                                <div className={`flex items-center space-x-1 px-2 py-1 ${badge.bg} ${badge.color} rounded-full`}>
                                  <BadgeIcon className="h-3 w-3" />
                                  <span className="text-xs font-bold">{badge.label}</span>
                                </div>
                              );
                            })()}
                            {answer.isAccepted && (
                              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full whitespace-nowrap flex-shrink-0">
                                ベストアンサー
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-semibold text-sm">{answer.authorRole}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500 font-medium">認証済みプロフェッショナル</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-500 text-sm font-medium">
                        {formatTimeAgo(answer.createdAt)}
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4">
                      {answer.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* 感謝ボタン */}
                        <button 
                          onClick={() => handleGratitude(answer.id, answer.authorId || '')}
                          disabled={currentUser?.id === answer.authorId}
                          className={`flex items-center space-x-2 transition-colors duration-200 group ${
                            currentUser?.id === answer.authorId
                              ? 'text-gray-400 cursor-not-allowed'
                              : getGratitudeState(answer.id)
                                ? 'text-gray-700' 
                                : 'text-gray-600 hover:text-gray-700'
                          }`}
                          title={
                            currentUser?.id === answer.authorId
                              ? "自分の回答には感謝できません"
                              : getGratitudeState(answer.id)
                                ? "クリックで感謝を取り消し"
                                : "実際に試して役立った場合にクリック"
                          }
                        >
                          <div className={`p-2 rounded-xl transition-colors duration-200 ${
                            currentUser?.id === answer.authorId
                              ? 'bg-gray-100'
                              : getGratitudeState(answer.id)
                                ? 'bg-emerald-100' 
                                : 'group-hover:bg-emerald-50'
                          }`}>
                            {/* 感謝マーク - 合掌（両手を合わせる）アイコン */}
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="32" 
                              height="32" 
                              viewBox="0 0 113.4 150" 
                              className="h-8 w-8"
                              style={{ overflow: 'visible' }}
                            >
                              <defs>
                                {/* 感謝時の光る効果グラデーション */}
                                {getGratitudeState(answer.id) && currentUser?.id !== answer.authorId && (
                                  <radialGradient id={`gratitudeGlow-${answer.id}`} cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
                                    <stop offset="50%" stopColor="#ffed4e" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#ffd700" stopOpacity="0.1" />
                                  </radialGradient>
                                )}
                                
                                {/* キラキラエフェクト用グラデーション */}
                                <radialGradient id={`sparkleGlow-${answer.id}`} cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                                  <stop offset="30%" stopColor="#ffd700" stopOpacity="0.8" />
                                  <stop offset="60%" stopColor="#ff6b6b" stopOpacity="0.6" />
                                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                </radialGradient>
                              </defs>
                              
                              <g>
                                {/* キラキラエフェクト（タップ時） */}
                                {sparkleAnimations[answer.id] && (
                                  <>
                                    {/* 2つのかわいいハートが合掌した指先から舞い上がる */}
                                    {[
                                      { x: 42, y: 50, delay: 0, size: 5.5, type: 'large' },
                                      { x: 72, y: 52, delay: 0.15, size: 4.2, type: 'medium' }
                                    ].map((star, index) => (
                                      <g 
                                        key={index}
                                        style={{
                                          animation: `naturalSparkleFloat 1.2s ease-out ${star.delay}s forwards`,
                                          transformOrigin: `${star.x}px ${star.y}px`
                                        }}
                                      >
                                        {/* かわいいピンクハートのグラデーション */}
                                        <defs>
                                          <radialGradient id={`heartGlow-${answer.id}-${index}`} cx="40%" cy="30%" r="60%">
                                            <stop offset="0%" stopColor="#ffb6c1" stopOpacity="1" />
                                            <stop offset="30%" stopColor="#ff91a4" stopOpacity="1" />
                                            <stop offset="70%" stopColor="#ff69b4" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#ff1493" stopOpacity="1" />
                                          </radialGradient>
                                        </defs>
                                        
                                        {/* かわいいピンクハートの本体（標準的な形状） */}
                                        <path 
                                          d={`M${star.x} ${star.y + 8 * star.size} C${star.x - 12 * star.size} ${star.y - 5 * star.size} ${star.x - 8 * star.size} ${star.y - 12 * star.size} ${star.x} ${star.y - 5 * star.size} C${star.x + 8 * star.size} ${star.y - 12 * star.size} ${star.x + 12 * star.size} ${star.y - 5 * star.size} ${star.x} ${star.y + 8 * star.size} Z`}
                                          fill={`url(#heartGlow-${answer.id}-${index})`}
                                          stroke="#ffc0cb"
                                          strokeWidth="0.5"
                                          style={{
                                            filter: 'drop-shadow(0 2px 4px rgba(255, 105, 180, 0.3))'
                                          }}
                                        />
                                        
                                        {/* ハートの上にかわいいハイライト */}
                                        <ellipse
                                          cx={star.x - 3 * star.size}
                                          cy={star.y - 6 * star.size}
                                          rx={2.5 * star.size}
                                          ry={1.8 * star.size}
                                          fill="#ffe4e1"
                                          opacity="0.8"
                                        />
                                      </g>
                                    ))}
                                  </>
                                )}
                                
                                {/* 背景の光る効果（感謝済み時のみ） */}
                                {getGratitudeState(answer.id) && currentUser?.id !== answer.authorId && !sparkleAnimations[answer.id] && (
                                  <circle 
                                    cx="56.7" 
                                    cy="56.7" 
                                    r="50" 
                                    fill={`url(#gratitudeGlow-${answer.id})`}
                                    className="animate-pulse"
                                  />
                                )}
                                
                                {/* 合掌する両手のパス */}
                                <path 
                                  d="M38.6,102.1l18.1-21.2,18.1,21.2h27.2v-24.2l-15.5-10.4c-6.4-4.2-10.5-11.1-11.2-18.7l-2.8-29c-.5-5.1-5.1-8.8-10.1-8.3-2.1.2-4,1.1-5.5,2.6-3.7-3.6-9.5-3.5-13.1.2-1.5,1.5-2.4,3.5-2.6,5.5l-2.8,29c-.7,7.6-4.9,14.5-11.2,18.7l-15.9,10.4v24.2s27.3,0,27.3,0ZM60.6,18.1c.7-.7,1.6-1.1,2.6-1.1,1.9,0,3.4,1.4,3.6,3.3l2.8,29c.9,8.9,5.5,17.1,12.8,22.3l-15.1,13-7.7-9V20.6c-.1-.9.3-1.9,1-2.5h0ZM43.8,49.3l2.8-29c.1-2,1.9-3.5,3.9-3.4,1.9.1,3.4,1.8,3.4,3.7v54.9l-7.7,9-15.2-13c7.3-5.2,12-13.3,12.8-22.2Z"
                                  fill={
                                    currentUser?.id === answer.authorId 
                                      ? '#9ca3af'  // グレー（無効時）
                                      : getGratitudeState(answer.id)
                                        ? '#dc2626'  // 赤色（感謝済み）
                                        : '#d1d5db'  // 薄いグレー（通常）
                                  }
                                  stroke={
                                    currentUser?.id === answer.authorId 
                                      ? '#6b7280' 
                                      : getGratitudeState(answer.id)
                                        ? '#991b1b'  // 濃い赤（感謝済み）
                                        : '#9ca3af'  // グレー（通常）
                                  }
                                  strokeWidth="1"
                                />
                              </g>
                            </svg>
                          </div>
                          <span className="font-bold">
                            {answer.gratitude}
                          </span>
                          <span className="text-sm hidden sm:inline">感謝</span>
                        </button>
                      </div>

                      {isMyQuestion && (
                        <>
                          {!hasAcceptedAnswer && (
                            <button
                              onClick={async () => {
                                const result = await onSelectBestAnswer(question.id, answer.id);
                                if (result.success) {
                                  onBestAnswerChange?.();
                                } else {
                                  alert(result.error || 'ベストアンサーの選択に失敗しました。');
                                }
                              }}
                              className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-all duration-200 whitespace-nowrap"
                            >
                              ベストアンサーに選ぶ
                            </button>
                          )}
                          {answer.isAccepted && (
                            <button
                              onClick={() => handleRemoveBestAnswer(answer.id)}
                              className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all duration-200 whitespace-nowrap"
                            >
                              ベストアンサーを外す
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* さらに回答を読み込むボタン */}
                {hasMoreAnswers && onLoadMoreAnswers && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={onLoadMoreAnswers}
                      disabled={isLoadingMoreAnswers}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingMoreAnswers ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          読み込み中...
                        </span>
                      ) : (
                        <>さらに回答を読み込む{totalAnswerCount && totalAnswerCount > questionAnswers.length && ` (${totalAnswerCount - questionAnswers.length}件)`}</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <h4 className="text-xl font-bold text-gray-600 mb-2">
                  まだ回答がありません
                </h4>
                {!isMyQuestion ? (
                  <>
                    <p className="text-gray-500 mb-6">
                      この質問に最初の回答をしてみませんか？
                    </p>
                    <button 
                      onClick={() => setShowAnswerForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105"
                    >
                      回答する
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500 mb-6">
                    あなたの質問への回答をお待ちしています。
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      
      {/* ベストアンサー解除確認ダイアログ */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ベストアンサーを外しますか？
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  この操作を実行すると、選択したベストアンサーが解除されます。<br />
                  後で別の回答をベストアンサーに選び直すことができます。
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={cancelRemoveBestAnswer}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmRemoveBestAnswer}
                  className="flex-1 px-4 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all duration-200"
                >
                  外す
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;