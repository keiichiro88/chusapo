import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  MessageCircle, 
  Heart, 
  CheckCircle, 
  AlertCircle,
  Send,
  Calendar,
  Tag,
  Sparkles,
  TrendingUp,
  Stethoscope,
  Shield,
  Star
} from 'lucide-react';
import { Question, Answer } from '../types';
import SearchAndFilter, { FilterOptions } from './SearchAndFilter';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useProfileSettings } from '../hooks/useProfileSettings';
import { useUser } from '../hooks/useUser';

interface AnswerQuestionsProps {
  questions: Question[];
  answers: Answer[];
  onSubmitAnswer: (questionId: string, answerContent: string, authorName: string, authorRole: string) => void;
  onBack: () => void;
  onBestAnswerSelect?: (answerId: string, questionId: string) => void;
  onUserProfileClick?: (authorName: string) => void;
}

const AnswerQuestions: React.FC<AnswerQuestionsProps> = ({ 
  questions, 
  answers, 
  onSubmitAnswer, 
  onBack,
  onBestAnswerSelect,
  onUserProfileClick
}) => {
  const { user: supabaseAppUser, isAuthenticated: isSupabaseAuthenticated } = useSupabaseAuth();
  const authUserInfo = supabaseAppUser
    ? { id: supabaseAppUser.id, name: supabaseAppUser.name, role: supabaseAppUser.role }
    : null;
  const { settings: myProfileSettings } = useProfileSettings(authUserInfo);
  const { currentUser } = useUser();

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerForm, setAnswerForm] = useState({
    content: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    hasAcceptedAnswer: null,
    sortBy: 'newest'
  });
  const [todayFilter, setTodayFilter] = useState(false);
  const [activeStatCard, setActiveStatCard] = useState<'total' | 'resolved' | 'pending' | 'urgent' | 'today' | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [showAll, setShowAll] = useState(false);

  // 統計データを計算
  const totalQuestions = questions.length;
  const resolvedQuestions = questions.filter(q => q.hasAcceptedAnswer).length;
  const pendingQuestions = questions.filter(q => !q.hasAcceptedAnswer).length;
  const urgentQuestions = 0; // 優先度機能削除により固定値
  const todaysQuestions = questions.filter(q => {
    const today = new Date();
    const questionDate = new Date(q.createdAt);
    return questionDate.toDateString() === today.toDateString();
  }).length;

  // 統計カードクリック処理
  const handleStatCardClick = (type: 'total' | 'resolved' | 'pending' | 'urgent' | 'today') => {
    setActiveStatCard(activeStatCard === type ? null : type);
    
    // フィルターをリセット
    setFilters({
      category: '',
      hasAcceptedAnswer: null,
      sortBy: 'newest'
    });
    setTodayFilter(false);
    
    // 選択されたタイプに応じてフィルターを設定
    switch (type) {
      case 'resolved':
        setFilters(prev => ({ ...prev, hasAcceptedAnswer: true }));
        break;
      case 'pending':
        setFilters(prev => ({ ...prev, hasAcceptedAnswer: false }));
        break;
      case 'urgent':
        // 優先度機能削除により無効化
        break;
      case 'today':
        setTodayFilter(true);
        break;
      default:
        break;
    }
  };

  // フィルタリングされた質問を取得
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // 検索クエリでフィルタリング
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // カテゴリーでフィルタリング
    if (filters.category) {
      filtered = filtered.filter(q => 
        q.tags.includes(filters.category)
      );
    }


    // ステータスでフィルタリング
    if (filters.hasAcceptedAnswer !== null) {
      filtered = filtered.filter(q => q.hasAcceptedAnswer === filters.hasAcceptedAnswer);
    }

    // 今日の質問でフィルタリング
    if (todayFilter) {
      const today = new Date();
      filtered = filtered.filter(q => {
        const questionDate = new Date(q.createdAt);
        return questionDate.toDateString() === today.toDateString();
      });
    }

    // ソート
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'likes':
          return b.likes - a.likes;
        case 'answers':
          return b.answers - a.answers;
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [questions, searchQuery, filters, todayFilter]);

  // 表示する質問を取得（ページネーション対応）
  const displayedQuestions = useMemo(() => {
    if (showAll) {
      return filteredQuestions;
    }
    return filteredQuestions.slice(0, displayCount);
  }, [filteredQuestions, displayCount, showAll]);

  // ページネーション制御
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  const handleShowAll = () => {
    setShowAll(true);
  };

  const handleResetPagination = () => {
    setDisplayCount(10);
    setShowAll(false);
  };

  // フィルターが変更されたときはページネーションをリセット
  React.useEffect(() => {
    handleResetPagination();
  }, [searchQuery, filters, todayFilter, activeStatCard]);

  // 未解決の質問を取得（回答投稿時の進行用）
  const unsolvedQuestions = useMemo(() => {
    return questions.filter(question => !question.hasAcceptedAnswer);
  }, [questions]);

  // 選択された質問の回答を取得
  const questionAnswers = useMemo(() => {
    if (!selectedQuestion) return [];
    return answers
      .filter(answer => answer.questionId === selectedQuestion.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [selectedQuestion, answers]);

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !answerForm.content.trim()) return;

    const canAnswer = isSupabaseAuthenticated || !!currentUser;
    if (!canAnswer) {
      alert('回答を投稿するにはログインが必要です。');
      return;
    }

    const authorName = isSupabaseAuthenticated
      ? (myProfileSettings.name || supabaseAppUser?.name || 'ユーザー')
      : (currentUser?.name || '匿名回答者');
    const authorRole = isSupabaseAuthenticated
      ? (myProfileSettings.role || supabaseAppUser?.role || '医療従事者')
      : (currentUser?.role || '医療従事者');

    onSubmitAnswer(
      selectedQuestion.id,
      answerForm.content,
      authorName,
      authorRole
    );

    // フォームをリセット
    setAnswerForm({
      content: ''
    });

    // 次の質問に移動（または一覧に戻る）
    const currentIndex = unsolvedQuestions.findIndex(q => q.id === selectedQuestion.id);
    if (currentIndex < unsolvedQuestions.length - 1) {
      setSelectedQuestion(unsolvedQuestions[currentIndex + 1]);
    } else {
      setSelectedQuestion(null);
    }
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

  if (selectedQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setSelectedQuestion(null)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">質問一覧に戻る</span>
          </button>
          <div className="text-sm text-gray-500">
            {unsolvedQuestions.findIndex(q => q.id === selectedQuestion.id) + 1} / {unsolvedQuestions.length}
          </div>
        </div>

        {/* 質問詳細 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedQuestion.timeAgo}</span>
                </div>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-4">
                {selectedQuestion.title}
              </h1>
              {/* 質問者情報 */}
              <div className="flex items-center space-x-4 mb-6">
                {(() => {
                  const avatar = generateUserAvatar(selectedQuestion.author, selectedQuestion.authorRole);
                  const expertBadge = getExpertBadge(selectedQuestion.authorRole);
                  return (
                    <div className="flex items-center space-x-3">
                      {/* アバター */}
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 shadow-lg">
                          <div className={`h-full w-full bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                            {avatar.initials}
                          </div>
                        </div>
                        {expertBadge && (
                          <div className={`absolute -bottom-0.5 -right-0.5 ${expertBadge.bg} ${expertBadge.color} rounded-full p-1 shadow-lg border border-white`}>
                            <expertBadge.icon className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-gray-900 text-lg">{selectedQuestion.author}</span>
                          {expertBadge && (
                            <div className={`flex items-center space-x-1 px-2 py-0.5 ${expertBadge.bg} ${expertBadge.color} rounded-full`}>
                              <expertBadge.icon className="h-3 w-3" />
                              <span className="text-xs font-bold">{expertBadge.label}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600 font-semibold">{selectedQuestion.authorRole}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 text-xs">認証済みプロフェッショナル</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedQuestion.content}
            </p>
          </div>

          {/* タグ */}
          {selectedQuestion.tags.length > 0 && (
            <div className="flex items-center space-x-2 mb-6">
              <Tag className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {selectedQuestion.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 統計 */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{selectedQuestion.likes} いいね</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{questionAnswers.length} 回答</span>
            </div>
          </div>
        </div>

        {/* 既存の回答 */}
        {questionAnswers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-black text-gray-900 mb-6">既存の回答 ({questionAnswers.length}件)</h3>
            <div className="space-y-6">
              {questionAnswers.map(answer => (
                <div key={answer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    {(() => {
                      const avatar = generateUserAvatar(answer.author, answer.authorRole);
                      const expertBadge = getExpertBadge(answer.authorRole);
                      return (
                        <button
                          type="button"
                          className="flex items-center space-x-3 text-left hover:opacity-80 transition-opacity"
                          onClick={() => onUserProfileClick?.(answer.author)}
                          title={`${answer.author}さんのプロフィールを表示`}
                        >
                          {/* アバター */}
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 shadow-md">
                              <div className={`h-full w-full bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner`}>
                                {avatar.initials}
                              </div>
                            </div>
                            {expertBadge && (
                              <div className={`absolute -bottom-0.5 -right-0.5 ${expertBadge.bg} ${expertBadge.color} rounded-full p-0.5 shadow-md border border-white`}>
                                <expertBadge.icon className="h-2 w-2" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">{answer.author}</span>
                              {expertBadge && (
                                <div className={`flex items-center space-x-1 px-1.5 py-0.5 ${expertBadge.bg} ${expertBadge.color} rounded-full`}>
                                  <expertBadge.icon className="h-2.5 w-2.5" />
                                  <span className="text-xs font-bold">{expertBadge.label}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-600 font-medium">{answer.authorRole}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500 text-xs">認証済み</span>
                            </div>
                          </div>
                        </button>
                      );
                    })()}
                    {answer.isAccepted && (
                      <div className="flex items-center space-x-1 text-emerald-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-bold">採用済み</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                    {answer.content}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{answer.gratitude} 感謝</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(answer.createdAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 回答投稿フォーム */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-black text-gray-900">回答を投稿</h3>
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-6">
            {/* 回答者（自動） */}
            {(() => {
              const canAnswer = isSupabaseAuthenticated || !!currentUser;
              const authorName = isSupabaseAuthenticated
                ? (myProfileSettings.name || supabaseAppUser?.name || 'ユーザー')
                : (currentUser?.name || '匿名回答者');
              const authorRole = isSupabaseAuthenticated
                ? (myProfileSettings.role || supabaseAppUser?.role || '医療従事者')
                : (currentUser?.role || '医療従事者');

              const avatar = generateUserAvatar(authorName, authorRole);
              const badge = getExpertBadge(authorRole);

              return (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className={`flex items-center space-x-3 text-left ${
                        canAnswer ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                      }`}
                      onClick={() => {
                        if (!canAnswer) return;
                        onUserProfileClick?.(authorName);
                      }}
                      title={canAnswer ? 'あなたのプロフィールを表示' : 'ログインするとプロフィールが表示できます'}
                      disabled={!canAnswer}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 shadow-md">
                          <div
                            className={`h-full w-full bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner`}
                          >
                            {avatar.initials}
                          </div>
                        </div>
                        {badge && (
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 ${badge.bg} ${badge.color} rounded-full p-0.5 shadow-md border border-white`}
                          >
                            <badge.icon className="h-2 w-2" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{authorName}</div>
                        <div className="text-sm text-gray-600 font-medium">{authorRole}</div>
                      </div>
                    </button>
                    <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                      プロフィールから自動
                    </div>
                  </div>
                  {!canAnswer && (
                    <p className="text-xs text-red-600 font-medium mt-2">
                      回答を投稿するにはログインが必要です
                    </p>
                  )}
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                回答内容 *
              </label>
              <textarea
                value={answerForm.content}
                onChange={(e) => setAnswerForm(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="具体的で実用的な回答を記載してください。経験談や参考資料があれば併せて記載いただけると有用です..."
                required
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-1">プロフェッショナルガイドライン</p>
                  <p>医療情報は正確性が重要です。不確実な情報については明確に記載し、必要に応じて専門医への相談を勧めてください。</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!(isSupabaseAuthenticated || !!currentUser) || !answerForm.content.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>回答を投稿</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">ホームに戻る</span>
          </button>
          <h1 className="text-3xl font-black text-gray-900">質問に答える</h1>
          <p className="text-gray-600 mt-2">未解決の質問に専門知識で回答してください</p>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        <div 
          onClick={() => handleStatCardClick('total')}
          className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md p-3 ${
            activeStatCard === 'total' ? 'border-blue-300 bg-blue-50' : 'border-gray-100'
          }`}
          title="総質問数"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-1.5 bg-blue-100 rounded-lg mb-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{totalQuestions}</p>
            <p className="text-xs font-medium text-gray-600 leading-tight">総質問</p>
          </div>
        </div>
        <div 
          onClick={() => handleStatCardClick('resolved')}
          className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md p-3 ${
            activeStatCard === 'resolved' ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100'
          }`}
          title="解決済みの質問"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-1.5 bg-emerald-100 rounded-lg mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{resolvedQuestions}</p>
            <p className="text-xs font-medium text-gray-600 leading-tight">解決済</p>
          </div>
        </div>
        <div 
          onClick={() => handleStatCardClick('pending')}
          className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md p-3 ${
            activeStatCard === 'pending' ? 'border-amber-300 bg-amber-50' : 'border-gray-100'
          }`}
          title="未解決の質問"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-1.5 bg-amber-100 rounded-lg mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{pendingQuestions}</p>
            <p className="text-xs font-medium text-gray-600 leading-tight">未解決</p>
          </div>
        </div>
        <div 
          onClick={() => handleStatCardClick('urgent')}
          className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md p-3 ${
            activeStatCard === 'urgent' ? 'border-red-300 bg-red-50' : 'border-gray-100'
          }`}
          title="緊急案件の質問"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-1.5 bg-red-100 rounded-lg mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{urgentQuestions}</p>
            <p className="text-xs font-medium text-gray-600 leading-tight">緊急案件</p>
          </div>
        </div>
        <div 
          onClick={() => handleStatCardClick('today')}
          className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md p-3 ${
            activeStatCard === 'today' ? 'border-purple-300 bg-purple-50' : 'border-gray-100'
          }`}
          title="今日投稿された質問"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-1.5 bg-purple-100 rounded-lg mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{todaysQuestions}</p>
            <p className="text-xs font-medium text-gray-600 leading-tight">今日</p>
          </div>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            該当する質問がありません
          </h2>
          <p className="text-gray-600 text-lg">
            {activeStatCard ? '選択した条件に一致する質問がありません。' : '現在、質問がありません。新しい質問が投稿されるまでお待ちください。'}
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">
              {activeStatCard === 'resolved' ? '解決済みの質問' : 
               activeStatCard === 'pending' ? '未解決の質問' :
               activeStatCard === 'urgent' ? '緊急案件' :
               activeStatCard === 'today' ? '今日の質問' :
               '質問一覧'} ({filteredQuestions.length}件)
            </h2>
            <p className="text-sm text-gray-500">新しい順に表示されています</p>
          </div>

          <div className="space-y-6">
            {displayedQuestions.map((question, index) => (
              <div
                key={question.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedQuestion(question)}
              >
                {/* 質問者情報を上部に移動 */}
                <div className="flex items-center justify-between mb-4">
                  {(() => {
                    const avatar = generateUserAvatar(question.author, question.authorRole);
                    const expertBadge = getExpertBadge(question.authorRole);
                    return (
                      <div className="flex items-center space-x-3">
                        {/* アバター */}
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 shadow-md">
                            <div className={`h-full w-full bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner`}>
                              {avatar.initials}
                            </div>
                          </div>
                          {expertBadge && (
                            <div className={`absolute -bottom-0.5 -right-0.5 ${expertBadge.bg} ${expertBadge.color} rounded-full p-0.5 shadow-md border border-white`}>
                              <expertBadge.icon className="h-2 w-2" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">{question.author}</span>
                            {expertBadge && (
                              <div className={`flex items-center space-x-1 px-1.5 py-0.5 ${expertBadge.bg} ${expertBadge.color} rounded-full`}>
                                <expertBadge.icon className="h-2.5 w-2.5" />
                                <span className="text-xs font-bold">{expertBadge.label}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-gray-600 font-medium text-sm">{question.authorRole}</span>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{question.timeAgo}</span>
                    </div>
                    {question.hasAcceptedAnswer && (
                      <div className="flex items-center space-x-1 text-emerald-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-bold">解決済み</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors">
                    {question.hasAcceptedAnswer ? '詳細を見る' : '回答する'}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  {question.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {question.content}
                </p>

                {/* 統計情報 */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{question.answers} 回答</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{question.likes} いいね</span>
                  </div>
                </div>

                {question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {question.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        +{question.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ページネーション */}
          {!showAll && displayedQuestions.length < filteredQuestions.length && (
            <div className="flex items-center justify-center space-x-4 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all duration-200 flex items-center space-x-2"
              >
                <span>さらに10件読み込む</span>
                <span className="text-sm text-blue-500">({displayedQuestions.length}/{filteredQuestions.length})</span>
              </button>
              <button
                onClick={handleShowAll}
                className="px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                すべて表示 ({filteredQuestions.length}件)
              </button>
            </div>
          )}

          {showAll && (
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleResetPagination}
                className="px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                10件ずつ表示に戻る
              </button>
            </div>
          )}
        </div>
      )}

      {/* 検索・フィルター（下部に配置） */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">質問を絞り込み検索</h3>
          <p className="text-sm text-gray-600">キーワードやカテゴリーで特定の質問を見つけることができます</p>
        </div>
        <SearchAndFilter
          onSearch={setSearchQuery}
          onFilterChange={(filters) => setFilters(filters)}
          filters={filters}
        />
      </div>
    </div>
  );
};

export default AnswerQuestions;