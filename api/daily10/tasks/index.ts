import { VercelRequest, VercelResponse } from '@vercel/node';

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

// 固定の10個のタスク定義
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
    if (req.method === 'GET') {
      // タスク一覧を取得
      res.status(200).json({
        success: true,
        data: DEFAULT_TASKS,
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

      // タスクの更新（実際の実装ではデータベースを更新）
      const taskIndex = DEFAULT_TASKS.findIndex((task) => task.id === id);
      if (taskIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      const updatedTask = {
        ...DEFAULT_TASKS[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      res.status(200).json({
        success: true,
        data: updatedTask,
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
