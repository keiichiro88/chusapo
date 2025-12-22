## チューサポ（MedConsult / Web版）徹底解説ドキュメント

このMDは、**現在のチューサポ（Web: Vite + React + TypeScript + Tailwind + Supabase）**の実装を、初見の開発者でも追えるように「目的 → 画面 → アーキテクチャ → データモデル → 認証/DB → 主要フロー → 運用/トラブルシュート」まで通しで解説します。  
（※同リポジトリ内に `chusapo-app/` というExpoプロジェクトもありますが、**本書はルート直下のWeb版**を対象とします）

---

### 0. TL;DR（このソフトの要点）

- **チューサポ**は、穿刺（注射/採血/ルート確保/動脈穿刺）に特化した医療従事者向けQ&Aプラットフォーム
- **未ログイン時**: LocalStorage上のデモデータで「すぐ触れる」体験を提供  
- **ログイン時**: Supabase（Auth + PostgreSQL + RLS）で**本番データ**を永続化
- 重要な設計思想は **「データソースの差し替えを `useDataProvider` で吸収する」**こと

---

### 1. 何を解決するソフトか（プロダクトの文脈）

医療現場では、穿刺に関して以下が起こりがちです。

- **相談機会の不足**（忙しい/聞きにくい）
- **暗黙知の属人化**（「コツ」が個人に閉じる）
- **失敗例の共有不足**（安全性にも直結）

チューサポは、これらを「質問 → 回答 → 実践後の感謝」という循環で解消し、現場で本当に役立つ知見が蓄積されるコミュニティを目指しています。

---

### 2. 技術スタック（現行）

- **フロント**: React 18 + TypeScript + Vite
- **スタイル**: Tailwind CSS（+ `src/styles/designSystem.ts` にデザイン定数）
- **アイコン**: `lucide-react`
- **バックエンド**: Supabase
  - Auth（Email/Password）
  - PostgreSQL（RLS + Trigger）
- **データの互換**: 未ログイン時は LocalStorage（デモデータ）

---

### 3. リポジトリ構成（どこに何があるか）

Web版の主要ディレクトリは以下です。

- **`src/main.tsx`**: React起動点（`SupabaseAuthProvider` で全体ラップ）
- **`src/App.tsx`**: 画面全体（ホーム/質問詳細/投稿/プロフィール等の切り替え）
- **`src/contexts/SupabaseAuthContext.tsx`**: Supabase認証状態の一元管理（Context）
- **`src/hooks/useDataProvider.ts`**: **Supabase/LocalStorageの切替を吸収する中核**
- **`src/hooks/useSupabaseQuestions.ts` / `useSupabaseAnswers.ts`**: Supabase CRUD
- **`src/hooks/useQuestions.ts` / `useAnswers.ts`**: LocalStorageデモCRUD（初期デモデータ含む）
- **`src/lib/supabase.ts`**: Supabaseクライアント初期化（`.env`必須）
- **`supabase/schema.sql`**: DBスキーマ（RLS/Trigger/Index含む）

補足:

- **`chusapo-app/`**: 旧/別系統（Expo + Firebase想定）のプロジェクトが残っています。  
  現在運用しているWeb版とは別物なので、混乱防止のため「Web版の改修」は基本 `src/` を見てください。

---

### 4. 起動方法（開発・ビルド・配布）

#### 4.1 必須: 環境変数（Supabase）

`src/lib/supabase.ts` が `.env` を参照してクライアントを作成します。未設定の場合、起動時に例外で止まります。

`.env`（例）:

```bash
VITE_SUPABASE_URL="https://xxxxx.supabase.co"
VITE_SUPABASE_ANON_KEY="xxxxx"
```

#### 4.2 開発起動（Vite）

```bash
npm install
npm run dev
```

- `vite.config.ts` では `port: 3000` を指定していますが、埋まっている場合は **3001 → 3002…** と自動で空きポートを探します。
- スマホ実機で確認する場合、ターミナルの `Network:` に出るURL（例: `http://192.168.x.x:3002/`）にアクセスします。

#### 4.3 本番ビルド

```bash
npm run build
```

出力は `dist/`。静的ホスティング（Vercel/Netlify/Supabase Hosting等）に載せられます。

#### 4.4 `dist/` をローカルで配信（Express）

`dev-server.cjs` は `dist/` を静的配信する簡易サーバです（デフォルト `3001`）。

```bash
node dev-server.cjs
```

---

### 5. 画面構成（ユーザーが見る世界）

Web版は大きく以下の体験で構成されています。

