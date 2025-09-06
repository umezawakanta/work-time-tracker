import { VercelRequest, VercelResponse } from '@vercel/node';
import { loadVercelData, saveVercelDataImmediately } from '../../_lib/vercel-storage';

interface DailyTask {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'planning' | 'personal' | 'health';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskCompletion {
  taskId: string;
  userId: string;
  completedAt: string;
  notes?: string;
}

// データストア（ファイルから読み込み）
const taskStore = loadVercelData<DailyTask>('daily-tasks');
const completionStore = loadVercelData<TaskCompletion>('task-completions');

// デフォルトタスク定義（初期化用）
const DEFAULT_TASKS: DailyTask[] = [
  {
    id: 'task_1',
    name: '直近3ヶ月の収入と支出をすべて把握する',
    description: '収入・支出データの確認と最新状況の把握',
    category: 'financial',
    isActive: true,
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_2',
    name: '現在の資産と負債をすべて把握する',
    description: '資産・負債レポートの確認と現在の財務状況を把握',
    category: 'financial',
    isActive: true,
    order: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_3',
    name: '現在から3ヶ月後までの予定をすべて把握する',
    description: 'カレンダー・スケジュールの確認と今後の予定を把握',
    category: 'planning',
    isActive: true,
    order: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_4',
    name: '先月と今月の固定費の支払いと支払日をすべて把握',
    description: '固定費の支払い状況確認と支払日の管理',
    category: 'financial',
    isActive: true,
    order: 4,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_5',
    name: '直近3ヶ月の利息の支払いをすべて把握',
    description: '利息支払いの確認と支払い履歴の把握',
    category: 'financial',
    isActive: true,
    order: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_6',
    name: '直近3ヶ月の光熱費の支払いをすべて把握',
    description: '光熱費の支払い確認と支払い履歴の把握',
    category: 'financial',
    isActive: true,
    order: 6,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_7',
    name: 'ギターの練習',
    description: '練習時間の記録と練習内容の記録',
    category: 'personal',
    isActive: true,
    order: 7,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_8',
    name: '洗い物',
    description: '家事の完了確認と日常の清潔維持',
    category: 'personal',
    isActive: true,
    order: 8,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_9',
    name: '自炊',
    description: '自炊の実行確認と健康管理の一環',
    category: 'health',
    isActive: true,
    order: 9,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_10',
    name: '風呂',
    description: '入浴の完了確認と健康管理の一環',
    category: 'health',
    isActive: true,
    order: 10,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_11',
    name: '読書',
    description: '知識習得と教養向上のための読書時間',
    category: 'personal',
    isActive: true,
    order: 11,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_12',
    name: 'このサイトの開発を進める',
    description: 'Work Time Trackerの機能開発と改善',
    category: 'personal',
    isActive: true,
    order: 12,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_13',
    name: '新聞を捨てる',
    description: '古い新聞の整理と廃棄',
    category: 'personal',
    isActive: true,
    order: 13,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_14',
    name: 'チラシを捨てる',
    description: '不要なチラシの整理と廃棄',
    category: 'personal',
    isActive: true,
    order: 14,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_15',
    name: '冷蔵庫の中身を確認',
    description: '食材の在庫確認と賞味期限チェック',
    category: 'personal',
    isActive: true,
    order: 15,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_16',
    name: '床掃除',
    description: '日常的な床の清掃とメンテナンス',
    category: 'personal',
    isActive: true,
    order: 16,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_17',
    name: '洗濯',
    description: '衣類の洗濯と清潔維持',
    category: 'personal',
    isActive: true,
    order: 17,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_18',
    name: '洗濯物を干す',
    description: '洗濯物の乾燥と整理',
    category: 'personal',
    isActive: true,
    order: 18,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_19',
    name: '洗濯物をたたむ',
    description: '乾いた洗濯物の整理と収納',
    category: 'personal',
    isActive: true,
    order: 19,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task_20',
    name: '押入れの整理',
    description: '押入れの整理整頓と収納管理',
    category: 'personal',
    isActive: true,
    order: 20,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS設定
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';

  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const userId = (req.query.userId as string) || 'default-user';

    if (req.method === 'GET') {
      // タスク一覧を取得
      let userTasks = taskStore.get(userId);

      // 初回アクセスの場合はデフォルトタスクを初期化
      if (!userTasks) {
        userTasks = [...DEFAULT_TASKS];
        taskStore.set(userId, userTasks);
      }

      res.status(200).json({
        success: true,
        data: userTasks,
      });
      return;
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required',
        });
        return;
      }

      // ユーザーのタスクを取得
      let userTasks = taskStore.get(userId);
      if (!userTasks) {
        userTasks = [...DEFAULT_TASKS];
        taskStore.set(userId, userTasks);
      }

      // タスクの更新
      const taskIndex = userTasks.findIndex((task) => task.id === id);
      if (taskIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      const updatedTask = {
        ...userTasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      userTasks[taskIndex] = updatedTask;
      taskStore.set(userId, userTasks);

      // データを即座に保存
      saveVercelDataImmediately(taskStore, 'daily-tasks');

      res.status(200).json({
        success: true,
        data: updatedTask,
      });
      return;
    }

    if (req.method === 'POST') {
      const { taskId, completedAt, notes } = req.body;

      if (!taskId) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required',
        });
        return;
      }

      // タスク完了を記録
      const completion: TaskCompletion = {
        taskId,
        userId,
        completedAt: completedAt || new Date().toISOString(),
        notes,
      };

      const userCompletions = completionStore.get(userId) || [];
      userCompletions.push(completion);
      completionStore.set(userId, userCompletions);

      res.status(201).json({
        success: true,
        data: completion,
      });
      return;
    }

    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Daily 10 Tasks API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
    });
  }
}
