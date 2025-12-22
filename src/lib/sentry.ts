import * as Sentry from '@sentry/react';

/**
 * Sentry エラー監視の初期化
 * 本番環境でのみ有効化
 */
export const initSentry = () => {
  // 本番環境でのみ初期化
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // セッションリプレイの設定
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // パフォーマンス監視: 本番では10%のトランザクションをサンプリング
      tracesSampleRate: 0.1,
      // セッションリプレイ: エラー発生時は100%、通常は10%
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // 環境名
      environment: import.meta.env.MODE,
    });

    console.log('🔍 Sentry initialized');
  }
};

/**
 * エラーを手動でキャプチャ
 */
export const captureError = (error: Error, context?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error captured:', error, context);
  }
};

/**
 * メッセージを送信
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level}] ${message}`);
  }
};

export default Sentry;

