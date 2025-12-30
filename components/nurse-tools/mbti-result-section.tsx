import React, { memo, Suspense, useRef, useState } from 'react';
import { PersonalityResult, AIAdvice, MBTIScores, DiagnosisHistoryItem } from '../../lib/nurse-tools/mbti-types';
import { RECRUITMENT_SITES } from '../../lib/nurse-tools/mbti-constants';
import { MBTICard, MBTIBadge, MBTIButton } from './mbti-ui';
import { 
  Heart, Activity, Sparkles, CheckCircle2, RotateCcw, ExternalLink, 
  Share2, Download, RefreshCw, Star, FileText 
} from 'lucide-react';

// React.lazy でコンポーネントを遅延読み込み（Vite対応）
const MBTIRadarChart = React.lazy(() =>
  import('./mbti-radar-chart').then((mod) => ({ default: mod.MBTIRadarChart }))
);

const MBTICareerPath = React.lazy(() =>
  import('./mbti-career-path').then((mod) => ({ default: mod.MBTICareerPath }))
);

const MBTITypeMap = React.lazy(() =>
  import('./mbti-type-map').then((mod) => ({ default: mod.MBTITypeMap }))
);

const MBTIFriendComparison = React.lazy(() =>
  import('./mbti-friend-comparison').then((mod) => ({ default: mod.MBTIFriendComparison }))
);

const MBTIHistory = React.lazy(() =>
  import('./mbti-history').then((mod) => ({ default: mod.MBTIHistory }))
);

