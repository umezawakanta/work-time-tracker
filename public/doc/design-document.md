# Work Time Tracker - 包括的個人管理システム 設計書

## 1. システム概要

### 1.1 プロジェクト名
Work Time Tracker - 包括的個人管理システム

### 1.2 プロジェクトの目的
「人生なんて簡単だ。すべての欲望をコントロールさえできれば。計画を立てて計画通り行動できれば。すべての行動を記録して見直しできれば。まずは自分の資産、負債、収入、支出、過去の行動、今後の予定を把握するところから始めよう。次にすることは自分から搾取しているものを把握して身を守ろう。」

この理念に基づき、個人の完全な自己管理を支援する包括的なライフマネジメントシステムを構築する。

### 1.3 システムの特徴
- **統合管理**: 資産、負債、収入、支出、行動、計画を一元管理
- **搾取要素の監視**: サブスク、納税、金利支払い、公共料金等の監視
- **データ分析**: パターン分析、改善提案、予測機能
- **鳥瞰的視点**: すべての情報を一つのダッシュボードで把握

## 2. システムアーキテクチャ

### 2.1 技術スタック

#### 2.1.1 フロントエンド
- **フレームワーク**: React 18
- **言語**: TypeScript
- **ビルドツール**: Vite
- **スタイリング**: CSS3
- **状態管理**: React Hooks (useState, useEffect)
- **ルーティング**: React Router (将来実装予定)

#### 2.1.2 バックエンド
- **プラットフォーム**: Vercel Serverless Functions
- **言語**: Node.js
- **データベース**: MongoDB
- **ODM**: Mongoose
- **認証**: JWT (JSON Web Token)

#### 2.1.3 データ永続化
- **クライアントサイド**: LocalStorage
- **サーバーサイド**: MongoDB
- **同期**: 定期的なデータ同期（将来実装予定）

### 2.2 システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   App.tsx   │  │ WorkRecords │  │Comprehensive│        │
│  │             │  │ Component   │  │ Dashboard   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Action    │  │   Future    │  │    Data     │        │
│  │  History    │  │  Planning   │  │  Analysis   │        │
│  │ Component   │  │ Component   │  │ Component   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Manager Classes                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Action    │  │   Future    │  │    Data     │        │
│  │  History    │  │  Planning   │  │  Analysis   │        │
│  │  Manager    │  │  Manager    │  │  Manager    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ LocalStorage│  │   MongoDB    │  │   JWT Auth  │        │
│  │ (Client)    │  │ (Server)     │  │ (Server)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 コンポーネント構成

```
src/
├── components/
│   ├── WorkRecordsComponent.tsx      # メインコンポーネント
│   ├── ComprehensiveDashboard.tsx    # 統合ダッシュボード
│   ├── ActionHistoryComponent.tsx    # 行動記録
│   ├── FuturePlanningComponent.tsx   # 未来計画
│   ├── DataAnalysisComponent.tsx     # データ分析
│   ├── CalendarComponent.tsx         # カレンダー表示
│   └── DeleteConfirmModal.tsx        # 削除確認モーダル
├── utils/
│   ├── actionHistoryManager.ts       # 行動記録管理
│   ├── futurePlanningManager.ts      # 計画管理
│   ├── dataAnalysisManager.ts        # 分析管理
│   ├── apiClient.ts                  # API クライアント
│   ├── authUtils.ts                  # 認証ユーティリティ
│   └── logger.ts                     # ログユーティリティ
├── types.ts                          # 型定義
└── App.tsx                           # メインアプリケーション
```

## 3. データモデル

### 3.1 基本型定義

