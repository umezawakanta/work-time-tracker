# 必ず毎日やる10のこと - 基本設計書

## 1. システム構成

### 1.1 アーキテクチャ
- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: MongoDB
- **認証**: JWT
- **デプロイ**: Vercel

### 1.2 コンポーネント構成

```
src/
├── pages/
│   └── Daily10TasksPage.tsx          # メインページ
├── components/
│   ├── daily10/
│   │   ├── TaskList.tsx              # タスク一覧
│   │   ├── TaskItem.tsx              # 個別タスク
│   │   ├── ProgressChart.tsx         # 進捗チャート
│   │   ├── StatsDashboard.tsx        # 統計ダッシュボード
│   │   └── StreakCounter.tsx         # 連続実行カウンター
├── hooks/
│   ├── useDaily10Tasks.ts            # タスク管理フック
│   └── useDailyProgress.ts           # 進捗管理フック
├── services/
│   └── api/
│       └── daily10Api.ts             # API呼び出し
└── types/
    └── daily10.ts                    # 型定義
```

## 2. データベース設計

### 2.1 コレクション設計

#### 2.1.1 daily_tasks (タスク定義)
```javascript
{
  _id: ObjectId,
  id: "task_1",
  name: "直近3ヶ月の収入と支出をすべて把握する",
  description: "収入・支出データの確認と最新状況の把握",
  category: "financial",
  isActive: true,
  order: 1,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### 2.1.2 daily_progress (日別進捗)
```javascript
{
  _id: ObjectId,
  userId: "user_123",
  date: "2024-01-20",
  tasks: {
    "task_1": {
      completed: true,
      completedAt: "2024-01-20T10:30:00Z",
      notes: "収入確認完了"
    },
    "task_2": {
      completed: false,
      completedAt: null,
      notes: ""
    }
  },
  completionRate: 80,
  streak: 5,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### 2.1.3 daily_stats (統計データ)
```javascript
{
  _id: ObjectId,
  userId: "user_123",
  totalDays: 30,
  completedDays: 25,
  averageCompletionRate: 85.5,
  longestStreak: 15,
  currentStreak: 5,
  weeklyStats: [
    {
      week: "2024-W03",
      completionRate: 90,
      completedTasks: 63
    }
  ],
  monthlyStats: [
    {
      month: "2024-01",
      completionRate: 85,
      completedTasks: 255
    }
  ],
  lastUpdated: ISODate
}
```

## 3. API設計

### 3.1 エンドポイント一覧

#### 3.1.1 タスク管理
- `GET /api/daily10/tasks` - タスク一覧取得
- `PUT /api/daily10/tasks/:id` - タスク更新

#### 3.1.2 進捗管理
- `GET /api/daily10/progress/:date` - 日別進捗取得
- `POST /api/daily10/progress` - 進捗作成
- `PUT /api/daily10/progress/:id` - 進捗更新
- `GET /api/daily10/progress/range` - 期間別進捗取得

#### 3.1.3 統計データ
- `GET /api/daily10/stats` - 統計データ取得
- `GET /api/daily10/stats/weekly` - 週別統計
- `GET /api/daily10/stats/monthly` - 月別統計

### 3.2 リクエスト/レスポンス例

#### 3.2.1 進捗更新
```typescript
// POST /api/daily10/progress
{
  "date": "2024-01-20",
  "taskId": "task_1",
  "completed": true,
  "notes": "収入確認完了"
}

// Response
{
  "success": true,
  "data": {
    "id": "progress_123",
    "userId": "user_123",
    "date": "2024-01-20",
    "tasks": {
      "task_1": {
        "completed": true,
        "completedAt": "2024-01-20T10:30:00Z",
        "notes": "収入確認完了"
      }
    },
    "completionRate": 80,
    "streak": 5
  }
}
```

## 4. UI設計

### 4.1 ページ構成

#### 4.1.1 メインページ (Daily10TasksPage)
- ヘッダー: 日付、連続実行日数
- タスク一覧: 10個のタスクカード
- 進捗表示: 完了率、チャート
- 統計情報: 週別・月別統計

#### 4.1.2 タスクカード (TaskItem)
- タスク名・説明
- 完了チェックボックス
- 完了時刻
- メモ入力欄
- カテゴリ表示

#### 4.1.3 統計ダッシュボード (StatsDashboard)
- 完了率グラフ
- 連続実行記録
- 週別・月別統計
- 達成率の推移

### 4.2 レスポンシブデザイン

#### 4.2.1 デスクトップ
- 2列レイアウト
- 左側: タスク一覧
- 右側: 統計情報

#### 4.2.2 モバイル
- 1列レイアウト
- タブ切り替え
- スワイプ操作対応

## 5. 状態管理

### 5.1 Redux Store構成

```typescript
interface Daily10State {
  tasks: DailyTask[];
  progress: DailyProgress[];
  stats: DailyStats | null;
  currentDate: string;
  isLoading: boolean;
  error: string | null;
}
```

### 5.2 アクション

```typescript
// タスク管理
const fetchTasks = createAsyncThunk('daily10/fetchTasks', ...);
const updateTask = createAsyncThunk('daily10/updateTask', ...);

// 進捗管理
const fetchProgress = createAsyncThunk('daily10/fetchProgress', ...);
const updateProgress = createAsyncThunk('daily10/updateProgress', ...);

// 統計データ
const fetchStats = createAsyncThunk('daily10/fetchStats', ...);
```

## 6. セキュリティ

### 6.1 認証・認可
- JWT認証必須
- ユーザーIDによるデータ分離
- 管理者権限による統計確認

### 6.2 データ保護
- 個人データの暗号化
- 通信のHTTPS化
- 入力値の検証・サニタイズ

## 7. パフォーマンス

### 7.1 最適化
- データのキャッシュ
- ページネーション
- 遅延読み込み

### 7.2 監視
- API応答時間の監視
- エラー率の監視
- ユーザー行動の分析

## 8. テスト戦略

### 8.1 単体テスト
- コンポーネントテスト
- フックテスト
- APIテスト

### 8.2 統合テスト
- ページ全体のテスト
- API統合テスト
- データベース統合テスト

### 8.3 E2Eテスト
- ユーザーフローテスト
- クロスブラウザテスト
- モバイルテスト
