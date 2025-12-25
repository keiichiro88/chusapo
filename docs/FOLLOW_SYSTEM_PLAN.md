## フォロー / フォロワー機能 実装計画（Supabase + React）

### 目的
注射・採血・静脈ルート確保（穿刺）に特化したSNSとして、Instagramに近い **フォロー/フォロワー機能** を提供し、ユーザー間のつながりと発見性を高める。

---

## 前提（確定）
- **未ログイン**: フォロワー/フォロー中の**一覧は閲覧不可**
- **ログイン**: フォロー/解除、一覧閲覧が可能（Instagram同様）
- **フォロー通知**: **最初から導入**
- **カウント方式**: **A（`profiles`に `followers_count / following_count` を保持しトリガー更新）**
- **公開設定**: 各ユーザーが「フォロワー一覧/フォロー中一覧」を **公開/非公開** 選択できる

---

## MVP（最小で成立する機能）
- **フォロー / フォロー解除**
- **フォロワー数 / フォロー中数** の表示（プロフィール上）
- **フォロワー一覧 / フォロー中一覧**（ログイン必須 + 公開設定に従う）
- **フォロー通知**（通知一覧に表示）
- **公開設定（プライバシー）**（プロフィール編集から変更可能）

---

## UX仕様（画面の挙動）

### プロフィール画面
- **自分のプロフィール**
  - フォローボタンは表示しない
  - 一覧は常に閲覧可能
- **他人のプロフィール（ログイン中）**
  - 「フォローする / フォロー中（解除）」ボタンを表示
  - フォロワー/フォロー中の押下:
    - 公開なら一覧を表示
    - 非公開なら「非公開」表示（一覧は開けない）
- **未ログイン**
  - フォロー/解除できない
  - 一覧は開けない（ログイン誘導）

### 一覧画面（Followers / Following）
- 表示内容: アイコン、名前、職種/専門等（プロフィールカード）
- 取得はページング（limit + cursor/offset）対応
- 一覧内でフォロー/解除は任意（後回しでも可）

---

## 公開設定（プライバシー）
プロフィール編集に以下のトグルを追加する（柔軟性優先）。
- **フォロワー一覧を公開**: `is_followers_list_public`（default: true）
- **フォロー中一覧を公開**: `is_following_list_public`（default: true）

非公開時のUI方針（案）
- カウントは表示しつつ、一覧は「非公開」でブロック（Instagram寄り）
- またはカウントも「非公開」表示（※最終決定事項）

---

## DB設計（Supabase / Postgres）

### 1) `follows` テーブル（新規）
- **カラム**
  - `follower_id` UUID（フォローする側）
  - `following_id` UUID（フォローされる側）
  - `created_at` timestamptz
- **制約**
  - 重複禁止: `(follower_id, following_id)` UNIQUE
  - 自己フォロー禁止: `follower_id != following_id`
- **インデックス**
  - `follower_id`
  - `following_id`
  - （任意）`created_at`

### 2) `profiles` 追加カラム（方式A）
- `followers_count` integer default 0
- `following_count` integer default 0
- `is_followers_list_public` boolean default true
- `is_following_list_public` boolean default true
- **改ざん防止**: `followers_count / following_count` は authenticated に対して INSERT/UPDATE を REVOKE（既存の列権限方針と同様）

### 3) `notifications` 拡張（follow通知）
既存の `notifications.type` に **`follow`** を追加する（CHECK制約の更新）。
- 受信者: フォローされた側（`user_id = following_id`）
- 発信者: フォローした側（`from_user_id = follower_id`）
- `title/message/link` は「〇〇さんにフォローされました」＋プロフィールへ遷移

---

## 自動処理（トリガー）

### `follows` INSERT
- `profiles.followers_count`（following側）を +1
- `profiles.following_count`（follower側）を +1
- `notifications` に follow 通知を INSERT（トリガー内）

### `follows` DELETE
- 上記を -1（0未満にならないようガード）

### カウントの再計算（バックフィル）
運用上の安全策として、既存データがある場合に `follows` から集計して `profiles` のカウントを再計算できるSQLを用意する。

---

## セキュリティ（RLS方針）

### `follows`（ログイン必須）
- **SELECT**: authenticated のみ
  - かつ以下のいずれかを満たす行のみ見える
    - 自分が関与する（`follower_id = auth.uid()` または `following_id = auth.uid()`）
    - 「フォロワー一覧公開」ON のユーザーの followers 行（`following_id = target` 側を参照して判定）
    - 「フォロー中一覧公開」ON のユーザーの following 行（`follower_id = target` 側を参照して判定）
- **INSERT**: authenticated のみ
  - `follower_id = auth.uid()` を必須
- **DELETE**: authenticated のみ
  - `follower_id = auth.uid()` の行のみ削除可

### `notifications`
既存実装に合わせ、INSERTは **トリガーまたは service_role のみ** を許可する方針で統一する。

---

## フロント実装（React）

### 新規フック（例: `useFollows`）
- `isFollowing(targetUserId)`（自分→相手のフォロー状態）
- `follow(targetUserId)` / `unfollow(targetUserId)`
  - 楽観更新（即時UI反映）＋失敗時ロールバック
  - 連打防止（loading/disabled）
- `getFollowCounts(userId)`（`profiles.followers_count / following_count`）
- `fetchFollowers(userId, paging)` / `fetchFollowing(userId, paging)`
  - RLSで非公開/未ログインは拒否されるため、UIは「非公開/ログインしてください」を表示

### `UserProfile`（プロフィール画面）
- 既存の **ダミー統計（followers/following）** を削除し、実データに置換
- 他人プロフィールにフォローボタンを追加
- フォロワー/フォロー中押下で一覧へ（モーダル or 画面）

### 通知
- `useNotifications.ts` の `Notification['type']` に `follow` を追加
- `NotificationList.tsx` のアイコン/文言を `follow` に対応
- 通知クリックでプロフィールへ遷移（`link` にプロフィール導線を入れる）

### プロフィール編集
- 公開設定トグルを追加し、Supabase `profiles` に保存

---

## マイグレーション計画（supabase/migrations）
1. `follows` テーブル作成 + RLS + index
2. `profiles` に followers_count / following_count / 公開設定カラム追加 + 列権限REVOKE
3. `notifications` の type に follow を追加 + follow通知トリガー追加
4. （任意）バックフィルSQL（既存データのカウント再計算）

---

## テスト観点（最小）
- 重複フォロー不可（ユニーク制約）
- 自己フォロー不可（チェック制約）
- follow → カウント+1 / unfollow → カウント-1（0未満にならない）
- 未ログインで一覧が取れない（RLS + UI）
- 非公開設定ON/OFFで一覧表示が切り替わる（自分は常に見える）
- follow通知が届く、既読・削除が既存機構で動作する

---

## 最終決定が必要な点（1つ）
- **非公開設定のときでも「フォロワー数/フォロー中数」を表示するか**
  - Instagram寄り: **カウントは表示 / 一覧だけ非公開**
  - 強い秘匿: **カウントも非表示**


