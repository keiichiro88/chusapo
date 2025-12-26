import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

// ローカル開発（Vite）でも /api/* が404にならないように、Vercel Functions相当のハンドラをミドルウェアとしてマウントする
import mbtiAdviceHandler from './api/nurse-tools/mbti-advice';
import mbtiStatsHandler from './api/nurse-tools/mbti-stats';
import trackClickHandler from './api/nurse-tools/track-click';
import mbtiQuotaHandler from './api/nurse-tools/mbti-quota';

type RequestLike = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
};

async function readBody(req: IncomingMessage): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk) => chunks.push(chunk as Uint8Array));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function createResponseLike(res: ServerResponse): ResponseLike {
  const responseLike: ResponseLike = {
    setHeader: (name, value) => {
      res.setHeader(name, value);
    },
    status: (code) => {
      res.statusCode = code;
      return responseLike;
    },
    json: (body) => {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(body));
    },
  };
  return responseLike;
}

function nurseToolsApiPlugin(): Plugin {
  return {
    name: 'nurse-tools-api',
    configureServer(server) {
      const mount = (path: string, handler: (req: RequestLike, res: ResponseLike) => Promise<void> | void) => {
        server.middlewares.use(path, async (req, res) => {
          try {
            const body = await readBody(req);
            const requestLike: RequestLike = {
              method: req.method,
              headers: req.headers as Record<string, string | string[] | undefined>,
              body,
            };
            await handler(requestLike, createResponseLike(res));
          } catch (error) {
            console.error(`[vite] API error: ${path}`, error);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
        });
      };

      mount('/api/nurse-tools/mbti-advice', mbtiAdviceHandler);
      mount('/api/nurse-tools/mbti-quota', mbtiQuotaHandler);
      mount('/api/nurse-tools/mbti-stats', mbtiStatsHandler);
      mount('/api/nurse-tools/track-click', trackClickHandler);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // ローカル開発用に .env を process.env へ取り込む（VITE_以外も含める）
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [react(), nurseToolsApiPlugin()],
    build: {
      rollupOptions: {
        output: {
          // 初回ロードを軽くするため、重い依存はある程度vendor chunkに分離してブラウザキャッシュを効かせる
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('/node_modules/@supabase/supabase-js/')) {
              return 'supabase-vendor';
            }
            if (id.includes('/node_modules/@sentry/')) {
              return 'sentry-vendor';
            }
            if (id.includes('/node_modules/lucide-react/')) {
              return 'icons-vendor';
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
