import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Clock, 
  User, 
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Award,
  Stethoscope,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { Question, Answer } from '../types';

interface QuestionCardProps {
  question: Question;
  onLike?: () => void;
  onViewDetail?: () => void;
  onViewAnswers?: () => void;
  onUserProfileClick?: () => void;
  isLiked?: boolean;
  isMyQuestion?: boolean;
  onBestAnswerSelect?: (answerId: string) => void;
  // useDataProvider からの Props
  answers: Answer[];
  onToggleGratitude?: (answerId: string, authorId: string) => Promise<{ success: boolean; error?: string }>;
  isAnswerGratitude?: (answerId: string) => boolean;
  updateAnswerGratitude?: (answerId: string, newGratitudeCount: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onLike, 
  onViewDetail, 
  onViewAnswers, 
  onUserProfileClick, 
  isLiked = false, 
  isMyQuestion = false, 
  onBestAnswerSelect,
  answers,
  onToggleGratitude,
  isAnswerGratitude,
  updateAnswerGratitude
}) => {
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [gratitudeAnimations, setGratitudeAnimations] = useState<{[key: string]: boolean}>({});
  const [answerGratitudesLocal, setAnswerGratitudesLocal] = useState<{[key: string]: boolean}>({});
  const [isUpdating, setIsUpdating] = useState(false); // 更新中フラグ
  const textRef = useRef<HTMLParagraphElement>(null);
  const questionHeaderRef = useRef<HTMLDivElement>(null);

  const handleLikeClick = () => {
    // いいねを追加する場合のみアニメーションを実行
    if (!isLiked) {
      // 触覚フィードバック（バイブレーション）
      if (navigator.vibrate) {
        navigator.vibrate(120); // 120ミリ秒の適度な振動
      }
      
      // ハートアニメーションを開始
      setIsHeartAnimating(true);
      
      // 0.67秒後にアニメーションを停止（0.8 ÷ 1.2 = 約0.67）
      setTimeout(() => {
        setIsHeartAnimating(false);
      }, 670);
    }
    
    // 元のonLike関数を実行
    if (onLike) {
      onLike();
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

  const avatar = useMemo(() => generateUserAvatar(question.author, question.authorRole), [question.author, question.authorRole]);
  const expertBadge = useMemo(() => getExpertBadge(question.authorRole), [question.authorRole]);
  
  // Props からの回答データをこの質問用にフィルタリング & ソート（感謝数順）- メモ化
  const allAnswers = useMemo(() => {
    return answers
      .filter(a => a.questionId === question.id)
      .sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return b.gratitude - a.gratitude;
      });
  }, [answers, question.id]);
  
  const displayedAnswers = useMemo(() => {
    return showAllAnswers ? allAnswers : allAnswers.slice(0, 3);
  }, [allAnswers, showAllAnswers]);
  
  
  // テキストの行数をチェックして展開が必要かどうかを判定
  useEffect(() => {
    const checkTextOverflow = () => {
      if (textRef.current) {
        // 一時的に line-clamp を外して実際の高さを測定
        const element = textRef.current;
        const computedStyle = window.getComputedStyle(element);
        const lineHeight = parseFloat(computedStyle.lineHeight);
        
        // line-clampを一時的に無効化
        element.style.webkitLineClamp = 'unset';
        element.style.display = '-webkit-box';
        
        const fullHeight = element.scrollHeight;
        
        // line-clampを元に戻す
        element.style.webkitLineClamp = '3';
        
        const clampedHeight = element.clientHeight;
        
        // 3行を超える場合に展開ボタンを表示
        setNeedsExpansion(fullHeight > clampedHeight);
      }
    };

    // 初期チェック
    const timer = setTimeout(checkTextOverflow, 100);
    
    // リサイズ時の再チェック
    const handleResize = () => {
      checkTextOverflow();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [question.content]);
  
  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // 展開を閉じる（たたむ）場合は質問者の位置にスクロール
    if (!newExpandedState && questionHeaderRef.current) {
      setTimeout(() => {
        questionHeaderRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); // 少し遅延させてDOMの更新を待つ
    }
  };

  // 感謝状態を取得（ローカルキャッシュ or Props）
  const getGratitudeState = (answerId: string): boolean => {
    if (answerId in answerGratitudesLocal) {
      return answerGratitudesLocal[answerId];
    }
    return isAnswerGratitude?.(answerId) ?? false;
  };

  // 感謝ボタンのクリック処理
  const handleGratitudeClick = async (answerId: string, currentGratitude: number, authorId: string) => {
    const isCurrentlyGrateful = getGratitudeState(answerId);
    
    // 感謝を追加する場合のみアニメーションを実行
    if (!isCurrentlyGrateful) {
      // 触覚フィードバック（バイブレーション）
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
      // 感謝アニメーションを開始
      setGratitudeAnimations(prev => ({ ...prev, [answerId]: true }));
      
      // 1秒後にアニメーションを停止
      setTimeout(() => {
        setGratitudeAnimations(prev => ({ ...prev, [answerId]: false }));
      }, 1000);
    }
    
    // オプティミスティック更新（ローカルキャッシュを即時更新）
    const newGratitudeState = !isCurrentlyGrateful;
    setAnswerGratitudesLocal(prev => ({ ...prev, [answerId]: newGratitudeState }));
    
    // Supabase/LocalStorage への更新
    if (onToggleGratitude) {
      const result = await onToggleGratitude(answerId, authorId);
      if (!result.success) {
        // 失敗した場合はキャッシュを戻す
        setAnswerGratitudesLocal(prev => ({ ...prev, [answerId]: isCurrentlyGrateful }));
        console.error('感謝の更新に失敗しました:', result.error);
      }
    } else {
      // LocalStorage 用のフォールバック
      const newGratitudeCount = newGratitudeState ? currentGratitude + 1 : currentGratitude - 1;
      updateAnswerGratitude?.(answerId, newGratitudeCount);
    }
  };

  return (
    <div 
      className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 p-6 transition-all duration-300 hover:-translate-y-1"
      data-question-id={question.id}
    >
      <div ref={questionHeaderRef} className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {/* Instagram風アバター */}
          <div 
            className="relative flex-shrink-0 cursor-pointer group"
            onClick={onUserProfileClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onUserProfileClick?.();
              }
            }}
            title={`${question.author}さんのプロフィールを表示`}
          >
            {/* ストーリー風リング */}
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
              <div className={`h-full w-full bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                {avatar.initials}
              </div>
            </div>
            {/* 専門家バッジ */}
            {expertBadge && (
              <div className={`absolute -bottom-0.5 -right-0.5 ${expertBadge.bg} ${expertBadge.color} rounded-full p-1 shadow-md border-2 border-white`}>
                <expertBadge.icon className="h-2.5 w-2.5" />
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-black text-gray-900 text-base truncate">{question.author}</h4>
              {/* X風認証バッジ */}
              {expertBadge && (
                <div className={`flex items-center space-x-1 px-2 py-1 ${expertBadge.bg} ${expertBadge.color} rounded-full`}>
                  <expertBadge.icon className="h-3 w-3" />
                  <span className="text-xs font-bold">{expertBadge.label}</span>
                </div>
              )}
              {isMyQuestion && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex-shrink-0">
                  あなたの質問
                </span>
              )}
            </div>
            <p className="text-gray-600 font-semibold text-sm truncate">{question.authorRole}</p>
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

      <div className="mb-4">
        <h3 
          onClick={onViewDetail}
          className="text-lg lg:text-xl font-black text-gray-900 mb-3 hover:text-blue-600 cursor-pointer transition-colors duration-200 leading-tight"
        >
          {question.title}
        </h3>
        <div className="text-gray-700 leading-relaxed text-sm">
          <p 
            ref={textRef}
            className={isExpanded ? '' : 'line-clamp-3'}
            style={!isExpanded ? {
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            } : {}}
          >
            {question.content}
          </p>
          
          {/* さらに表示ボタン - 中央配置 */}
          {needsExpansion && !isExpanded && (
            <div className="flex justify-center mt-3">
              <button
                onClick={handleToggleExpand}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 font-medium text-sm rounded-lg hover:bg-blue-100 transition-all duration-200"
              >
                さらに表示
              </button>
            </div>
          )}
        </div>

        {/* 質問文直下のアクション - いいね・回答数・解決済み */}
        <div className="flex items-center flex-wrap gap-x-6 gap-y-3 mt-4 overflow-visible">
          <button 
            onClick={handleLikeClick}
            className={`flex items-center space-x-2 transition-colors duration-200 group overflow-visible ${
              isLiked 
                ? 'text-gray-700' 
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors duration-200 overflow-visible ${
              isLiked 
                ? 'bg-red-100' 
                : 'group-hover:bg-red-50'
            }`}>
              <Heart 
                className={`h-5 w-5 transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-500 fill-red-500 scale-110' 
                    : 'text-gray-600 group-hover:text-red-500'
                } ${isHeartAnimating ? 'text-red-500 fill-red-500' : ''}`}
                style={{
                  animation: isHeartAnimating ? 'heartPulse 0.67s ease-in-out' : 'none',
                  animationFillMode: 'forwards'
                }}
              />
            </div>
            <span className="font-bold">{question.likes}</span>
          </button>
          
          <button 
            onClick={onViewAnswers || onViewDetail}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold whitespace-nowrap underline-offset-2 hover:underline">{question.answers}件の回答</span>
          </button>
          
          {question.hasAcceptedAnswer && (
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-bold whitespace-nowrap">解決済み</span>
            </div>
          )}
        </div>

        {/* 展開された場合の追加コンテンツ */}
        {isExpanded && (
            <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
              {/* 回答インライン表示 */}
              {allAnswers.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    回答 ({allAnswers.length}件) - 感謝数順
                  </h4>
                  <div className="space-y-4">
                    {displayedAnswers.map((answer) => {
                      const answerAvatar = generateUserAvatar(answer.author, answer.authorRole);
                      const answerBadge = getExpertBadge(answer.authorRole);
                      return (
                        <div key={answer.id} className="bg-gray-50 rounded-2xl p-5">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 shadow-md">
                              <div className={`h-full w-full bg-gradient-to-br ${answerAvatar.gradient} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                                {answerAvatar.initials}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-gray-900">{answer.author}</span>
                                {answerBadge && (
                                  <div className={`flex items-center space-x-1 px-2 py-0.5 ${answerBadge.bg} ${answerBadge.color} rounded-full`}>
                                    <answerBadge.icon className="h-3 w-3" />
                                    <span className="text-xs font-bold">{answerBadge.label}</span>
                                  </div>
                                )}
                                {answer.isAccepted && (
                                  <div className="flex items-center space-x-1 text-emerald-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs font-bold">採用済み</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-600 font-medium">{answer.authorRole}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500 text-xs">{new Date(answer.createdAt).toLocaleDateString('ja-JP')}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-3">
                            {answer.content}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <button 
                              onClick={() => handleGratitudeClick(answer.id, answer.gratitude, answer.authorId || '')}
                              className={`flex items-center space-x-2 transition-all duration-200 group ${
                                getGratitudeState(answer.id) 
                                  ? 'text-red-600' 
                                  : 'text-gray-500 hover:text-red-600'
                              }`}
                            >
                              <div className={`p-2 rounded-xl transition-all duration-200 ${
                                getGratitudeState(answer.id) 
                                  ? 'bg-emerald-100' 
                                  : 'group-hover:bg-emerald-50'
                              }`}>
                                {/* PC版と同じ合掌アイコン */}
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="24" 
                                  height="24" 
                                  viewBox="0 0 113.4 150" 
                                  className="h-5 w-5"
                                  style={{ 
                                    overflow: 'visible',
                                    animation: gratitudeAnimations[answer.id] ? 'gratitudePulse 1s ease-in-out' : 'none',
                                    animationFillMode: 'forwards'
                                  }}
                                >
                                  <defs>
                                    {/* 感謝時の光る効果グラデーション */}
                                    {getGratitudeState(answer.id) && (
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
                                    {gratitudeAnimations[answer.id] && (
                                      <>
                                        {/* 2つのかわいいハートが合掌した指先から舞い上がる */}
                                        {[
                                          { x: 42, y: 50, delay: 0, size: 8, type: 'large' },
                                          { x: 72, y: 52, delay: 0.15, size: 6, type: 'medium' }
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
                                            
                                            {/* かわいいピンクハートの本体 */}
                                            <path 
                                              d={`M${star.x} ${star.y + 8 * star.size} C${star.x - 12 * star.size} ${star.y - 5 * star.size} ${star.x - 8 * star.size} ${star.y - 12 * star.size} ${star.x} ${star.y - 5 * star.size} C${star.x + 8 * star.size} ${star.y - 12 * star.size} ${star.x + 12 * star.size} ${star.y - 5 * star.size} ${star.x} ${star.y + 8 * star.size} Z`}
                                              fill={`url(#heartGlow-${answer.id}-${index})`}
                                              stroke="#ffc0cb"
                                              strokeWidth="0.3"
                                              style={{
                                                filter: 'drop-shadow(0 1px 2px rgba(255, 105, 180, 0.3))'
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
                                    {getGratitudeState(answer.id) && !gratitudeAnimations[answer.id] && (
                                      <circle 
                                        cx="56.7" 
                                        cy="56.7" 
                                        r="50" 
                                        fill={`url(#gratitudeGlow-${answer.id})`}
                                        className="animate-pulse"
                                      />
                                    )}
                                    
                                    {/* 合掌する両手のパス（拡大） */}
                                    <g transform="translate(56.7, 75) scale(1.8) translate(-56.7, -75)">
                                      <path 
                                        d="M38.6,102.1l18.1-21.2,18.1,21.2h27.2v-24.2l-15.5-10.4c-6.4-4.2-10.5-11.1-11.2-18.7l-2.8-29c-.5-5.1-5.1-8.8-10.1-8.3-2.1.2-4,1.1-5.5,2.6-3.7-3.6-9.5-3.5-13.1.2-1.5,1.5-2.4,3.5-2.6,5.5l-2.8,29c-.7,7.6-4.9,14.5-11.2,18.7l-15.9,10.4v24.2s27.3,0,27.3,0ZM60.6,18.1c.7-.7,1.6-1.1,2.6-1.1,1.9,0,3.4,1.4,3.6,3.3l2.8,29c.9,8.9,5.5,17.1,12.8,22.3l-15.1,13-7.7-9V20.6c-.1-.9.3-1.9,1-2.5h0ZM43.8,49.3l2.8-29c.1-2,1.9-3.5,3.9-3.4,1.9.1,3.4,1.8,3.4,3.7v54.9l-7.7,9-15.2-13c7.3-5.2,12-13.3,12.8-22.2Z"
                                        fill={
                                          getGratitudeState(answer.id)
                                            ? '#dc2626'  // 赤色（感謝済み）
                                            : '#d1d5db'  // 薄いグレー（通常）
                                        }
                                        stroke={
                                          getGratitudeState(answer.id)
                                            ? '#991b1b'  // 濃い赤（感謝済み）
                                            : '#9ca3af'  // グレー（通常）
                                        }
                                        strokeWidth="0.6"
                                      />
                                    </g>
                                  </g>
                                </svg>
                              </div>
                              <span className="font-semibold">{answer.gratitude} 感謝</span>
                            </button>
                            
                            {/* ベストアンサー選択ボタン（質問者のみ） */}
                            {isMyQuestion && !answer.isAccepted && !allAnswers.some(a => a.isAccepted) && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('ベストアンサー選択ボタンクリック:', answer.id);
                                  
                                  // 親コンポーネントのハンドラーを呼び出し
                                  if (onBestAnswerSelect) {
                                    onBestAnswerSelect(answer.id);
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-bold rounded-lg hover:bg-emerald-200 transition-all duration-200 text-xs"
                              >
                                ベストアンサーに選ぶ
                              </button>
                            )}
                            
                            {/* ベストアンサーマークと解除ボタン */}
                            {answer.isAccepted && (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 text-emerald-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-xs font-bold">採用済み</span>
                                </div>
                                {isMyQuestion && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      // 連打防止
                                      if (isUpdating) return;
                                      setIsUpdating(true);
                                      
                                      console.log('ベストアンサー解除ボタンクリック');
                                      
                                      // 親コンポーネントのハンドラーを呼び出し（空のIDで解除）
                                      if (onBestAnswerSelect) {
                                        onBestAnswerSelect('');
                                      }
                                      
                                      // 更新フラグをリセット
                                      setTimeout(() => {
                                        setIsUpdating(false);
                                      }, 300);
                                    }}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 font-medium rounded text-xs hover:bg-gray-200 transition-all duration-200"
                                    disabled={isUpdating}
                                  >
                                    解除
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* さらに回答を表示ボタン */}
                    {!showAllAnswers && allAnswers.length > 3 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setShowAllAnswers(true)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200 mx-auto"
                        >
                          <span>他の回答も見る ({allAnswers.length - 3}件)</span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                  </div>
                </div>
              )}
              
              {/* たたむボタン */}
              <div className="text-center pt-4">
                <button
                  onClick={handleToggleExpand}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 font-semibold text-sm transition-colors duration-200 mx-auto"
                >
                  <span>たたむ</span>
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </div>


      
    </div>
  );
};

// パフォーマンス最適化: 不要な再レンダリングを防止
export default memo(QuestionCard);