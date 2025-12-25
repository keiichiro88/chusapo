import React, { Suspense, useMemo, useState } from 'react';
import {
  Syringe,
  MessageCircle,
  Award,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Sparkles,
  Brain,
  TestTube,
  Activity,
  Cable,
  CircleDot
} from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import QuestionCard from './components/QuestionCard';
import CategoryCard from './components/CategoryCard';
import QuestionForm from './components/QuestionForm';
import QuestionDetail from './components/QuestionDetail';
import SearchAndFilter, { FilterOptions } from './components/SearchAndFilter';
import UserSelector from './components/UserSelector';
import EditProfileModal from './components/profile/EditProfileModal';
import AuthTest from './components/auth/AuthTest';
import EmptyState from './components/EmptyState';
import { useDataProvider } from './hooks/useDataProvider';
import { useUser } from './hooks/useUser';
import { useToastContext } from './contexts/ToastContext';
import { Question } from './types';

// 初回ロードを軽くするため、ホーム以外の大きい画面は遅延ロードする
const AnswerQuestions = React.lazy(() => import('./components/AnswerQuestions'));
const Guidelines = React.lazy(() => import('./components/Guidelines'));
const QuizApp = React.lazy(() => import('./components/quiz/QuizApp'));
const AboutChusapo = React.lazy(() => import('./components/AboutChusapo'));
const UserProfile = React.lazy(() => import('./components/profile/UserProfile'));
const MBTICareerDiagnosisPage = React.lazy(() =>
  import('../components/nurse-tools/mbti-career-diagnosis-page').then((mod) => ({
    default: mod.MBTICareerDiagnosisPage,
  }))
);

function SectionFallback({ label }: { label: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 text-center">
        <p className="text-gray-600 font-medium">{label}を読み込み中...</p>
      </div>
    </div>
  );
}

