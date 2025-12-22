# MedConsult Development Environment

## ローカルホスト接続問題について

### 🔍 **重要な発見：開発環境の使い分け**

**問題の詳細：**
- macOS Sequoia (15.5) 環境でのlocalhost接続問題
- Claude Code（CLI環境）からの直接アクセスに制限あり
- Cursorエージェント（統合環境）では正常にアクセス可能

**根本原因：**
- **実行環境の違い**: Cursor内蔵ターミナル vs システムレベルのbash
- **ネットワークスタック**: アプリケーション内処理 vs システムレベル処理
- **環境変数・PATH**: Cursor独自設定 vs システム標準設定

### 🎯 **確立された最適ワークフロー**

**Cursorで実行すべき作業：**
- ✅ `npm run dev` での開発サーバー起動
- ✅ ブラウザでの動作確認・テスト
- ✅ リアルタイム変更確認
- ✅ ホットリロード機能の活用

**Claude Code（CLI）で実行すべき作業：**
- ✅ コードの編集・修正
- ✅ ファイル構造の管理・分析
- ✅ 検索・グローバル変更
- ✅ Git操作・コミット管理
- ✅ アーキテクチャ設計・相談

### 🔄 **推奨開発フロー**
1. **Cursor**: 開発サーバー起動 (`npm run dev`)
2. **Claude Code**: コード修正・機能実装
3. **Cursor**: ブラウザでの変更確認
4. **User**: スクリーンショット共有で状況報告
5. **Claude Code**: 追加修正・改善
6. **繰り返し...**

**✅ この方式により、localhost問題を完全回避し、最高効率での開発が可能**

## 作業ファイル

### 1. React開発版（推奨）
- `src/` 配下の React コンポーネント
- `npm run dev` でローカル開発サーバー起動
- ホットリロード対応

### 2. working-app.html
- 完全なMedConsultアプリケーション（HTML版）
- 全ての機能とUIを含む
- React版との比較・検証用

### 3. simple-sidebar.html  
- サイドバーデモ版
- UI確認用

## 推奨開発フロー

1. **React開発**: `npm run dev` でローカルサーバー起動
2. **機能実装**: Reactコンポーネントを修正
3. **動作確認**: ブラウザでリアルタイム確認
4. **テスト**: 機能テストと動作検証

## 現在の状況

- React開発環境：構築済み、機能完備
- サイドバー：実装済み、デザインシステム追加済み
- UI改善：デザインシステム作成済み、適用待ち
- 機能：全て実装済み、テスト待ち

現在は working-app.html で全ての動作確認が可能です。

## 🔐 認証システムの方針（重要決定事項）

### 段階的認証アプローチ

**基本方針：**
- 初期は最小限の制限でユーザー獲得を優先
- 過度な身元確認は利用者離脱を招くため避ける
- 法的リスクは免責事項とモデレーションでカバー

### 3段階ユーザーシステム

1. **一般ユーザー（低制限）**
   - 登録：メールアドレスのみ
   - 可能：質問閲覧、質問投稿、基本的な回答
   - 目的：参入障壁を下げ、ユーザー基盤拡大

2. **認証済みユーザー（中制限）**
   - 登録：簡易プロフィール（職種、経験年数、専門分野）
   - 可能：専門的な回答、「医療従事者」バッジ表示
   - 目的：信頼性向上、過度な負担回避

3. **検証済み専門家（任意・高信頼）**
   - 登録：医師免許等のアップロード（任意）
   - 可能：「検証済み専門家」ゴールドバッジ、優先表示
   - 目的：高品質回答の促進、プレミアム機能提供

### 導入戦略

**フェーズ1（0-6ヶ月）**
- 自己申告制でスタート
- メールアドレス認証のみ
- 明確な免責事項への同意

**フェーズ2（6-12ヶ月）**
- 任意の簡易認証導入
- インセンティブ提供（バッジ、優先表示）
- コミュニティ評価システム

**フェーズ3（12ヶ月以降）**
- 高リスク質問のみ認証必須化
- AI支援によるコンテンツチェック
- 専門家ネットワーク構築

### 法的リスク対策

1. **免責事項の徹底**
   - 「医療アドバイスではない」旨の明確な表示
   - 各投稿への免責文言自動付与

2. **コンテンツモデレーション**
   - AIによる危険な内容の自動検出
   - コミュニティ報告システム
   - 事後的な専門家レビュー

3. **段階的な制限**
   - 処方薬に関する質問は認証必須
   - 緊急性の高い内容は自動警告

**決定日：2025年6月22日**
**決定理由：ユーザー獲得と法的リスク管理のバランスを重視**

## 📋 **開発ルール・約束事（重要）**

