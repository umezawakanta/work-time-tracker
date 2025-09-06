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
    // 管理者認証
    const ctx = require('../_lib/user-context.js');
    const auth = await ctx.verifyJwtAndExtract(req as any);

    // 管理者権限チェック
    const User = await ctx.ensureDbAndUserModel();
    const user = await ctx.findUserByIdLoose(User, auth.userId);
    if (!user || user.role !== 'admin') {
      return void res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // MongoDB接続
    const mongoLib = require('../_lib/mongo');
    await mongoLib.connectMongoDirect();
    const mongoose = await mongoLib.getMongoose();

    // 今日のアクティブユーザー数（過去24時間）
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: last24Hours },
    });

    // タスク完了率の計算
    const Todo = mongoose.model(
      'Todo',
      new mongoose.Schema({
        userId: { type: String, required: true },
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      })
    );

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
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

module.exports = handler;