#### 3.1.1 ユーザー
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  preferences: any;
}
```

#### 3.1.2 収入・支出記録
```typescript
interface IncomeExpenseRecord {
  _id: string;
  userId: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  notes: string;
  category: string;           // カテゴリ
  subcategory?: string;       // サブカテゴリ
  tags?: string[];           // タグ
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.3 行動記録
```typescript
interface ActionRecord {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: "work" | "personal" | "health" | "learning" | "social" | "finance" | "other";
  subcategory?: string;
  startTime: string;
  endTime?: string;
  duration?: number;         // 分単位
  location?: string;
  participants?: string[];
  tags: string[];
  mood?: number;            // 1-5の評価
  energy?: number;          // 1-5の評価
  productivity?: number;    // 1-5の評価
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.4 計画・目標
```typescript
interface Plan {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: "work" | "personal" | "health" | "learning" | "finance" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "not_started" | "in_progress" | "completed" | "cancelled" | "on_hold";
  startDate: string;
  targetDate: string;
  completedDate?: string;
  progress: number;         // 0-100の進捗率
  tags: string[];
  notes?: string;
  parentPlanId?: string;    // 親計画のID
  subPlans?: string[];      // サブタスクのID配列
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.5 予定・スケジュール
```typescript
interface Schedule {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  participants?: string[];
  category: "work" | "personal" | "health" | "learning" | "social" | "finance" | "other";
  priority: "low" | "medium" | "high";
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
  recurrenceEndDate?: string;
  reminderMinutes?: number; // 何分前にリマインダーを送るか
  isCompleted: boolean;
  completedAt?: string;
  planId?: string; // 関連する計画のID
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.6 予算計画
```typescript
interface BudgetPlan {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  period: "monthly" | "quarterly" | "yearly";
  isActive: boolean;
  planId?: string; // 関連する計画のID
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.7 データ分析結果
```typescript
interface DataAnalysis {
  _id: string;
  userId: string;
  analysisType: "spending_pattern" | "income_trend" | "productivity_analysis" | "mood_correlation" | "goal_progress";
  title: string;
  description: string;
  insights: string[];
  recommendations: string[];
  data: any; // 分析データの詳細
  period: {
    start: string;
    end: string;
  };
  confidence: number; // 0-100の信頼度
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.8 改善提案
```typescript
interface ImprovementSuggestion {
  _id: string;
  userId: string;
  category: "financial" | "productivity" | "health" | "learning" | "social";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  estimatedBenefit: string;
  actionSteps: string[];
  isImplemented: boolean;
  implementedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.9 予測結果
```typescript
interface Prediction {
  _id: string;
  userId: string;
  predictionType: "spending" | "income" | "productivity" | "goal_completion";
  title: string;
  description: string;
  currentValue: number;
  predictedValue: number;
  confidence: number; // 0-100の信頼度
  timeframe: string; // 予測期間
  factors: string[]; // 影響要因
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 データベース設計

#### 3.2.1 MongoDB コレクション設計
```javascript
// ユーザーコレクション
users: {
  _id: ObjectId,
  email: String,
  displayName: String,
  role: String,
  isVerified: Boolean,
  avatar: String,
  preferences: Object,
  createdAt: Date,
  updatedAt: Date
}

// 収入・支出記録コレクション
incomeExpenseRecords: {
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  type: String, // "income" | "expense"
  amount: Number,
  notes: String,
  category: String,
  subcategory: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}

// 行動記録コレクション
actionRecords: {
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  category: String,
  subcategory: String,
  startTime: Date,
  endTime: Date,
  duration: Number,
  location: String,
  participants: [String],
  tags: [String],
  mood: Number,
  energy: Number,
  productivity: Number,
  notes: String,
  isCompleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// 計画コレクション
plans: {
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  category: String,
  priority: String,
  status: String,
  startDate: Date,
  targetDate: Date,
  completedDate: Date,
  progress: Number,
  tags: [String],
  notes: String,
  parentPlanId: ObjectId,
  subPlans: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}

// スケジュールコレクション
schedules: {
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  location: String,
  participants: [String],
  category: String,
  priority: String,
  isRecurring: Boolean,
  recurrencePattern: String,
  recurrenceEndDate: Date,
  reminderMinutes: Number,
  isCompleted: Boolean,
  completedAt: Date,
  planId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// 予算計画コレクション
budgetPlans: {
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  category: String,
  subcategory: String,
  targetAmount: Number,
  currentAmount: Number,
  startDate: Date,
  endDate: Date,
  period: String,
  isActive: Boolean,
  planId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.2.2 インデックス設計
```javascript
// ユーザーコレクション
db.users.createIndex({ "email": 1 }, { unique: true })

// 収入・支出記録コレクション
db.incomeExpenseRecords.createIndex({ "userId": 1, "date": -1 })
db.incomeExpenseRecords.createIndex({ "userId": 1, "type": 1 })
db.incomeExpenseRecords.createIndex({ "userId": 1, "category": 1 })

// 行動記録コレクション
db.actionRecords.createIndex({ "userId": 1, "startTime": -1 })
db.actionRecords.createIndex({ "userId": 1, "category": 1 })
db.actionRecords.createIndex({ "userId": 1, "isCompleted": 1 })

// 計画コレクション
db.plans.createIndex({ "userId": 1, "status": 1 })
db.plans.createIndex({ "userId": 1, "category": 1 })
db.plans.createIndex({ "userId": 1, "priority": 1 })

// スケジュールコレクション
db.schedules.createIndex({ "userId": 1, "startTime": 1 })
db.schedules.createIndex({ "userId": 1, "isCompleted": 1 })

// 予算計画コレクション
db.budgetPlans.createIndex({ "userId": 1, "isActive": 1 })
db.budgetPlans.createIndex({ "userId": 1, "category": 1 })
```

## 4. 機能仕様

### 4.1 統合ダッシュボード

#### 4.1.1 機能概要
すべての情報を一つの画面で把握できる鳥瞰的なダッシュボード

#### 4.1.2 表示項目
- **資産・負債サマリー**
  - 現金残高
  - 銀行口座残高
  - クレジットカード残高
  - ローン残高
  - 純資産

- **月次収支サマリー**
  - 今月の収入
  - 今月の支出
  - 月次収支
  - 前月比

- **支出カテゴリ別内訳**
  - カテゴリ別支出額
  - カテゴリ別支出割合
  - 予算達成率

- **最近の行動記録**
  - 直近の活動
  - 活動の評価
  - 生産性スコア

- **今後の予定・計画**
  - 今週の予定
  - 進行中の計画
  - 期限が近いタスク

- **改善提案と予測**
  - データ分析結果
  - 改善提案
  - 予測情報

#### 4.1.3 技術仕様
```typescript
interface DashboardData {
  assets: {
    cash: number;
    bankAccounts: BankAccount[];
    creditCards: CreditCard[];
    loans: Loan[];
    netWorth: number;
  };
  monthlySummary: {
    income: number;
    expense: number;
    netIncome: number;
    previousMonthComparison: number;
  };
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    budgetAchievement: number;
  }[];
  recentActions: ActionRecord[];
  upcomingSchedules: Schedule[];
  activePlans: Plan[];
  analysisResults: DataAnalysis[];
  suggestions: ImprovementSuggestion[];
  predictions: Prediction[];
}
```

### 4.2 搾取要素監視機能

#### 4.2.1 機能概要
個人から搾取している要素を特定し、監視する機能

#### 4.2.2 監視対象
- **サブスクリプション料金**
  - 動画配信サービス
  - 音楽配信サービス
  - ソフトウェアサブスクリプション
  - その他定期課金サービス

- **公共料金**
  - 電気代
  - ガス代
  - 水道代
  - インターネット料金
  - 固定電話料金

- **保険料**
  - 生命保険
  - 損害保険
  - 医療保険
  - その他保険

- **税金**
  - 所得税
  - 住民税
  - 固定資産税
  - その他税金

- **ローン返済**
  - 住宅ローン
  - カードローン
  - 自動車ローン
  - その他ローン

- **その他自動引き落とし**
  - 会費
  - 寄付
  - その他定期支払い

#### 4.2.3 監視機能
- **定期支払いの登録**
  - 支払い先の登録
  - 月額料金の設定
  - 支払い日の設定
  - 支払い方法の記録

- **支払い履歴の追跡**
  - 支払い日
  - 支払い金額
  - 支払い方法
  - 支払い状況

- **使用状況の確認**
  - サービスの利用状況
  - 利用頻度
  - 利用価値の評価

- **アラート機能**
  - 支払い日のリマインダー
  - 料金変動の通知
  - 使用状況の警告

#### 4.2.4 データ構造
```typescript
interface SubscriptionItem {
  _id: string;
  userId: string;
  name: string;
  category: "subscription" | "utility" | "insurance" | "tax" | "loan" | "other";
  monthlyAmount: number;
  paymentDate: number; // 日付（1-31）
  paymentMethod: string;
  isActive: boolean;
  usageStatus: "active" | "inactive" | "suspended";
  lastPaymentDate: string;
  nextPaymentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4.3 データ分析機能

#### 4.3.1 支出パターン分析
- **カテゴリ別支出分析**
  - 月次・年次の支出推移
  - カテゴリ別の支出割合
  - 支出の傾向分析

- **無駄遣いの特定**
  - 異常に高い支出の検出
  - 不要な支出の特定
  - 削減可能な支出の提案

- **予算達成率の分析**
  - カテゴリ別の予算達成率
  - 予算の適正性の評価
  - 予算の調整提案

#### 4.3.2 生産性分析
- **活動の完了率分析**
  - 計画した活動の完了率
  - 完了率の推移
  - 完了率の改善提案

- **時間効率の分析**
  - 活動時間の効率性
  - 時間の無駄の特定
  - 効率化の提案

- **気分と生産性の相関分析**
  - 気分と生産性の関係
  - 最適な気分の特定
  - 気分の改善提案

#### 4.3.3 改善提案生成
- **データに基づく提案**
  - 支出の削減提案
  - 時間の有効活用提案
  - 目標達成のための提案

- **優先度と影響度の評価**
  - 提案の優先度評価
  - 期待される影響度の評価
  - 実装の難易度評価

- **実装ステップの提示**
  - 具体的なアクションプラン
  - ステップバイステップの手順
  - 進捗の確認方法

#### 4.3.4 予測機能
- **支出予測**
  - 過去のデータに基づく支出予測
  - 月次・年次の支出予測
  - 予測の信頼度表示

- **収入予測**
  - 収入の推移予測
  - 収入の変動要因の分析
  - 収入の安定性評価

- **目標達成予測**
  - 現在の進捗に基づく達成予測
  - 達成に必要な条件の提示
  - 達成確率の表示

### 4.4 セキュリティ仕様

#### 4.4.1 認証・認可
- **JWT認証**
  - トークンベースの認証
  - トークンの有効期限管理
  - リフレッシュトークンの実装

- **パスワード管理**
  - 強力なパスワードの要求
  - パスワードのハッシュ化
  - パスワードの定期変更

- **セッション管理**
  - セッションの有効期限管理
  - セッションの無効化
  - 不正アクセスの検出

#### 4.4.2 データ保護
- **データ暗号化**
  - ローカルストレージの暗号化
  - 通信の暗号化（HTTPS）
  - データベースの暗号化

- **プライバシー保護**
  - 個人データの最小化
  - データの匿名化
  - ユーザーの同意に基づくデータ処理

- **アクセス制御**
  - ユーザーごとのデータ分離
  - 権限ベースのアクセス制御
  - 不正アクセスの防止

#### 4.4.3 監査ログ
- **操作ログ**
  - データの作成・更新・削除ログ
  - ログイン・ログアウトログ
  - エラーログ

- **セキュリティログ**
  - 不正アクセスの試行ログ
  - セキュリティイベントログ
  - システムの異常ログ

## 5. パフォーマンス仕様

### 5.1 レスポンス時間
- **ページ読み込み**: 3秒以内
- **データ保存**: 1秒以内
- **データ取得**: 2秒以内
- **分析実行**: 5秒以内

### 5.2 スループット
- **同時ユーザー数**: 1000ユーザー
- **1秒あたりのリクエスト数**: 100リクエスト
- **データベース接続数**: 100接続

### 5.3 リソース使用量
- **メモリ使用量**: 100MB以下
- **CPU使用率**: 80%以下
- **ディスク使用量**: 1GB以下

### 5.4 可用性
- **稼働率**: 99.9%以上
- **ダウンタイム**: 月8.76時間以下
- **復旧時間**: 1時間以内

## 6. 運用仕様

### 6.1 デプロイメント
- **本番環境**: Vercel
- **ステージング環境**: Vercel Preview
- **開発環境**: ローカル開発環境

### 6.2 監視
- **アプリケーション監視**: Vercel Analytics
- **エラー監視**: Sentry
- **パフォーマンス監視**: Vercel Speed Insights

### 6.3 バックアップ
- **データベースバックアップ**: 日次
- **設定ファイルバックアップ**: 週次
- **バックアップの保持期間**: 30日間

### 6.4 ログ管理
- **ログの保存期間**: 90日間
- **ログのローテーション**: 日次
- **ログの圧縮**: 有効

## 7. 拡張性

### 7.1 水平スケーリング
- **サーバーインスタンスの追加**: 可能
- **データベースのシャーディング**: 将来実装予定
- **CDNの利用**: 将来実装予定

### 7.2 機能拡張
- **モバイルアプリ**: 将来実装予定
- **AI機能**: 将来実装予定
- **他サービス連携**: 将来実装予定

### 7.3 データ拡張
- **新しいデータ型の追加**: 可能
- **既存データの拡張**: 可能
- **データマイグレーション**: 対応済み

## 8. 制約事項

### 8.1 技術的制約
- **ブラウザ対応**: モダンブラウザのみ
- **JavaScript**: 有効化必須
- **LocalStorage**: 対応ブラウザのみ

### 8.2 機能的制約
- **オフライン機能**: 制限あり
- **リアルタイム同期**: 未対応
- **多言語対応**: 日本語のみ

### 8.3 運用制約
- **サポート時間**: 平日9:00-18:00
- **メンテナンス時間**: 月1回
- **データ保持期間**: 1年間

## 9. リスク管理

### 9.1 技術的リスク
- **データ損失**: バックアップによる対策
- **セキュリティ侵害**: セキュリティ対策の実装
- **パフォーマンス低下**: 監視とチューニング

### 9.2 運用的リスク
- **サービス停止**: 冗長化による対策
- **データ漏洩**: セキュリティ対策の強化
- **ユーザー離脱**: ユーザビリティの向上

### 9.3 ビジネスリスク
- **競合他社の出現**: 差別化機能の強化
- **技術の陳腐化**: 定期的な技術更新
- **規制の変更**: 法規制への対応

## 10. 今後の計画

### 10.1 短期計画（3ヶ月）
- **バグ修正**: 既知の問題の修正
- **パフォーマンス改善**: レスポンス時間の短縮
- **ユーザビリティ向上**: UI/UXの改善

### 10.2 中期計画（6ヶ月）
- **モバイルアプリ**: iOS/Androidアプリの開発
- **AI機能**: 機械学習による分析機能
- **他サービス連携**: 外部APIとの連携

### 10.3 長期計画（1年）
- **国際化**: 多言語対応
- **エンタープライズ版**: 企業向け機能
- **API公開**: サードパーティ連携

---

この設計書は、Work Time Tracker - 包括的個人管理システムの技術仕様を定義しています。システムの開発、運用、保守に必要な情報を提供します。