### 🇯🇵 **日本語対応の徹底**
- **すべての対応は日本語で行う**
- UIテキスト、メッセージ、説明文は必ず日本語
- 英語での回答や説明は避ける
- アプリケーション名「チューサポ」を正しく使用

### 🎓 **プログラミング初心者への配慮**
- **コード変更時は必ず解説を含める**：
  - なぜその変更が必要なのか
  - どのような仕組みで動作するのか
  - 各コードの部分が何をしているのか
- 専門用語には簡単な解説を付ける
- 段階的で理解しやすい説明を心がける

### 🔄 **定期的なルール振り返り仕組み**
- **各工程完了時のチェックリスト**：
  - ✅ 日本語での対応ができているか
  - ✅ プログラミング初心者向けの解説が含まれているか
  - ✅ 医療安全・ユーザビリティを考慮できているか
  - ✅ CLAUDE.mdのルールに沿っているか

- **TodoWrite使用時のルール確認**：
  - 新しいタスク追加時にガイドラインを意識
  - タスク完了時に自己チェックを実行

- **定期的なCLAUDE.md参照**：
  - 複数タスク進行後や大きな機能実装前後で必ず確認
  - 重要な変更前には医療安全・ユーザー体験の観点から再確認

### 🏥 **医療安全・コンプライアンス**
- 医療安全を最優先とした実装
- エビデンスベースの情報提供
- プライバシー保護の徹底
- 建設的で専門的なコミュニティ維持

### 📊 **開発状況報告書の継続更新**
- **DEVELOPMENT_STATUS.mdの定期更新**：
  - 新機能実装時は「完成済み機能」セクションに追加
  - 技術的な改善や学びがあった場合は該当セクションを更新
  - 課題や制限事項が解決された場合は適切に反映
  
- **更新タイミング**：
  - 大きな機能完成時（質問投稿、ユーザー管理等）
  - 重要な技術的改善実装時（パフォーマンス改善、バグ修正等）
  - 新しい技術や手法を導入した時
  - プロジェクトの方向性に変更があった時
  
- **更新内容**：
  - 完了済み機能リストの追加・修正
  - 技術的特徴・学びの更新
  - 今後の開発予定の調整
  - 課題・制限事項の現状反映
  - 開発ノウハウ・ベストプラクティスの追加

- **目的**：
  - プロジェクト進捗の可視化
  - 壁打ちやレビュー時の最新情報提供
  - 技術的負債や改善点の継続的な管理
  - チーム（AI含む）での開発状況共有

**追加日：2025年6月23日**
**目的：一貫性のある開発品質向上と約束事の遵守、および継続的なプロジェクト管理**

---

## 📋 **現在進行中の作業：UI/UX簡素化・本質追求プロジェクト**

### 🎯 **プロジェクト目標**
「注射や採血、ルート確保などの穿刺で悩んだ時に、このサイトに来れば悩みが解決できる」という本質的価値に集中するため、余計な機能を削除し、シンプルで使いやすいプラットフォームを構築する。

### 📅 **作業開始日：2025年6月23日**

---

## ✅ **完了済み作業**

### **Phase 1: 優先度レベル機能の完全削除**
**実施日**: 2025年6月23日  
**理由**: 穿刺技術の悩みに「高・中・低」の優先度概念は不適切

**削除内容**:
- `src/types/index.ts` - Question型のpriorityフィールド削除
- `src/components/SearchAndFilter.tsx` - 優先度フィルターUI削除
- `src/components/QuestionCard.tsx` - 優先度バッジ表示削除
- `src/components/AnswerQuestions.tsx` - 優先度関連処理削除
- `src/App.tsx` - 優先度フィルタリング処理削除

### **Phase 2: 「いいね」と「感謝」の機能分化**
**実施日**: 2025年6月23日  
**理由**: 質問する勇気への称賛と実践的価値への感謝を明確に分離

**実装内容**:
- **質問**: いいね機能のみ（「質問してくれてありがとう」の意味）
- **回答**: 感謝機能のみ（「実際に役立った」の意味）

**修正ファイル**:
- `src/components/Guidelines.tsx` - 使い分けガイド追加
- `src/components/QuestionDetail.tsx` - 回答いいねボタン削除
- `src/hooks/useAnswers.ts` - likeAnswer, isAnswerLiked関数削除
- `src/types/index.ts` - Answer型のlikesフィールド削除
- `src/components/AnswerQuestions.tsx` - answer.likes → answer.gratitude変更

---

## 🔄 **現在の状況**

### **2025年6月24日17:35 完了済み作業**

#### **✅ Phase 2.5: インライン回答表示システムの完成**
**実施日**: 2025年6月24日  
**概要**: モーダルを廃止し、質問カード内で回答を直接表示する革新的UIの実装

