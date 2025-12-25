## ナースキャリア診断AI（MBTI）機能仕様まとめ

### 1. 概要（この機能でできること）
ナースキャリア診断AIは、MBTI（性格傾向）診断の結果をもとに、看護師向けに以下を提供する機能です。

- **MBTI診断（質問回答→タイプ算出）**
- **AIキャリアアドバイス（Gemini）**
  - キャリアの活かし方
  - ストレス対策
  - チームでの立ち回り
  -（任意）転職サイトのパーソナライズ推薦
- **結果の保存（履歴）**
- **シェア（X/LINE）**
- **画像保存・PDF出力**

---

### 2. ユーザー体験（画面フロー）

#### 2.1 入口（導線）
- サイドバーの **「キャリア診断AI」**
- ホームのショートカット（追加済み）

#### 2.2 診断フロー
1. **Welcome**：説明・開始
2. **Quiz**：Likertスケールで回答（選択式）
3. **Calculating**：タイプ算出
4. **Result**：結果表示
   - タイプ表示・強み/働き方
   - スコア（レーダーチャート）
   - AIキャリアアドバイス
   - 推薦（静的/AIパーソナライズ）
   - 画像保存 / PDF出力 / シェア
   - 履歴閲覧・削除

---

### 3. ログイン要否と利用制限（重要）

#### 3.1 ログイン要否
- **診断（MBTI算出）自体**：実行可能
- **AIキャリアアドバイス（Gemini）**：**ログイン必須**
  - 未ログインの場合、AI欄は**固定文**を表示

#### 3.2 1日あたり利用回数
- **1ユーザーあたり 1日3回まで**
- 超過時は **429** を返し、UI側は「本日の上限に達しました」を表示します

#### 3.3 残回数表示（本日あと◯回）
- 結果画面の **「AIキャリアアドバイス」** 見出し右側にバッジ表示
  - 例：**本日あと2回**
  - 未ログイン：**ログインで利用可（1日3回）**

---

### 4. セキュリティ設計（Geminiキー保護）

#### 4.1 APIキーはブラウザに露出させない
- Geminiのキーは **サーバー側の環境変数 `GEMINI_API_KEY`** のみで扱います
- フロント（Vite）で `VITE_` を付けて扱う方式は **NG**（ブラウザから漏洩するため）

#### 4.2 認証トークンでAPIを保護
- フロント→APIへ `Authorization: Bearer <access_token>` を付与
- API側で `supabase.auth.getUser()` によりトークン検証を行います

---

### 5. 実装構成（主要ファイル）

#### 5.1 フロントエンド
- `components/nurse-tools/mbti-career-diagnosis-page.tsx`
  - 診断ロジック、AI取得、履歴管理、状態遷移
- `components/nurse-tools/mbti-result-section.tsx`
  - 結果UI、AIアドバイス表示、残回数バッジ、シェア/保存/PDF
- `components/nurse-tools/mbti-radar-chart.tsx` など
  - スコア可視化、付随UI

#### 5.2 API（Vercel Functions）
- `api/nurse-tools/mbti-advice.ts`
  - Gemini呼び出し（ログイン必須 + 1日3回消費）
  - **Markdown記法禁止**（プロンプト + サニタイズで `**` を除去）
- `api/nurse-tools/mbti-quota.ts`
  - 残回数取得（消費しない）
- `api/nurse-tools/mbti-stats.ts`
  - 統計用（現状は「壊さないための成功レスポンス」）
- `api/nurse-tools/track-click.ts`
  - クリック計測用（現状は「壊さないための成功レスポンス」）

#### 5.3 ローカル開発用（Viteで /api を動かす）
Viteのdevサーバーは通常 `/api/*` を持たないため、`vite.config.ts` でAPIハンドラをミドルウェアとしてマウントしています。

- `vite.config.ts`
  - `mount('/api/nurse-tools/mbti-advice', ...)`
  - `mount('/api/nurse-tools/mbti-quota', ...)`
  - など

---

### 6. データ（LocalStorage）
診断結果と履歴はブラウザに保存します（現状はLocalStorage）。

- `mbti-diagnosis-result`：直近の診断結果
- `mbti-diagnosis-history`：履歴（最大10件）
- `mbti-diagnosis-session`：匿名集計用のセッションID（任意）

※将来的にSupabaseへ履歴保存する拡張も可能です。

---

### 7. DB（Supabase）: 日次3回制限の仕組み

#### 7.1 テーブル
- `public.mbti_ai_usage`
  - `user_id`, `usage_date`, `count` を **(user_id, usage_date) で一意**

#### 7.2 RPC（原子性のある回数消費）
- `public.consume_mbti_ai_quota(p_user_id uuid)`
  - その日の行を `FOR UPDATE` でロックして、同時リクエストでも超過しない

#### 7.3 RPC（残回数の参照：消費しない）
- `public.get_mbti_ai_quota(p_user_id uuid)`

#### 7.4 適用が必要なマイグレーション（Supabase SQL Editor）
- `supabase/migrations/20251225_mbti_ai_daily_limit.sql`
- `supabase/migrations/20251225_mbti_ai_quota_peek.sql`

---

### 8. 環境変数（Vercel）
Vercelの Project Settings → Environment Variables に設定します。

- `VITE_SUPABASE_URL`（必須）
- `VITE_SUPABASE_ANON_KEY`（必須）
- `GEMINI_API_KEY`（AI機能を使う場合は必須・**VITE_は付けない**）

---

### 9. API仕様（要点）

#### 9.1 AIアドバイス取得
- `POST /api/nurse-tools/mbti-advice`
- Header: `Authorization: Bearer <token>`（必須）
- Body:
  - `mbtiType: string`
  - `personalityData: PersonalityResult`
  - `sessionId?: string`
- Response:
  - `AIAdvice`（JSON）
  - Header: `X-RateLimit-Remaining`

#### 9.2 残回数取得（消費しない）
- `GET /api/nurse-tools/mbti-quota`
- Header: `Authorization: Bearer <token>`（必須）
- Response:
  - `{ remaining, used, dailyLimit }`
  - Header: `X-RateLimit-Remaining`

---

### 10. 注意事項（免責/安全）
- 本機能は**医療行為の指示**ではなく、キャリアや学習支援のための情報提供です
- 個人情報・施設情報・患者特定につながる情報は投稿しない（別機能の投稿フォーム側でも注意喚起）

---

### 11. 今後の改善候補（拡張案）
- 統計（`mbti-stats` / `track-click`）をSupabaseへ保存して分析可能にする
- AI結果をDBにキャッシュして、同一ユーザー・同一タイプの再取得を高速化/コスト最適化
- プロンプトをタイプ別に最適化し、文字数・構造をさらに安定化


