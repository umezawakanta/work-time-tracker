import { VercelRequest, VercelResponse } from '@vercel/node';

interface TaskProgress {
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

interface DailyProgress {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  tasks: {
    [taskId: string]: TaskProgress;
  };
  completionRate: number; // 0-100
  streak: number; // 連続実行日数
  createdAt: string;
  updatedAt: string;
}

// メモリストレージ（実際の実装ではデータベースを使用）
const progressStore: Map<string, DailyProgress> = new Map();

// 進捗データの生成
function generateProgressId(userId: string, date: string): string {
  return `progress_${userId}_${date}`;
}

// 完了率の計算
function calculateCompletionRate(tasks: { [taskId: string]: TaskProgress }): number {
  const taskIds = Object.keys(tasks);
  if (taskIds.length === 0) return 0;

  const completedTasks = taskIds.filter((taskId) => tasks[taskId].completed).length;
  return Math.round((completedTasks / taskIds.length) * 100);
}

// 連続実行日数の計算
function calculateStreak(userId: string, currentDate: string): number {
  const today = new Date(currentDate);
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    const progressId = generateProgressId(userId, dateStr);
    const progress = progressStore.get(progressId);

    if (!progress || progress.completionRate < 100) {
      break;
    }

    streak++;
  }

  return streak;
}

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
    const { userId } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    if (req.method === 'GET') {
      const { date, startDate, endDate } = req.query;

      if (date) {
        // 特定日の進捗を取得
        const progressId = generateProgressId(userId as string, date as string);
        const progress = progressStore.get(progressId);

        if (!progress) {
          // 進捗データが存在しない場合は空のデータを返す
          const emptyProgress: DailyProgress = {
            id: progressId,
            userId: userId as string,
            date: date as string,
            tasks: {},
            completionRate: 0,
            streak: calculateStreak(userId as string, date as string),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          res.status(200).json({
            success: true,
            data: emptyProgress,
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: progress,
        });
        return;
      }

      if (startDate && endDate) {
        // 期間別の進捗を取得
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        const progressList: DailyProgress[] = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const progressId = generateProgressId(userId as string, dateStr);
          const progress = progressStore.get(progressId);

          if (progress) {
            progressList.push(progress);
          }
        }

        res.status(200).json({
          success: true,
          data: progressList,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: 'Date or date range is required',
      });
      return;
    }

    if (req.method === 'POST') {
      const { date, taskId, completed, notes } = req.body;

      if (!date || !taskId) {
        res.status(400).json({
          success: false,
          message: 'Date and task ID are required',
        });
        return;
      }

      const progressId = generateProgressId(userId as string, date);
      let progress = progressStore.get(progressId);

      if (!progress) {
        // 新しい進捗データを作成
        progress = {
          id: progressId,
          userId: userId as string,
          date,
          tasks: {},
          completionRate: 0,
          streak: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // タスクの進捗を更新
      progress.tasks[taskId] = {
        completed: completed || false,
        completedAt: completed ? new Date().toISOString() : undefined,
        notes: notes || '',
      };

      // 完了率を再計算
      progress.completionRate = calculateCompletionRate(progress.tasks);
      progress.streak = calculateStreak(userId as string, date);
      progress.updatedAt = new Date().toISOString();

      progressStore.set(progressId, progress);

      res.status(200).json({
        success: true,
        data: progress,
      });
      return;
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Progress ID is required',
        });
        return;
      }

      const progress = progressStore.get(id as string);
      if (!progress) {
        res.status(404).json({
          success: false,
          message: 'Progress not found',
        });
        return;
      }

      const updatedProgress = {
        ...progress,
        ...updates,
        completionRate: calculateCompletionRate(updates.tasks || progress.tasks),
        streak: calculateStreak(userId as string, progress.date),
        updatedAt: new Date().toISOString(),
      };

      progressStore.set(id as string, updatedProgress);

      res.status(200).json({
        success: true,
        data: updatedProgress,
      });
      return;
    }

    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Daily 10 Progress API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
    });
  }
}