**実装内容**:
- **インライン回答表示**: 質問カード内で回答を段階的に展開表示
- **感謝数順ソート**: 実践的価値の高い回答を優先表示
- **段階的開示**: 3件表示→全件表示で情報過多を防止
- **レスポンシブ行数検出**: 3行以上で「さらに表示」ボタン表示
- **6件デモ回答データ**: 田中美咲さんの質問への実践的回答例

#### **✅ Phase 2.6: UI配置とアニメーションの最適化** 
**実施日**: 2025年6月24日  
**概要**: ユーザビリティ向上のための配置調整と視覚効果改善

**実装内容**:
- **アクション配置改善**: いいね・回答数・解決済み表示を質問文直下に移動
- **PC版準拠感謝アイコン**: QuestionDetailと同じ精密SVG合掌アイコンを採用
- **キラキラエフェクト**: クリック時に大きなピンクハートが舞い上がる美しいアニメーション
- **アイコンサイズ最適化**: 手の部分を1.8倍拡大、背景サイズは統一維持
- **JSX構造修正**: 隣接要素エラーの完全解決

#### **✅ Phase 2.7: 感謝機能の完全実装**
**実施日**: 2025年6月24日  
**概要**: PC版と完全同期した感謝システムの実装

**実装内容**:
- **PC版準拠SVG**: QuestionDetail.tsxの588-697行目の合掌アイコンを完全移植
- **触覚フィードバック**: バイブレーション機能搭載
- **アニメーション効果**: 
  - gratitudePulse（1秒間の拡大・回転・色変化）
  - naturalSparkleFloat（ピンクハートの上昇エフェクト）
  - animate-pulse（感謝済み時の光る効果）
- **状態管理**: 感謝済み/未感謝の永続化対応

### **最新の開発ステータス**
- ✅ **JSXエラー**: 完全解決済み
- ✅ **UI配置**: 質問文直下へのアクション移動完了
- ✅ **感謝アイコン**: PC版と同等の精密SVG実装済み
- ✅ **アニメーション**: 大型ハートエフェクト実装済み
- ✅ **サイズ調整**: 手の部分1.8倍拡大、背景統一完了

---

## 📋 **次回作業予定**

### **🔧 継続中の開発ワークフロー確立**
**開発環境**：
- **Claude Code（CLI）**: コード編集・ファイル管理・Git操作
- **Cursor**: 開発サーバー起動（`npm run dev`）・ブラウザ確認
- **ローカルホスト問題**: 環境差により、Cursorでの動作確認必須

### **Phase 3: 過剰な検索・フィルター機能の簡素化**
**優先度**: 中
**予定内容**:
- ステータスフィルター（解決済み/未解決）の削除検討
- 複雑な並び順選択の簡素化（新しい順のみに）
- アクティブフィルター表示の削除
- SearchAndFilterコンポーネントの大幅簡素化

### **Phase 4: 不要なナビゲーション要素の削除**
**優先度**: 中
**予定内容**:
- サイドバーから「トレンド」「専門家」「スケジュール」削除
- 「通知設定」「ヘルプ」「設定」の削除（初期段階では不要）
- 「今日の活動サマリー」削除
- ナビゲーションのGoogle検索ライク化

### **Phase 5: 統計・ランキング系の削除**
**優先度**: 低
**予定内容**:
- ホーム画面統計情報削除
- 感謝ランキング1位表示削除
- 月間ランキング機能削除
- シンプルな質問一覧表示への集約

## 🔧 **技術実装詳細（2025年6月24日版）**

### **QuestionCard.tsx の主要実装**
**ファイル**: `/Users/hayashikeiichirou/MedConsult/src/components/QuestionCard.tsx`

#### **インライン回答表示システム**
```typescript
// 状態管理
const [isExpanded, setIsExpanded] = useState(false);
const [showAllAnswers, setShowAllAnswers] = useState(false);
const [gratitudeAnimations, setGratitudeAnimations] = useState<{[key: string]: boolean}>({});
const [answerGratitudes, setAnswerGratitudes] = useState<{[key: string]: boolean}>({});

// 回答データ取得・ソート
const allAnswers = getAnswersForQuestion(question.id);
const displayedAnswers = showAllAnswers ? allAnswers : allAnswers.slice(0, 3);
```

#### **レスポンシブ行数検出**
```typescript
// 3行オーバーフロー検出（ResizeObserver対応）
useEffect(() => {
  const checkTextOverflow = () => {
    if (textRef.current) {
      element.style.webkitLineClamp = 'unset';
      const fullHeight = element.scrollHeight;
      element.style.webkitLineClamp = '3';
      const clampedHeight = element.clientHeight;
      setNeedsExpansion(fullHeight > clampedHeight);
    }
  };
  // ... リサイズ監視
}, [question.content]);
```