- **ホーム**
  - ヒーロー（「穿刺の相談所」）＋ CTA（質問投稿）
  - 質問一覧（検索/カテゴリーフィルタ）
  - 右カラム: カテゴリーカード、クイックアクション、ランキング枠
- **質問詳細（モーダル）**
  - 質問本文・いいね
  - 回答一覧
  - 回答投稿・ベストアンサー
- **質問投稿（モーダル）**
  - 下書き自動保存（LocalStorage）
  - iOS対策込みのスクロールロック
- **プロフィール**
  - ユーザーの実績/統計表示（現状はLocalStorageユーザーの要素も残存）
- **ガイドライン / チューサポについて**

---

### 6. アーキテクチャ（重要な設計）

#### 6.1 認証状態をアプリ全体で「1つ」にする

- `src/contexts/SupabaseAuthContext.tsx` が **Supabase Authの状態（session/user）を一元管理**
- `src/main.tsx` で `<SupabaseAuthProvider>` が `<App />` をラップ
- これにより、どこで `useSupabaseAuth()` を呼んでも **同じ認証状態**を参照できます

> 背景: 複数箇所で個別に `onAuthStateChange` を購読すると、状態が分裂し「ログイン中…で固まる」等が起きがちです。  
> 現在はContext化により多重購読を回避しています。

#### 6.2 データソース切替（Supabase/LocalStorage）を `useDataProvider` で吸収

`src/hooks/useDataProvider.ts` が、このアプリの “背骨” です。

- `isAuthenticated` を見て **Supabase or LocalStorage** を選択
- 呼び出し側（UI）は、**どちらのデータソースかを意識せず**に `questions / addQuestion / addAnswer ...` を使える

UI側のメリット:

- 未ログインでも体験できる（デモデータ）
- ログイン後は自動で本番データに切り替わる
- 既存UIを大きく壊さずバックエンドを差し替えできる

---

### 7. データモデル（フロント型とDBの対応）

#### 7.1 フロント（`src/types/index.ts`）

- `Question`: `id/title/content/author/authorRole/...`
- `Answer`: `questionId/content/author/.../gratitude/isAccepted`
- `User`: LocalStorage側のユーザー（デモ用要素が残存）

#### 7.2 Supabase（`supabase/schema.sql`）

主テーブル:

- `profiles`（Authユーザーのプロフィール）
- `questions`
- `answers`
- `question_likes`（質問へのいいね）
- `answer_gratitudes`（回答への感謝）

カウント系は **Triggerで自動更新**します。

- `questions.likes_count` ← `question_likes` のINSERT/DELETE
- `questions.answers_count` ← `answers` のINSERT/DELETE
- `answers.gratitude_count` ← `answer_gratitudes` のINSERT/DELETE
- `profiles.total_gratitude` ← `answer_gratitudes` のINSERT/DELETE（to_user_idを加算）

---

### 8. 認証（Supabase Auth）のフロー

#### 8.1 サインアップ（Email/Password）

1. `useSupabaseAuth().signUp(email, password, name)`
2. Supabase Authにユーザー作成
3. `schema.sql` のトリガー `handle_new_user` により `profiles` が自動生成

#### 8.2 サインイン

1. `useSupabaseAuth().signIn(email, password)`
2. `session` / `supabaseUser` を即時反映（UI固まり回避のため）
3. `profiles` を取得し `appUser`（画面表示用）を構築
   - 取得できない場合もフォールバックで表示名を作る（UX優先）

#### 8.3 セッション自動復元

Supabase clientで `persistSession: true` のため、リロード後もセッションが復元されます。  
ユーザーが「リロードしたら自動でログインした」ように見えるのは正常動作です。

---

### 9. 質問機能（Supabase）

実装の中心:

- `src/hooks/useSupabaseQuestions.ts`

主な処理:

- **一覧取得**: `questions` を `profiles` JOIN付きで取得し、表示用に変換
- **投稿**: `questions.insert({ author_id: user.id, title, content, category })`
  - `category` はDB側で `CHECK` 制約あり（'注射'/'採血'/'ルート確保'/'動脈穿刺'/'その他'）
- **いいね**: `question_likes` を INSERT/DELETE（トグル）
  - いいね数はトリガーで更新されるが、UI体感のためローカル状態も同時更新
- **削除**: `questions.delete()`（RLSで本人のみ）

---

### 10. 回答機能（Supabase）

実装の中心:

- `src/hooks/useSupabaseAnswers.ts`

主な処理:

