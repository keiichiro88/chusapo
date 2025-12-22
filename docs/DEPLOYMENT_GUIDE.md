# チューサポ 本番デプロイガイド

このドキュメントでは、チューサポを本番環境にデプロイするための手順を説明します。

## 目次

1. [Vercel デプロイ](#1-vercel-デプロイ)
2. [環境変数の設定](#2-環境変数の設定)
3. [Supabase メール認証設定](#3-supabase-メール認証設定)
4. [Supabase Storage 設定](#4-supabase-storage-設定)
5. [通知機能の有効化](#5-通知機能の有効化)
6. [Sentry エラー監視](#6-sentry-エラー監視)
7. [Google Analytics](#7-google-analytics)
8. [独自ドメイン設定](#8-独自ドメイン設定)

---

## 1. Vercel デプロイ

### 手順

1. **GitHub リポジトリを Vercel に接続**
   - [Vercel](https://vercel.com/) にログイン
   - 「Add New Project」をクリック
   - GitHub リポジトリ（MedConsult）を選択

2. **ビルド設定**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **デプロイ実行**
   - 「Deploy」をクリック
   - 数分でデプロイ完了

### 自動デプロイ

- `main` ブランチへの push で自動デプロイ
- プレビューデプロイ（PR作成時）も自動

---

## 2. 環境変数の設定

Vercel の Project Settings → Environment Variables で以下を設定：

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase プロジェクト URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | ✅ |
| `VITE_SENTRY_DSN` | Sentry DSN | 推奨 |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID | 推奨 |

### 設定例

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 3. Supabase メール認証設定

### 3.1 メールテンプレートのカスタマイズ

Supabase Dashboard → Authentication → Email Templates

#### Confirm signup（新規登録確認）

```html
<h2>チューサポへようこそ！</h2>
<p>アカウント登録ありがとうございます。</p>
<p>以下のリンクをクリックしてメールアドレスを確認してください：</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認する</a></p>
<p>このリンクは24時間有効です。</p>
<hr>
<p>チューサポ - 穿刺技術サポートプラットフォーム</p>
```

#### Reset password（パスワードリセット）

```html
<h2>パスワードリセット</h2>
<p>パスワードリセットのリクエストを受け付けました。</p>
<p>以下のリンクからパスワードを再設定してください：</p>
<p><a href="{{ .ConfirmationURL }}">パスワードを再設定する</a></p>
<p>このリンクは1時間有効です。</p>
<p>このリクエストに心当たりがない場合は、このメールを無視してください。</p>
<hr>
<p>チューサポ - 穿刺技術サポートプラットフォーム</p>
```

### 3.2 メール送信設定（SMTP）

#### 本番環境では専用SMTPを推奨

Supabase Dashboard → Settings → Auth → SMTP Settings

**おすすめの SMTP サービス:**

1. **SendGrid**（無料枠: 100通/日）
   - https://sendgrid.com/

2. **Resend**（無料枠: 3,000通/月）
   - https://resend.com/

3. **Amazon SES**（低コスト）
   - https://aws.amazon.com/ses/

#### SMTP 設定例（SendGrid）

```
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: SG.xxxxx（API Key）
Sender email: noreply@your-domain.com
Sender name: チューサポ
```

### 3.3 リダイレクト URL の設定

Supabase Dashboard → Authentication → URL Configuration

```
Site URL: https://your-domain.vercel.app
Redirect URLs: 
  - https://your-domain.vercel.app
  - http://localhost:3002 (開発用)
```

---

## 4. Supabase Storage 設定

プロフィール画像用のストレージバケットを作成します。

### 4.1 バケット作成

Supabase Dashboard → Storage → Create a new bucket

- **Name**: `avatars`
- **Public bucket**: ✅ ON
- **File size limit**: 5MB

### 4.2 RLS ポリシー

SQL Editor で以下を実行：

```sql
-- アバターバケットのポリシー

-- 誰でも閲覧可能
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ログインユーザーは自分のフォルダにアップロード可能
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ログインユーザーは自分の画像を削除可能
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ログインユーザーは自分の画像を更新可能
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 5. 通知機能の有効化

### 5.1 通知テーブルの作成

`supabase/schema.sql` の通知関連SQLを Supabase SQL Editor で実行してください。

### 5.2 リアルタイム通知の有効化

Supabase Dashboard → Database → Replication

`notifications` テーブルのリアルタイム機能を有効化：

1. 「Tables」タブを開く
2. `notifications` テーブルを見つける
3. 「Realtime」トグルを ON にする

---

## 6. Sentry エラー監視

### 6.1 Sentry プロジェクト作成

1. [Sentry](https://sentry.io/) にアカウント作成
2. 新規プロジェクト作成（Platform: React）
3. DSN を取得

### 6.2 環境変数設定

Vercel で以下を設定：

```
VITE_SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/xxxxx
```

### 6.3 アラート設定（推奨）

Sentry Dashboard → Alerts → Create Alert Rule

- **エラー発生時**: Slack/Email 通知
- **パフォーマンス低下時**: 通知

---

## 7. Google Analytics

### 7.1 GA4 プロパティ作成

1. [Google Analytics](https://analytics.google.com/) にログイン
2. 新規プロパティ作成
3. データストリーム作成（Web）
4. 測定 ID（G-XXXXXXXXXX）を取得

### 7.2 環境変数設定

Vercel で以下を設定：

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 7.3 追跡されるイベント

アプリは以下のイベントを自動追跡：

| イベント名 | 説明 |
|-----------|------|
| `page_view` | ページビュー |
| `sign_up` | 新規登録 |
| `login` | ログイン |
| `question_posted` | 質問投稿 |
| `answer_posted` | 回答投稿 |
| `question_liked` | いいね |
| `gratitude_given` | 感謝 |
| `best_answer_selected` | ベストアンサー選択 |
| `search` | 検索実行 |

---

## 8. 独自ドメイン設定

### 8.1 ドメイン取得

おすすめのドメインレジストラ：

- [お名前.com](https://www.onamae.com/)
- [Google Domains](https://domains.google/)
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)

### 8.2 Vercel でドメイン設定

1. Vercel Dashboard → Project → Settings → Domains
2. 「Add Domain」をクリック
3. ドメイン名を入力（例: `chusapo.jp`）
4. DNS レコードを設定

#### DNS 設定例

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 8.3 SSL 証明書

Vercel が自動的に Let's Encrypt の SSL 証明書を発行・更新します。

### 8.4 Supabase 設定更新

ドメイン設定後、Supabase の認証設定も更新：

1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL を新ドメインに変更
3. Redirect URLs に新ドメインを追加

---

## チェックリスト

デプロイ前の最終確認：

- [ ] Vercel にデプロイ完了
- [ ] 環境変数すべて設定済み
- [ ] Supabase メールテンプレート設定済み
- [ ] Supabase Storage バケット作成済み
- [ ] 通知テーブル作成 & リアルタイム有効化
- [ ] Sentry DSN 設定済み
- [ ] Google Analytics ID 設定済み
- [ ] 独自ドメイン設定済み（オプション）
- [ ] 本番環境でログイン/登録テスト完了
- [ ] 本番環境で質問投稿テスト完了

---

## トラブルシューティング

### よくある問題

**Q: ログインしてもすぐログアウトされる**

A: Supabase の Site URL と Redirect URLs が正しく設定されているか確認

**Q: メールが届かない**

A: SMTP 設定を確認。開発中は Supabase のデフォルト（1日3通制限）

**Q: 画像アップロードが失敗する**

A: Storage バケットの RLS ポリシーを確認

**Q: 通知が来ない**

A: `notifications` テーブルの Realtime 設定を確認

---

## サポート

問題が解決しない場合：

- Supabase: [Discord Community](https://discord.supabase.com/)
- Vercel: [Documentation](https://vercel.com/docs)
- Sentry: [Documentation](https://docs.sentry.io/)

