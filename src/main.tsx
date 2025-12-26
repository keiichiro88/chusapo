import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './contexts/ToastContext';
import { initSentry, captureError } from './lib/sentry';
import { initAnalytics } from './lib/analytics';

function runAfterIdle(task: () => void, timeoutMs: number = 2000) {
  // 本番のみ。開発では即時性/デバッグ優先。
  if (!import.meta.env.PROD) return;
  try {
    const win = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
    };
    if (typeof win.requestIdleCallback === 'function') {
      win.requestIdleCallback(task, { timeout: timeoutMs });
    } else {
      window.setTimeout(task, timeoutMs);
    }
  } catch {
    // no-op
  }
}

// エラーバウンダリーコンポーネント
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    if (import.meta.env.DEV) {
      console.error('React Error Boundary caught an error:', error, errorInfo);
    }
    // Sentry にエラーを送信
    captureError(error, { componentStack: errorInfo?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: '#f3f4f6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
          <h1 style={{ fontSize: '24px', color: '#374151', marginBottom: '16px' }}>チューサポ</h1>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>アプリの読み込み中にエラーが発生しました</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            再読み込み
          </button>
          {import.meta.env.DEV && (
            <pre style={{ 
              marginTop: '20px', 
              padding: '10px', 
              background: '#fee2e2', 
              borderRadius: '4px', 
              fontSize: '12px',
              maxWidth: '90vw',
              overflow: 'auto'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// 安全な初期化
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </StrictMode>
  );

  // Sentry（本番のみ）：初期表示後に遅延初期化
  runAfterIdle(() => {
    void initSentry();
  }, 2000);

  // Analytics（本番のみ）：初期表示後に初期化（スクリプト挿入は非同期）
  runAfterIdle(() => {
    initAnalytics();
  }, 1200);
} catch (error) {
  // 本番ではSentryへ送って、consoleへの詳細出力は抑制
  captureError(error, { phase: 'bootstrap' });
  if (import.meta.env.DEV) {
    console.error('Failed to initialize React app:', error);
  }
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // innerHTML で例外文字列を差し込むと、万一のXSSリスクになるため DOM を安全に組み立てる
    rootElement.replaceChildren();

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.height = '100vh';
    wrapper.style.background = '#f3f4f6';

    const card = document.createElement('div');
    card.style.textAlign = 'center';
    card.style.padding = '20px';

    const icon = document.createElement('div');
    icon.style.fontSize = '48px';
    icon.style.marginBottom = '16px';
    icon.textContent = '⚠️';

    const title = document.createElement('h1');
    title.style.fontSize = '24px';
    title.style.color = '#374151';
    title.style.marginBottom = '16px';
    title.textContent = '初期化エラー';

    const message = document.createElement('p');
    message.style.color = '#6b7280';
    message.style.marginBottom = '16px';
    message.textContent = 'アプリの初期化に失敗しました';

    const button = document.createElement('button');
    button.style.background = '#3b82f6';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '12px 24px';
    button.style.borderRadius = '8px';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';
    button.textContent = '再読み込み';
    button.addEventListener('click', () => window.location.reload());


    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(message);
    card.appendChild(button);
    if (import.meta.env.DEV) {
      const pre = document.createElement('pre');
      pre.style.marginTop = '20px';
      pre.style.padding = '10px';
      pre.style.background = '#fee2e2';
      pre.style.borderRadius = '4px';
      pre.style.fontSize = '12px';
      pre.style.maxWidth = '90vw';
      pre.style.overflow = 'auto';
      pre.textContent = String(error);
      card.appendChild(pre);
    }

    wrapper.appendChild(card);
    rootElement.appendChild(wrapper);
  }
}
