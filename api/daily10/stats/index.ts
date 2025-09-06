import { VercelRequest, VercelResponse } from '@vercel/node';

interface DailyStats {
  totalDays: number;
  completedDays: number;
  averageCompletionRate: number;
  longestStreak: number;
  currentStreak: number;
  weeklyStats: Array<{
    week: string;
    completionRate: number;
    completedTasks: number;
  }>;
  monthlyStats: Array<{
    month: string;
    completionRate: number;
    completedTasks: number;
  }>;
}

// 週の開始日を取得
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
  return new Date(d.setDate(diff));
}

// 月の開始日を取得
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 週のキーを生成 (YYYY-W##)
function getWeekKey(date: Date): string {
  const weekStart = getWeekStart(date);
  const year = weekStart.getFullYear();
  const weekNumber = Math.ceil((weekStart.getDate() + 6) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// 月のキーを生成 (YYYY-MM)
function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS設定
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';

  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { userId, type = 'all' } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      // モックデータを生成（実際の実装ではデータベースから取得）
      const mockStats: DailyStats = {
        totalDays: 30,
        completedDays: 25,
        averageCompletionRate: 85.5,
        longestStreak: 15,
        currentStreak: 5,
        weeklyStats: [
          {
            week: '2024-W01',
            completionRate: 80,
            completedTasks: 56,
          },
          {
            week: '2024-W02',
            completionRate: 90,
            completedTasks: 63,
          },
          {
            week: '2024-W03',
            completionRate: 85,
            completedTasks: 59,
          },
          {
            week: '2024-W04',
            completionRate: 88,
            completedTasks: 62,
          },
        ],
        monthlyStats: [
          {
            month: '2023-12',
            completionRate: 82,
            completedTasks: 246,
          },
          {
            month: '2024-01',
            completionRate: 85,
            completedTasks: 255,
          },
        ],
      };

      if (type === 'weekly') {
        res.status(200).json({
          success: true,
          data: mockStats.weeklyStats,
        });
        return;
      }

      if (type === 'monthly') {
        res.status(200).json({
          success: true,
          data: mockStats.monthlyStats,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: mockStats,
      });
      return;
    }

    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Daily 10 Stats API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
    });
  }
}