function App() {
  // URLパラメータでテストページを表示（?auth-test）
  const isAuthTest = window.location.search.includes('auth-test');
  if (isAuthTest) {
    return <AuthTest />;
  }
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [scrollToAnswers, setScrollToAnswers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section === 'nurse-career-diagnosis' || section === 'mbti' || section === 'self-analysis') {
      return 'nurse-career-diagnosis';
    }
    return 'home';
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0);
  const [displayedQuestionsCount, setDisplayedQuestionsCount] = useState(10);  // 初期表示件数

  // データプロバイダー（認証状態に応じてSupabase/LocalStorageを自動切り替え）
  const {
    questions,
    totalQuestionCount,
    hasMoreQuestions: supabaseHasMore,
    isLoadingMoreQuestions,
    addQuestion,
    likeQuestion,
    isQuestionLiked,
    loadMoreQuestions,
    answers,
    addAnswer,
    getAnswersForQuestion,
    fetchAnswersForQuestion,
    toggleGratitude,
    isAnswerGratitude,
    selectBestAnswer,
    isAuthenticated,
    dataSource
  } = useDataProvider();
  
  const { currentUser, users, loginAsUser, logout, createUser, isMyQuestion } = useUser();
  const { showInfo, showSuccess, showError } = useToastContext();

  const isDev = import.meta.env.DEV;

  // 認証が必要な操作のハンドラ
  const handleAuthRequiredAction = (action: () => void, actionName: string = '操作') => {
    if (!isAuthenticated) {
      showInfo(`${actionName}するにはログインが必要です。右上の「ログイン」ボタンからログインしてください。`);
      return;
    }
    action();
  };

  // 実際の回答数を含む質問データを取得
  const questionsWithAnswerCount = useMemo(() => {
    return questions.map(question => {
      const answers = getAnswersForQuestion(question.id);
      return {
        ...question,
        answers: answers.length,
        hasAcceptedAnswer: answers.some(answer => answer.isAccepted)
      };
    });
  }, [questions, getAnswersForQuestion]);

  // 検索・フィルタリングされた質問を取得
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questionsWithAnswerCount;

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

    // デフォルトソート（新しい順）
    filtered.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return filtered;
  }, [questionsWithAnswerCount, searchQuery, filters]);

  // 表示する質問（ページング対応）
  // Supabase: サーバーサイドページング（既にページング済みデータ）
  // LocalStorage: クライアントサイドページング
  const displayedQuestions = useMemo(() => {
    if (isAuthenticated) {
      // Supabaseモード：サーバーから取得したデータをそのまま表示
      return filteredAndSortedQuestions;
    }
    // LocalStorageモード：クライアントサイドでスライス
    return filteredAndSortedQuestions.slice(0, displayedQuestionsCount);
  }, [filteredAndSortedQuestions, displayedQuestionsCount, isAuthenticated]);

  // 追加で読み込む質問があるか
  const hasMoreQuestions = isAuthenticated 
    ? supabaseHasMore 
    : filteredAndSortedQuestions.length > displayedQuestionsCount;

  // 残り件数を計算
  const remainingQuestions = useMemo(() => {
    if (isAuthenticated && totalQuestionCount !== null) {
      return Math.max(0, totalQuestionCount - questions.length);
    }
    return filteredAndSortedQuestions.length - displayedQuestionsCount;
  }, [isAuthenticated, totalQuestionCount, questions.length, filteredAndSortedQuestions.length, displayedQuestionsCount]);

  // 「さらに読み込む」ハンドラ
  const handleLoadMore = async () => {
    if (isAuthenticated) {
      // Supabaseモード：サーバーから追加データを取得
      await loadMoreQuestions();
    } else {
      // LocalStorageモード：表示件数を増やす
      setDisplayedQuestionsCount(prev => prev + 10);
    }
  };

  const scrollToQuestionList = () => {
    const el = document.getElementById('question-list');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setActiveSection('home');
    setFilters(prev => ({
      ...prev,
      category: prev.category === categoryName ? '' : categoryName,
    }));
    setSidebarOpen(false);
    setTimeout(scrollToQuestionList, 50);
  };

  const categoryIdToName: Record<string, string> = {
    injection: '注射',
    'blood-collection': '採血',
    'route-securing': 'ルート確保',
    arterial: '動脈穿刺',
    others: 'その他',
  };

  const categories = [
    {
      title: '注射',
      description: '肋肉注射・皮下注射の技術とコツ',
      icon: Syringe,
      questionCount: questionsWithAnswerCount.filter(q => q.tags.includes('注射')).length,
      color: 'bg-gradient-to-br from-red-500 to-pink-600'
    },
    {
      title: '採血',
      description: '静脈採血の技術とトラブルシューティング',
      icon: TestTube,
      questionCount: questionsWithAnswerCount.filter(q => q.tags.includes('採血')).length,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      title: 'ルート確保',
      description: '静脈内アクセスとカテーテル留置',
      icon: Cable,
      questionCount: questionsWithAnswerCount.filter(q => q.tags.includes('ルート確保')).length,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      title: '動脈穿刺',
      description: '動脈血ガスと動脈アクセス',
      icon: Activity,
      questionCount: questionsWithAnswerCount.filter(q => q.tags.includes('動脈穿刺')).length,
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600'
    },
    {
      title: 'その他',
      description: 'その他の穿刺技術や関連質問',
      icon: CircleDot,
      questionCount: questionsWithAnswerCount.filter(q => q.tags.includes('その他')).length,
      color: 'bg-gradient-to-br from-gray-500 to-slate-600'
    }
  ];

  // 統計情報を実際のデータから計算
  const stats = useMemo(() => {
    const totalQuestions = questionsWithAnswerCount.length;
    const resolvedQuestions = questionsWithAnswerCount.filter(q => q.hasAcceptedAnswer).length;
    const totalAnswers = questionsWithAnswerCount.reduce((sum, q) => sum + q.answers, 0);
    const resolutionRate = totalQuestions > 0 ? Math.round((resolvedQuestions / totalQuestions) * 100) : 0;

    return [
      {
        title: 'アクティブな質問',
        value: totalQuestions.toString(),
        change: `解決済み: ${resolvedQuestions}件`,
        changeType: 'increase' as const,
        icon: MessageCircle
      },
      {
        title: '専門家の回答',
        value: totalAnswers.toString(),
        change: `平均 ${totalQuestions > 0 ? (totalAnswers / totalQuestions).toFixed(1) : 0} 回答/質問`,
        changeType: 'increase' as const,
        icon: Award
      },
      {
        title: '解決率',
        value: `${resolutionRate}%`,
        change: `${resolvedQuestions}/${totalQuestions} 件解決`,
        changeType: 'increase' as const,
        icon: TrendingUp
      },
      {
        title: '総いいね数',
        value: questionsWithAnswerCount.reduce((sum, q) => sum + q.likes, 0).toString(),
        change: `平均 ${totalQuestions > 0 ? (questionsWithAnswerCount.reduce((sum, q) => sum + q.likes, 0) / totalQuestions).toFixed(1) : 0} いいね/質問`,
        changeType: 'increase' as const,
        icon: Clock
      }
    ];
  }, [questionsWithAnswerCount]);

  const handleNavigate = (section: string) => {
    console.log('Navigating to section:', section);

    // サイドバーのカテゴリ選択（ホームに戻しつつフィルタ適用）
    const mappedCategory = categoryIdToName[section];
    if (mappedCategory) {
      handleCategorySelect(mappedCategory);
      return;
    }

    // シェアURL用の section パラメータを同期（キャリア診断AIのみ）
    try {
      const url = new URL(window.location.href);
      if (section === 'nurse-career-diagnosis') {
        url.searchParams.set('section', 'nurse-career-diagnosis');
      } else if (url.searchParams.get('section') === 'nurse-career-diagnosis') {
        url.searchParams.delete('section');
        url.searchParams.delete('type');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // no-op
    }

    // ホーム画面以外からホーム画面に戻る場合はスクロール位置を保持
    if (section === 'home' && activeSection !== 'home') {
      // 現在のスクロール位置を保存（他の画面からホームに戻る場合）
      if (activeSection !== 'profile') {
        const currentScrollPosition = window.scrollY || window.pageYOffset;
        setSavedScrollPosition(currentScrollPosition);
      }
    }

    setActiveSection(section);
    setSidebarOpen(false);

    // プロフィール以外からホーム画面に戻る場合は、少し遅延してスクロール位置を復元
    if (section === 'home' && activeSection !== 'home' && activeSection !== 'profile') {
      setTimeout(() => {
        window.scrollTo({
          top: savedScrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const handleSubmitAnswer = async (questionId: string, answerContent: string, authorName: string, authorRole: string) => {
    await addAnswer({
      questionId,
      content: answerContent,
      author: authorName,
      authorRole
    }, currentUser?.id);
  };

  const handleQuestionSelect = (question: Question, shouldScrollToAnswers: boolean = false) => {
    setSelectedQuestion(question);
    setScrollToAnswers(shouldScrollToAnswers);
  };

  const handleUserProfileClick = (authorName: string) => {
    // 現在のスクロール位置を保存
    const currentScrollPosition = window.scrollY || window.pageYOffset;
    setSavedScrollPosition(currentScrollPosition);

    setSelectedUser(authorName);
    setActiveSection('profile');
    setShowUserProfile(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-x-hidden">
      <Header
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        onProfileClick={() => setActiveSection('profile')}
        onEditProfileClick={() => setShowEditProfile(true)}
      />

      {/* ユーザー選択コンポーネント */}
      {isDev && window.location.search.includes('demo-user') && dataSource === 'localStorage' && (
        <div className="fixed top-20 right-4 lg:right-6 z-50">
          <UserSelector
            currentUser={currentUser}
            users={users}
            onLogin={loginAsUser}
            onLogout={logout}
            onCreateUser={createUser}
          />
        </div>
      )}


      <div className="flex min-w-0">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={handleNavigate}
          activeSection={activeSection}
          activeCategory={filters.category}
          questionCount={questionsWithAnswerCount.length}
        />

        <main className="flex-1 min-w-0 px-4 lg:px-6 xl:px-8 py-8 lg:py-12">
          {activeSection === 'answer-questions' ? (
            <Suspense fallback={<SectionFallback label="質問に回答" />}>
              <AnswerQuestions
                questions={questionsWithAnswerCount}
                answers={answers}
                onSubmitAnswer={handleSubmitAnswer}
                onUserProfileClick={handleUserProfileClick}
                onBack={() => setActiveSection('home')}
              />
            </Suspense>
          ) : activeSection === 'guidelines' ? (
            <Suspense fallback={<SectionFallback label="ガイドライン" />}>
              <Guidelines onBack={() => setActiveSection('home')} />
            </Suspense>
          ) : activeSection === 'quiz' ? (
            <Suspense fallback={<SectionFallback label="学習クイズ" />}>
              <QuizApp onBack={() => setActiveSection('home')} />
            </Suspense>
          ) : activeSection === 'nurse-career-diagnosis' ? (
            <Suspense fallback={<SectionFallback label="キャリア診断AI" />}>
              <MBTICareerDiagnosisPage />
            </Suspense>
          ) : activeSection === 'about-chusapo' ? (
            <Suspense fallback={<SectionFallback label="チューサポについて" />}>
              <AboutChusapo onBack={() => setActiveSection('home')} />
            </Suspense>
          ) : activeSection === 'profile' ? (
            <Suspense fallback={<SectionFallback label="プロフィール" />}>
              <UserProfile
                userName={selectedUser || undefined}
                onUserProfileClick={handleUserProfileClick}
                onBack={() => {
                  setActiveSection('home');
                  setShowUserProfile(false);
                  setSelectedUser(null);

                  // 少し遅延してからスクロール位置を復元（画面描画完了を待つ）
                  setTimeout(() => {
                    window.scrollTo({
                      top: savedScrollPosition,
                      behavior: 'smooth'
                    });
                  }, 100);
                }}
                onEditProfile={() => setShowEditProfile(true)}
              />
            </Suspense>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* データソース表示（デバッグ用） */}
              {isDev && (
                <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${
                  dataSource === 'supabase' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                }`}>
                  📊 データソース: {dataSource === 'supabase' ? '🔗 Supabase（本番データ）' : '💾 LocalStorage（デモデータ）'}
                  {isAuthenticated && ' ✅ ログイン中'}
                </div>
              )}
              
              {/* ウェルカムセクション */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-4 sm:mb-0 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                      <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-300" />
                      <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold">穿刺の相談所</h1>
                    </div>
                    <p className="text-blue-100 text-xs lg:text-sm xl:text-base font-medium">
                      穿刺技術のプロフェッショナル相談プラットフォーム
                    </p>
                  </div>
                  <button
                    onClick={() => handleAuthRequiredAction(() => setShowQuestionForm(true), '質問を投稿')}
                    className="bg-white text-blue-600 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-bold hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 text-sm lg:text-base"
                  >
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span>質問を投稿</span>
                  </button>
                </div>
              </div>

              {/* ホームショートカット（発見性UP） */}
              <div className="mb-6 lg:mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm lg:text-base font-black text-gray-900">いますぐできること</h3>
                  <span className="text-xs text-gray-500">メニューを開かなくてもOK</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                  <button
                    type="button"
                    onClick={() => handleAuthRequiredAction(() => setShowQuestionForm(true), '質問を投稿')}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 lg:p-5 text-left shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Plus className="h-5 w-5" />
                      </div>
                      {!isAuthenticated && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          ログイン
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="font-black text-gray-900 text-sm">質問する</p>
                      <p className="text-xs text-gray-500 mt-1">困りごとを投稿</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuthRequiredAction(() => handleNavigate('answer-questions'), '回答')}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 lg:p-5 text-left shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Award className="h-5 w-5" />
                      </div>
                      {!isAuthenticated && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          ログイン
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="font-black text-gray-900 text-sm">回答する</p>
                      <p className="text-xs text-gray-500 mt-1">知見をシェア</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('quiz')}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 lg:p-5 text-left shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Brain className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="font-black text-gray-900 text-sm">学ぶ</p>
                      <p className="text-xs text-gray-500 mt-1">学習クイズ</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('nurse-career-diagnosis')}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 lg:p-5 text-left shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        NEW
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="font-black text-gray-900 text-sm">診断する</p>
                      <p className="text-xs text-gray-500 mt-1">キャリア診断AI</p>
                    </div>
                  </button>
                </div>
              </div>


              {/* メインコンテンツグリッド */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
                {/* 左カラム - 質問一覧 */}
                <div className="lg:col-span-2 min-w-0">
                  <div id="question-list" className="flex items-center justify-between mb-6 lg:mb-8 scroll-mt-28">
                    <h2 className="text-xl lg:text-2xl xl:text-3xl font-black text-gray-900">
                      質問一覧 ({filteredAndSortedQuestions.length}件)
                    </h2>
                  </div>

                  {/* 検索・フィルター */}
                  <div className="mb-6 lg:mb-8">
                    <SearchAndFilter
                      onSearch={(query) => {
                        setSearchQuery(query);
                        setDisplayedQuestionsCount(10); // 検索時にリセット
                      }}
                      onFilterChange={(newFilters) => {
                        setFilters(newFilters);
                        setDisplayedQuestionsCount(10); // フィルタ変更時にリセット
                      }}
                      filters={filters}
                    />
                  </div>

                  <div className="space-y-6 lg:space-y-8">
                    {displayedQuestions.length > 0 ? (
                      displayedQuestions.map((question) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          onLike={() => likeQuestion(question.id)}
                          onViewDetail={() => handleQuestionSelect(question, false)}
                          onViewAnswers={() => handleQuestionSelect(question, true)}
                          onUserProfileClick={() => handleUserProfileClick(question.author)}
                          isLiked={isQuestionLiked(question.id)}
                          isMyQuestion={isMyQuestion(question.authorId || '')}
                          answers={answers}
                          onToggleGratitude={toggleGratitude}
                          isAnswerGratitude={isAnswerGratitude}
                          onBestAnswerSelect={async (answerId) => {
                            const result = await selectBestAnswer(question.id, answerId);
                            if (!result.success) {
                              alert(result.error || 'ベストアンサーの更新に失敗しました。');
                            }
                          }}
                        />
                      ))
                    ) : (
                      <EmptyState
                        type={searchQuery || filters.category ? 'no-results' : 'no-questions'}
                        actionLabel="質問を投稿する"
                        onAction={() => handleAuthRequiredAction(() => setShowQuestionForm(true), '質問を投稿')}
                      />
                    )}
                  </div>

                  {/* さらに読み込むボタン（表示する質問がある場合のみ） */}
                  {hasMoreQuestions && (
                    <div className="mt-8 lg:mt-12 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMoreQuestions}
                        className="px-6 lg:px-8 py-3 lg:py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMoreQuestions ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            読み込み中...
                          </span>
                        ) : (
                          <>さらに質問を読み込む{remainingQuestions > 0 && `（残り ${remainingQuestions}件）`}</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* 右カラム - カテゴリーとクイックアクション */}
                <div className="space-y-4 lg:space-y-6 min-w-0">
                  {/* カテゴリー */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">カテゴリー別参照</h3>
                    <div className="space-y-3">
                      {categories.map((category, index) => (
                        <CategoryCard
                          key={index}
                          {...category}
                          onClick={() => handleCategorySelect(category.title)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* クイックアクション */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">クイックアクション</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAuthRequiredAction(() => setShowQuestionForm(true), '質問を投稿')}
                        className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">質問を投稿</span>
                      </button>
                      <button
                        onClick={() => setActiveSection('answer-questions')}
                        className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-emerald-50 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors duration-200">
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">質問に回答</span>
                      </button>
                      <button
                        onClick={() => setActiveSection('guidelines')}
                        className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-purple-50 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-200">
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">ガイドライン確認</span>
                      </button>
                    </div>
                  </div>

                  {/* 今週の専門家 */}
                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 p-4 shadow-sm">
                    <div className="flex items-center space-x-2 mb-3">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-lg font-bold text-gray-900">感謝ランキング1位</h3>
                    </div>
                    {(() => {
                      // 感謝数が最も多いユーザーを取得
                      const topUser = users.length > 0 ? users.reduce((prev, current) =>
                        (current.totalGratitude > prev.totalGratitude) ? current : prev
                      ) : null;

                      if (!topUser) {
                        return (
                          <div>
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                <Award className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-base">データを読み込み中...</h4>
                                <p className="text-gray-600 font-medium text-sm">お待ちください</p>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3 leading-relaxed text-sm">
                              ユーザーデータを読み込んでいます...
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div>
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                              <Award className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">{topUser.name}</h4>
                              <p className="text-gray-600 font-medium text-sm">{topUser.role}</p>
                              {topUser.currentTitle && (
                                <p className="text-emerald-600 font-bold text-xs">{topUser.currentTitle}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3 leading-relaxed text-sm">
                            実践に基づく感謝を多数受けている信頼できる専門家です。
                          </p>
                          <div className="flex flex-col text-xs text-gray-600 space-y-1">
                            <span className="font-medium">✓ {topUser.totalGratitude}件の感謝</span>
                            <span className="font-medium">✓ 実践的なアドバイス提供</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 質問フォームモーダル */}
      <QuestionForm
        isOpen={showQuestionForm}
        onClose={() => setShowQuestionForm(false)}
        onSubmit={async (questionData) => {
          const result = await addQuestion(questionData, currentUser?.id);
          if (result.success) {
            setShowQuestionForm(false);
          }
        }}
        currentUser={currentUser}
      />

      {/* 質問詳細モーダル */}
      {selectedQuestion && (
        <QuestionDetail
          question={selectedQuestion}
          isOpen={!!selectedQuestion}
          onClose={() => {
            setSelectedQuestion(null);
            setScrollToAnswers(false);
          }}
          onLike={() => likeQuestion(selectedQuestion.id)}
          scrollToAnswers={scrollToAnswers}
          isQuestionLiked={isQuestionLiked(selectedQuestion.id)}
          currentUser={currentUser}
          isMyQuestion={isMyQuestion(selectedQuestion.authorId || '')}
          onUserProfileClick={handleUserProfileClick}
          answers={answers}
          onAddAnswer={addAnswer}
          onToggleGratitude={toggleGratitude}
          isAnswerGratitude={isAnswerGratitude}
          onSelectBestAnswer={selectBestAnswer}
        />
      )}

      {/* プロフィール編集モーダル */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </div>
  );
}

export default App;