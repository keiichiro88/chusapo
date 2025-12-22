/**
 * Google Analytics 4 (gtag.js) の設定
 */

// グローバル型定義
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics の初期化
 */
export const initAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId || import.meta.env.DEV) {
    console.log('📊 Analytics: 開発環境のためスキップ');
    return;
  }

  // gtag.js スクリプトを動的に追加
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // dataLayer と gtag 関数を初期化
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });

  console.log('📊 Google Analytics initialized');
};

/**
 * ページビューを送信
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * カスタムイベントを送信
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('event', eventName, params);
};

/**
 * よく使うイベント
 */
export const analytics = {
  // 質問関連
  questionPosted: (category: string) => trackEvent('question_posted', { category }),
  questionViewed: (questionId: string) => trackEvent('question_viewed', { question_id: questionId }),
  
  // 回答関連
  answerPosted: (questionId: string) => trackEvent('answer_posted', { question_id: questionId }),
  bestAnswerSelected: (questionId: string) => trackEvent('best_answer_selected', { question_id: questionId }),
  
  // エンゲージメント
  questionLiked: (questionId: string) => trackEvent('question_liked', { question_id: questionId }),
  gratitudeGiven: (answerId: string) => trackEvent('gratitude_given', { answer_id: answerId }),
  
  // 認証
  userSignedUp: () => trackEvent('sign_up'),
  userLoggedIn: () => trackEvent('login'),
  userLoggedOut: () => trackEvent('logout'),
  
  // 検索
  searchPerformed: (query: string, resultCount: number) => 
    trackEvent('search', { search_term: query, result_count: resultCount }),
};

export default analytics;