#### **感謝アニメーション（PC版準拠）**
```typescript
// 感謝ボタンクリック処理
const handleGratitudeClick = (answerId: string, currentGratitude: number) => {
  if (!isCurrentlyGrateful) {
    if (navigator.vibrate) navigator.vibrate(100); // 触覚FB
    setGratitudeAnimations(prev => ({ ...prev, [answerId]: true }));
    setTimeout(() => setGratitudeAnimations(prev => ({ ...prev, [answerId]: false })), 1000);
  }
  // 状態更新・データ永続化
};
```

#### **精密SVG合掌アイコン**
```svg
<!-- PC版QuestionDetail.tsx L588-697準拠 -->
<g transform="translate(56.7, 75) scale(1.8) translate(-56.7, -75)">
  <path d="M38.6,102.1l18.1-21.2,18.1,21.2h27.2v-24.2..." 
        fill="#dc2626" stroke="#991b1b" strokeWidth="0.6" />
</g>
```

### **useAnswers.ts の実装**
**ファイル**: `/Users/hayashikeiichirou/MedConsult/src/hooks/useAnswers.ts`

#### **デモ回答データ（6件）**
- **質問ID '1'**: 田中美咲さんの高齢患者IV挿入質問
- **感謝数順**: 15→12→9→8→7→6（降順ソート）
- **専門性**: 血管外科医、救急科医師、訪問看護師、ICU看護師、透析室看護師
- **authorId対応**: user5, user6, user7, user4, user11, user13

#### **感謝数管理**
```typescript
const updateAnswerGratitude = (answerId: string, newGratitudeCount: number) => {
  const updatedAnswers = answers.map(a =>
    a.id === answerId ? { ...a, gratitude: newGratitudeCount } : a
  );
  setAnswers(updatedAnswers);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnswers));
};
```

### **CSS アニメーション**
**ファイル**: `/Users/hayashikeiichirou/MedConsult/src/index.css`

#### **感謝アニメーション**
```css
@keyframes gratitudePulse {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.4) rotate(2deg); filter: sepia(0.5) saturate(1.5); }
  40% { transform: scale(1.6) rotate(-1deg); filter: sepia(0.7) saturate(1.8); }
  100% { transform: scale(1.1) rotate(0deg); filter: sepia(0.2) saturate(1.2); }
}
```

#### **ハート上昇エフェクト**
```css
@keyframes naturalSparkleFloat {
  0% { opacity: 0; transform: translateY(0) scale(0.4); }
  15% { opacity: 1; transform: translateY(-20px) scale(1.0); }
  100% { opacity: 0; transform: translateY(-190px) scale(0.3); }
}
```

---

## 🎯 **設計思想の確認**

### **保持する価値**
- ✅ 穿刺5カテゴリー（注射・採血・ルート確保・動脈穿刺・その他）
- ✅ 質問への「いいね」（勇気への称賛）
- ✅ 回答への「感謝」（実践的価値への評価）
- ✅ 専門性バッジ（信頼度の可視化）
- ✅ プロフィール機能（人間関係構築）

### **削除する要素**
- ❌ 優先度システム（高・中・低）
- ❌ 統計・ランキング表示
- ❌ 過剰なフィルタリング機能
- ❌ 初期段階では不要なナビゲーション

### **目指すUI像**
**Google検索ライクなシンプル体験**:
1. サイトアクセス
2. 検索バー「静脈採血 コツ」入力
3. 関連質問が即座に表示
4. 質問クリック → 回答確認 → 解決

---

## 🚀 **次回作業開始手順**

### **セッション開始時の確認事項**
```bash
# 1. プロジェクトディレクトリに移動
cd /Users/hayashikeiichirou/MedConsult

# 2. 開発サーバー起動（Cursorで実行）
npm run dev

# 3. 動作確認項目
# ✅ http://localhost:5173 アクセス確認
# ✅ 質問カードの「さらに表示」ボタン動作
# ✅ インライン回答表示（3件→全件展開）
# ✅ 感謝ボタンの合掌アイコン表示
# ✅ 感謝ボタンクリック時のハートアニメーション
# ✅ いいね・回答数・解決済み表示が質問文直下に配置
```

### **次回セッション推奨作業順序**
1. **動作確認**: 上記チェック項目の全確認
2. **Phase 3開始**: SearchAndFilterコンポーネントの簡素化
3. **段階的実装**: ユーザーフィードバックを得ながら進行
4. **テスト実行**: 各機能の動作確認

### **重要な開発環境情報**
- **macOS Sequoia 15.5**: localhost接続制限あり
- **Claude Code**: コード編集専用
- **Cursor**: 開発サーバー・ブラウザ確認専用
- **Git管理**: Claude Codeで実行

**確認後、Phase 3（検索・フィルター簡素化）作業継続予定**