// MBTIタイプ別カラーテーマ
const TYPE_COLORS: Record<string, { primary: string; secondary: string; bg: string; border: string; badge: string }> = {
  INTJ: { primary: 'from-purple-500 to-indigo-600', secondary: 'purple', bg: 'bg-purple-50', border: 'border-purple-500', badge: 'bg-purple-100 text-purple-700' },
  INTP: { primary: 'from-indigo-500 to-purple-600', secondary: 'indigo', bg: 'bg-indigo-50', border: 'border-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
  ENTJ: { primary: 'from-violet-500 to-purple-600', secondary: 'violet', bg: 'bg-violet-50', border: 'border-violet-500', badge: 'bg-violet-100 text-violet-700' },
  ENTP: { primary: 'from-purple-500 to-violet-600', secondary: 'purple', bg: 'bg-purple-50', border: 'border-purple-500', badge: 'bg-purple-100 text-purple-700' },
  INFJ: { primary: 'from-teal-500 to-emerald-600', secondary: 'teal', bg: 'bg-teal-50', border: 'border-teal-500', badge: 'bg-teal-100 text-teal-700' },
  INFP: { primary: 'from-emerald-500 to-teal-600', secondary: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  ENFJ: { primary: 'from-green-500 to-teal-600', secondary: 'green', bg: 'bg-green-50', border: 'border-green-500', badge: 'bg-green-100 text-green-700' },
  ENFP: { primary: 'from-teal-500 to-green-600', secondary: 'teal', bg: 'bg-teal-50', border: 'border-teal-500', badge: 'bg-teal-100 text-teal-700' },
  ISTJ: { primary: 'from-blue-500 to-slate-600', secondary: 'blue', bg: 'bg-blue-50', border: 'border-blue-500', badge: 'bg-blue-100 text-blue-700' },
  ISFJ: { primary: 'from-sky-500 to-blue-600', secondary: 'sky', bg: 'bg-sky-50', border: 'border-sky-500', badge: 'bg-sky-100 text-sky-700' },
  ESTJ: { primary: 'from-slate-500 to-blue-600', secondary: 'slate', bg: 'bg-slate-50', border: 'border-slate-500', badge: 'bg-slate-100 text-slate-700' },
  ESFJ: { primary: 'from-blue-500 to-sky-600', secondary: 'blue', bg: 'bg-blue-50', border: 'border-blue-500', badge: 'bg-blue-100 text-blue-700' },
  ISTP: { primary: 'from-amber-500 to-orange-600', secondary: 'amber', bg: 'bg-amber-50', border: 'border-amber-500', badge: 'bg-amber-100 text-amber-700' },
  ISFP: { primary: 'from-orange-500 to-rose-600', secondary: 'orange', bg: 'bg-orange-50', border: 'border-orange-500', badge: 'bg-orange-100 text-orange-700' },
  ESTP: { primary: 'from-red-500 to-orange-600', secondary: 'red', bg: 'bg-red-50', border: 'border-red-500', badge: 'bg-red-100 text-red-700' },
  ESFP: { primary: 'from-rose-500 to-pink-600', secondary: 'rose', bg: 'bg-rose-50', border: 'border-rose-500', badge: 'bg-rose-100 text-rose-700' },
};

const getTypeColor = (type: string) => TYPE_COLORS[type] || TYPE_COLORS.INFJ;

interface MBTIResultSectionProps {
  result: PersonalityResult;
  aiAdvice: AIAdvice | null;
  isLoadingAi: boolean;
  aiError: boolean;
  aiQuota?: { remaining: number | null; dailyLimit: number; isLoggedIn: boolean };
  finalScores: MBTIScores | null;
  diagnosisHistory: DiagnosisHistoryItem[];
  onRetryAIAdvice: () => void;
  onReset: () => void;
  onTrackSiteClick: (siteName: string, mbtiType: string) => void;
  onSelectFromHistory: (item: DiagnosisHistoryItem) => void;
  onDeleteFromHistory: (id: string) => void;
  onClearHistory: () => void;
  // プロフィール反映用
  onSaveToProfile?: (mbtiType: string, mbtiTitle: string) => Promise<void>;
  isAuthenticated?: boolean;
  currentProfileMbti?: string | null;
  currentProfileShowMbti?: boolean;
}

// メイン結果カードをメモ化
const ResultCard = memo(function ResultCard({
  result,
  typeColor,
  resultCardRef,
}: {
  result: PersonalityResult;
  typeColor: ReturnType<typeof getTypeColor>;
  resultCardRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={resultCardRef} data-pdf-block="result-card">
      <MBTICard className={`border-t-4 ${typeColor.border} relative overflow-hidden mt-8 animate-scale-in card-hover-lift`}>
        <div className={`absolute top-0 right-0 -mt-4 -mr-4 ${typeColor.bg} w-32 h-32 rounded-full opacity-60 blur-2xl`}></div>
        <div className={`absolute bottom-0 left-0 -mb-4 -ml-4 ${typeColor.bg} w-24 h-24 rounded-full opacity-40 blur-xl`}></div>

        <div className="text-center space-y-4 mb-6 relative z-10">
          <span className={`inline-block px-4 py-1.5 ${typeColor.badge} rounded-full font-bold text-sm tracking-wider badge-pulse`}>
            {result.type} TYPE
          </span>

          {result.characterImage && (
            <div className="flex justify-center my-4 relative animate-fade-in-up delay-200">
              <div className="w-48 md:w-56 rounded-2xl shadow-xl overflow-hidden border-4 border-white character-image-hover">
                <img
                  src={result.characterImage}
                  alt={result.title}
                  width={224}
                  height={336}
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>
          )}

          <h2 className="text-3xl font-bold text-slate-800 animate-fade-in-up delay-300">{result.title}</h2>
          {!result.characterImage && <div className={`w-16 h-1 bg-gradient-to-r ${typeColor.primary} mx-auto rounded-full`}></div>}
        </div>

        <p className="text-slate-600 leading-relaxed mb-6 text-center animate-fade-in-up delay-400 relative z-10">
          {result.description}
        </p>

        <div className="space-y-4 animate-fade-in-up delay-500 relative z-10">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">強み</h3>
            <div className="flex flex-wrap gap-2">
              {result.strengths.map((s) => (
                <MBTIBadge key={s} color={`${typeColor.badge} border ${typeColor.border}`}>{s}</MBTIBadge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">向いている職場環境</h3>
            <p className={`text-sm text-slate-700 ${typeColor.bg} p-3 rounded-lg border ${typeColor.border} border-opacity-30`}>
              {result.workStyle}
            </p>
          </div>
        </div>
      </MBTICard>
    </div>
  );
});

// AIアドバイスセクションをメモ化
const AIAdviceSection = memo(function AIAdviceSection({
  aiAdvice,
  isLoadingAi,
  aiError,
  aiQuota,
  aiRetryCount,
  onRetry,
}: {
  aiAdvice: AIAdvice | null;
  isLoadingAi: boolean;
  aiError: boolean;
  aiQuota?: { remaining: number | null; dailyLimit: number; isLoggedIn: boolean };
  aiRetryCount: number;
  onRetry: () => void;
}) {
  const quotaBadge = (() => {
    if (!aiQuota) return null;
    const limit = aiQuota.dailyLimit ?? 3;
    if (!aiQuota.isLoggedIn) {
      return { text: `ログインで利用可（1日${limit}回）`, className: 'bg-gray-100 text-gray-700' };
    }
    if (aiQuota.remaining === null || aiQuota.remaining === undefined) {
      return { text: `1日${limit}回まで`, className: 'bg-gray-100 text-gray-700' };
    }
    const r = aiQuota.remaining;
    const className =
      r <= 0 ? 'bg-red-100 text-red-700' : r === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
    return { text: `本日あと${r}回`, className };
  })();

  return (
    <div className="space-y-4 animate-fade-in-up delay-600">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
          <h3 className="font-bold text-lg text-slate-800">AIキャリアアドバイス</h3>
        </div>
        {quotaBadge && (
          <span className={`px-3 py-1 rounded-full text-xs font-black ${quotaBadge.className}`}>
            {quotaBadge.text}
          </span>
        )}
      </div>

      {isLoadingAi ? (
        <MBTICard className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </MBTICard>
      ) : aiAdvice ? (
        <div className="grid md:grid-cols-1 gap-4">
          <MBTICard className="bg-purple-50/50 border border-purple-100 card-hover-lift animate-slide-in-left delay-100">
            <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> キャリアの活かし方
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiAdvice.careerAdvice}</p>
          </MBTICard>
          <MBTICard className="bg-blue-50/50 border border-blue-100 card-hover-lift animate-slide-in-right delay-200">
            <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" /> ストレス対策
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiAdvice.stressManagement}</p>
          </MBTICard>
          <MBTICard className="bg-orange-50/50 border border-orange-100 card-hover-lift animate-slide-in-left delay-300">
            <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> チームでの立ち回り
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiAdvice.teamCompatibility}</p>
          </MBTICard>
        </div>
      ) : (
        <MBTICard className="text-center py-8">
          <div className="text-slate-500 mb-4">
            <p className="mb-2">{aiError ? 'アドバイスの読み込みに失敗しました' : 'AIアドバイスはまだありません'}</p>
            <p className="text-xs text-slate-400">
              {aiRetryCount > 0 && `(リトライ ${aiRetryCount}回目)`}
            </p>
          </div>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors text-sm font-medium"
            disabled={isLoadingAi}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
            {aiError ? 'もう一度取得する' : '取得する'}
          </button>
        </MBTICard>
      )}
    </div>
  );
});

export const MBTIResultSection = memo(function MBTIResultSection({
  result,
  aiAdvice,
  isLoadingAi,
  aiError,
  aiQuota,
  finalScores,
  diagnosisHistory,
  onRetryAIAdvice,
  onReset,
  onTrackSiteClick,
  onSelectFromHistory,
  onDeleteFromHistory,
  onClearHistory,
  onSaveToProfile,
  isAuthenticated,
  currentProfileMbti,
  currentProfileShowMbti,
}: MBTIResultSectionProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSavingPDF, setIsSavingPDF] = useState(false);
  const [isSavingToProfile, setIsSavingToProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [aiRetryCount, setAiRetryCount] = useState(0);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const typeColor = getTypeColor(result.type);
  
  // プロフィールに保存済みかどうか
  // MBTIタイプが同じでも「プロフィール表示OFF」なら再反映（ON）できるようにする
  const isAlreadySavedToProfile = currentProfileMbti === result.type && !!currentProfileShowMbti;

  // SNSシェア機能
  const shareToTwitter = () => {
    const text = `私のナースタイプは「${result.title}」でした！\n\n強み: ${result.strengths.join('、')}\n\nあなたも診断してみませんか？`;
    const url = `${window.location.origin}/?section=nurse-career-diagnosis&type=${result.type}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToLine = () => {
    const text = `私のナースタイプは「${result.title}」でした！あなたも診断してみませんか？`;
    const url = `${window.location.origin}/?section=nurse-career-diagnosis&type=${result.type}`;
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  // 結果を画像として保存
  const saveResultAsImage = async () => {
    if (!resultCardRef.current) return;
    
    setIsSavingImage(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#f0fdfa',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `ナースキャリア診断_${result.type}_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to save image:', error);
      alert('画像の保存に失敗しました');
    } finally {
      setIsSavingImage(false);
    }
  };

  // 結果をPDFとして保存（日本語対応版）
  // html2canvasで画像化することで日本語を正しく表示
  const saveResultAsPDF = async () => {
    if (!finalScores) return;
    
    setIsSavingPDF(true);
    setShowShareMenu(false);
    try {
      const { generateMBTIPDFFromElement, generateMBTIPDF } = await import('../../lib/nurse-tools/mbti-pdf-generator');
      const target = pdfContentRef.current;
      if (target) {
        // html2canvas版を使用（日本語対応）
        await generateMBTIPDFFromElement(target, {
          mbtiType: result.type,
          result,
          scores: finalScores,
          aiAdvice,
          diagnosisDate: new Date().toLocaleDateString('ja-JP'),
        });
      } else {
        // フォールバック（英語版）
        await generateMBTIPDF({
          mbtiType: result.type,
          result,
          scores: finalScores,
          aiAdvice,
          diagnosisDate: new Date().toLocaleDateString('ja-JP'),
        });
      }
    } catch (error) {
      console.error('Failed to save PDF:', error);
      alert('PDFの保存に失敗しました');
    } finally {
      setIsSavingPDF(false);
    }
  };

  const handleRetry = () => {
    setAiRetryCount(prev => prev + 1);
    onRetryAIAdvice();
  };

  // プロフィールに保存
  const handleSaveToProfile = async () => {
    if (!onSaveToProfile) return;
    
    setIsSavingToProfile(true);
    setProfileSaveSuccess(false);
    try {
      await onSaveToProfile(result.type, result.title);
      setProfileSaveSuccess(true);
      // 3秒後に成功メッセージを消す
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save to profile:', error);
      alert('プロフィールへの保存に失敗しました');
    } finally {
      setIsSavingToProfile(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Share Button - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50" data-html2canvas-ignore="true">
        <div className="relative">
          {showShareMenu && (
            <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[160px] animate-fade-in">
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="font-medium">Xでシェア</span>
              </button>
              <button
                onClick={shareToLine}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <span className="font-medium">LINEでシェア</span>
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={saveResultAsImage}
                disabled={isSavingImage}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Download className={`w-5 h-5 text-teal-500 ${isSavingImage ? 'animate-bounce' : ''}`} />
                <span className="font-medium">{isSavingImage ? '保存中...' : '画像で保存'}</span>
              </button>
              <button
                onClick={saveResultAsPDF}
                disabled={isSavingPDF}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileText className={`w-5 h-5 text-red-500 ${isSavingPDF ? 'animate-pulse' : ''}`} />
                <span className="font-medium">{isSavingPDF ? '生成中...' : 'PDFで保存'}</span>
              </button>
              {/* プロフィールに反映ボタン */}
              {isAuthenticated && onSaveToProfile && (
                <>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={handleSaveToProfile}
                    disabled={isSavingToProfile || isAlreadySavedToProfile}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isAlreadySavedToProfile 
                        ? 'bg-green-50 text-green-700 cursor-default' 
                        : profileSaveSuccess
                        ? 'bg-green-50 text-green-700'
                        : 'hover:bg-slate-50 disabled:opacity-50'
                    }`}
                  >
                    {isAlreadySavedToProfile ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-medium">プロフィールに反映済み</span>
                      </>
                    ) : profileSaveSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-medium">反映しました！</span>
                      </>
                    ) : (
                      <>
                        <Star className={`w-5 h-5 text-amber-500 ${isSavingToProfile ? 'animate-spin' : ''}`} />
                        <span className="font-medium">{isSavingToProfile ? '保存中...' : 'プロフィールに反映'}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className={`w-14 h-14 bg-gradient-to-br ${typeColor.primary} text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl`}
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* PDFに含める範囲 */}
      <div ref={pdfContentRef} className="space-y-8">
        {/* Main Result Card */}
        <ResultCard result={result} typeColor={typeColor} resultCardRef={resultCardRef} />

        {/* スコア詳細（レーダーチャート） */}
        {finalScores && (
          <div data-pdf-block="balance-chart">
            <MBTICard className="animate-fade-in-up delay-550">
              <h3 className="font-bold text-lg text-slate-800 mb-4 text-center">あなたの性格バランス</h3>
              <Suspense fallback={<div className="h-[280px] bg-slate-100 animate-pulse rounded-xl" />}>
                <MBTIRadarChart scores={finalScores} />
              </Suspense>
            </MBTICard>
          </div>
        )}

        {/* AI Advice Section */}
        <div data-pdf-block="ai-advice">
          <AIAdviceSection
            aiAdvice={aiAdvice}
            isLoadingAi={isLoadingAi}
            aiError={aiError}
            aiQuota={aiQuota}
            aiRetryCount={aiRetryCount}
            onRetry={handleRetry}
          />
        </div>

        {/* Recommendations Section */}
        <div className="space-y-6 pt-6 animate-fade-in-up delay-700" data-pdf-block="recommendations">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-1">あなたにおすすめの転職サイト</h3>
            <p className="text-sm text-slate-500">あなたの性格タイプとの相性が高いサービスです</p>
          </div>

          <div className="grid gap-4">
            {RECRUITMENT_SITES
              .filter(site => site.recommendedFor.includes(result.type))
              .slice(0, 2)
              .map((site, index) => (
                <a
                  key={index}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block group animate-fade-in-up`}
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                  onClick={() => onTrackSiteClick(site.name, result.type)}
                >
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 relative card-hover-lift">
                    <div className={`absolute top-0 right-0 bg-gradient-to-r ${typeColor.primary} text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10`}>
                      相性抜群
                    </div>

                    <div className="flex flex-col md:flex-row">
                      <div className={`${site.color} p-4 md:w-32 flex items-center justify-center text-white font-bold text-lg md:text-xl shrink-0`}>
                        {site.name}
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {site.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{site.description}</p>
                        <div className="flex items-center text-teal-600 text-sm font-bold group-hover:underline">
                          サイトを見る <ExternalLink className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}

            {/* AIパーソナライズ推薦 */}
            {aiAdvice?.personalizedSiteRecommendations && aiAdvice.personalizedSiteRecommendations.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-slate-600">AIによるパーソナライズ推薦</span>
                </div>
                {aiAdvice.personalizedSiteRecommendations.map((rec, idx) => {
                  const site = RECRUITMENT_SITES.find(s => s.name === rec.siteName);
                  if (!site) return null;
                  return (
                    <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800">{rec.siteName}</span>
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                          相性スコア: {rec.matchScore}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{rec.reason}</p>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-teal-600 font-medium mt-2 hover:underline"
                        onClick={() => onTrackSiteClick(site.name, result.type)}
                      >
                        詳しく見る <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="text-center mt-4">
              <p className="text-xs text-slate-400 mb-2">※相性は傾向に基づくご提案です。</p>
            </div>
          </div>
        </div>

        {/* キャリアパス可視化 */}
        <div className="animate-fade-in-up delay-750" data-pdf-block="career-path">
          <Suspense fallback={<div className="h-[400px] bg-slate-100 animate-pulse rounded-xl" />}>
            <MBTICareerPath mbtiType={result.type} />
          </Suspense>
        </div>

        {/* 16タイプマップ */}
        <div className="animate-fade-in-up delay-775" data-pdf-block="type-map">
          <Suspense fallback={<div className="h-[350px] bg-slate-100 animate-pulse rounded-xl" />}>
            <MBTITypeMap currentType={result.type} />
          </Suspense>
        </div>

        {/* 友達との相性診断 */}
        <div className="animate-fade-in-up delay-800" data-pdf-block="friend-compatibility">
          <Suspense fallback={<div className="h-[200px] bg-slate-100 animate-pulse rounded-xl" />}>
            <MBTIFriendComparison myType={result.type} />
          </Suspense>
        </div>
      </div>

      {/* 診断履歴 */}
      {diagnosisHistory.length > 0 && (
        <div className="animate-fade-in-up delay-850" data-html2canvas-ignore="true">
          <Suspense fallback={<div className="h-[200px] bg-slate-100 animate-pulse rounded-xl" />}>
            <MBTIHistory
              history={diagnosisHistory}
              onSelect={onSelectFromHistory}
              onDelete={onDeleteFromHistory}
              onClear={onClearHistory}
              currentType={result.type}
            />
          </Suspense>
        </div>
      )}

      <div className="flex justify-center pt-8 pb-12 animate-fade-in-up delay-900" data-html2canvas-ignore="true">
        <MBTIButton onClick={onReset} variant="outline" className="w-full max-w-xs">
          <RotateCcw className="w-4 h-4" /> もう一度診断する
        </MBTIButton>
      </div>
    </div>
  );
});
