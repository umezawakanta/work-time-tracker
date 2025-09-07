import { VercelRequest, VercelResponse } from '@vercel/node';

interface LiveMetrics {
  activeUsers: number;
  completionRate: number;
  todaysTasks: number;
  weeklyTrend: number;
}

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    console.log('[admin/live-metrics] Starting request');

    // 管理者認証
    let ctx, auth, User, user;
    try {
      ctx = require('../_lib/user-context.js');
      console.log('[admin/live-metrics] Context loaded');

      auth = await ctx.verifyJwtAndExtract(req as any);
      console.log('[admin/live-metrics] Auth verified:', { userId: auth?.userId });

      if (!auth || !auth.userId) {
        return void res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // 管理者権限チェック
      User = await ctx.ensureDbAndUserModel();
      console.log('[admin/live-metrics] User model ensured');

      user = await ctx.findUserByIdLoose(User, auth.userId);
      console.log('[admin/live-metrics] User found:', {
        user: user ? { id: user._id, role: user.role } : null,
      });

      if (!user || user.role !== 'admin') {
        return void res.status(403).json({ success: false, message: 'Admin access required' });
      }
    } catch (authError) {
      console.error('[admin/live-metrics] Authentication error:', authError);
      return void res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: authError instanceof Error ? authError.message : 'Unknown auth error',
      });
    }

    // MongoDB接続
    console.log('[admin/live-metrics] Connecting to MongoDB');
    const mongoLib = require('../_lib/mongo');
    try {
      await mongoLib.connectMongoDirect();
      console.log('[admin/live-metrics] MongoDB connected');
    } catch (mongoError) {
      console.error('[admin/live-metrics] MongoDB connection failed:', mongoError);
      throw new Error(
        `MongoDB connection failed: ${mongoError instanceof Error ? mongoError.message : 'Unknown error'}`
      );
    }

    const mongoose = await mongoLib.getMongoose();
    console.log('[admin/live-metrics] Mongoose obtained');

    // 今日のアクティブユーザー数（過去24時間）
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: last24Hours },
    });

    // タスク完了率の計算
    let Todo;
    try {
      Todo = mongoose.model('Todo');
    } catch (error) {
      Todo = mongoose.model(
        'Todo',
        new mongoose.Schema({
          userId: { type: String, required: true },
          title: { type: String, required: true },
          completed: { type: Boolean, default: false },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        })
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysTasks = await Todo.countDocuments({
      createdAt: { $gte: today },
    });

    const completedToday = await Todo.countDocuments({
      createdAt: { $gte: today },
      completed: true,
    });

    const completionRate = todaysTasks > 0 ? Math.round((completedToday / todaysTasks) * 100) : 0;

    // 週次傾向の計算（今週 vs 先週）
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);

    const thisWeekTasks = await Todo.countDocuments({
      createdAt: { $gte: weekStart },
    });

    const lastWeekTasks = await Todo.countDocuments({
      createdAt: { $gte: lastWeekStart, $lt: weekStart },
    });

    const weeklyTrend =
      lastWeekTasks > 0 ? Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100) : 0;

    const liveMetrics: LiveMetrics = {
      activeUsers,
      completionRate,
      todaysTasks,
      weeklyTrend,
    };

    res.status(200).json({ success: true, data: liveMetrics });
  } catch (error) {
    console.error('Live metrics fetch error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? error.cause : undefined,
    });

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = handler;