- **質問別取得**: `answers` を `profiles` JOIN付きで取得（感謝数順）
- **投稿**: `answers.insert({ question_id, author_id, content })`
- **感謝**: `answer_gratitudes` を INSERT/DELETE（トグル）
  - 自分の回答には感謝不可（アプリ側でブロック）
  - 感謝数/プロフィール累計はトリガーで増減
- **ベストアンサー**:
  - `answers.is_accepted` を切り替え
  - `questions.has_accepted_answer = true` を更新

---

### 11. LocalStorage（デモモード）について

未ログイン体験のため、以下が残っています。

- `src/hooks/useQuestions.ts` / `useAnswers.ts`: デモデータ + LocalStorage永続化
- `src/hooks/useUser.ts`: デモユーザー選択（`UserSelector`）

注意:

- Supabaseログイン中でも、右上に「ユーザーを選択」UIが残ることがあります（デモユーザーが未選択のため）。  
  将来的には **Supabaseのprofilesを唯一のユーザー情報ソース**に統合するのが理想です。

---

### 12. UI/デザイン（現行）

#### 12.1 Tailwind + デザインシステム

- Tailwindをベースにしつつ、`src/styles/designSystem.ts` に
  - 角丸、余白、影、タイポ、ボタン、カードの “型” を定義

#### 12.2 フォント

- `index.html` で **Google Fonts: Noto Sans JP** を読み込み
- `tailwind.config.js` で `font-sans` を Noto Sans JP に設定  
  → 全体の日本語の見栄えが安定します

#### 12.3 ホバー演出

- 主要CTAに `hover:scale-105` + `hover:shadow-xl` を付け、触った感を強化しています

#### 12.4 Empty State（質問0件）

- 質問が0件のとき、寂しくならないよう「空状態カード」＋CTAを表示します

---

### 13. セキュリティ（RLSの考え方）

`schema.sql` でRLSを有効化しています。

- `SELECT` は基本的に公開（質問/回答/プロフィールは閲覧可能）
- `INSERT/UPDATE/DELETE` は **本人のみ**（`auth.uid()` と一致が必須）

重要:

- フロントで使うのは `anon` キー（公開前提）
- 管理系操作は **Service Role Key** が必要（フロントに置かない）

---

### 14. よくある詰まりポイント（トラブルシュート）

#### 14.1 「Supabase環境変数が設定されていません」

- `.env` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定してください

#### 14.2 質問投稿が400になる

- `category` がDB制約と一致しているか確認（日本語カテゴリ名）
- SupabaseのRLSで `author_id = auth.uid()` になっているか確認

#### 14.3 ログイン後に「ログイン中…」で固まる

- 認証購読の多重化が原因になりがち  
  → 現在は `SupabaseAuthContext` に統一済み

#### 14.4 `removeChild` 系のReactエラー

- モーダルを「二重に閉じる」などでアンマウント競合が起きると発生  
  → 現在はモーダルのClose責務を整理済み

---

### 15. 次の改善候補（おすすめ順）

- **ユーザー情報をSupabase `profiles` に完全統合**（`useUser` の役割整理）
- **通知/称号/ランキング**のSupabase化（現在はLocalStorage要素が残る）
- **検索**をDB側の全文検索（Postgres FTS）へ（データ増加に備える）
- **監査ログ/モデレーション**（医療領域の安全性）

---

### 16. デバッグ/デモモードについて

#### 16.1 デモユーザー切り替え機能

**表示条件**:
- 開発環境 (`import.meta.env.DEV` が true)
- かつ URL に `?demo-user` パラメータがある
- かつ データソースが `localStorage` の場合（未ログイン時）

**使用方法**:
```
http://localhost:3002/?demo-user
```

この機能は、LocalStorage に保存されたデモユーザー間で切り替えて、質問者/回答者の振る舞いをテストするためのものです。  
**Supabase 認証でログイン中は表示されません。**

#### 16.2 データソース表示バナー

開発環境では、現在のデータソース（Supabase / LocalStorage）を示すバナーが画面上部に表示されます。

- `🔗 Supabase（本番データ）`: ログイン中、Supabase から取得
- `💾 LocalStorage（デモデータ）`: 未ログイン時、ローカルのデモデータ

---

### 17. 関連ドキュメント

- `SOFTWARE_SPECIFICATION.md`: 仕様・要件（※一部LocalStorage前提の記述あり）
- `FEATURE_DOCUMENTATION.md`: 機能一覧（※古い記述を含む可能性あり）
- `DEVELOPMENT_STATUS.md`: 開発状況
- `supabase/schema.sql`: DBスキーマ（RLS/Trigger）
- `UX_IMPROVEMENT_ROADMAP.md`: UI/UX改善ロードマップ & TODOリスト


