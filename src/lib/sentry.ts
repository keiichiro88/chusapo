type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

type SentryModule = typeof import('@sentry/react');

let cachedModule: SentryModule | null = null;
let initPromise: Promise<SentryModule | null> | null = null;

function shouldEnableSentry(): boolean {
  return Boolean(import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN);
}

async function ensureSentryInitialized(): Promise<SentryModule | null> {
  if (!shouldEnableSentry()) return null;
  if (cachedModule) return cachedModule;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const Sentry = await import('@sentry/react');
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
    cachedModule = Sentry;
    return Sentry;
  })().catch((e) => {
    // 初期化に失敗した場合はリトライ可能にする
    initPromise = null;
    cachedModule = null;
    if (import.meta.env.DEV) {
      console.warn('Sentry init failed (dev):', e);
    }
    return null;
  });

  return initPromise;
}

/**
 * Sentry エラー監視の初期化（本番のみ）
 * ※重いので main.tsx 側で「初期表示後/idle時」に呼び出す想定
 */
export const initSentry = async (): Promise<void> => {
  await ensureSentryInitialized();
};

/**
 * エラーを手動でキャプチャ
 */
export const captureError = (error: unknown, context?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    void ensureSentryInitialized().then((Sentry) => {
      if (!Sentry) return;
      Sentry.captureException(error, { extra: context });
    });
  } else {
    console.error('Error captured:', error, context);
  }
};

/**
 * メッセージを送信
 */
export const captureMessage = (message: string, level: SeverityLevel = 'info') => {
  if (import.meta.env.PROD) {
    void ensureSentryInitialized().then((Sentry) => {
      if (!Sentry) return;
      Sentry.captureMessage(message, level);
    });
  } else {
    console.log(`[${level}] ${message}`);
  }
};

