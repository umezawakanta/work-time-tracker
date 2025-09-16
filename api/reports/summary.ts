// VercelRequest, VercelResponse types are not needed in CommonJS
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { ensureDatabaseConnection, verifyJWT, handleError } = require('../utils/database');
const { TimeEntrySchema } = require('../utils/schemas');
// Type definitions are now in comments for reference

dotenv.config();



const TimeEntry = mongoose.models.TimeEntry || mongoose.model("TimeEntry", TimeEntrySchema);

// Summary report response interface
interface SummaryReportResponse {
  success: boolean;
  message: string;
  summary?: {
    totalTime: number;
    totalEntries: number;
    averageSessionTime: number;
    todayTime: number;
    thisWeekTime: number;
    thisMonthTime: number;
    projectBreakdown: Array<{
      projectId: string;
      projectName: string;
      totalTime: number;
      entryCount: number;
    }>;
  };
  error?: string;
}

module.exports = async function handler(req, res) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return handleError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
  }

  try {
    console.log('📊 Summary report request started');
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // JWTトークンを検証してユーザーIDを取得
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return handleError(res, { statusCode: 401, message: '認証が必要です' });
    }
    const userId = userInfo.userId;

    // 日付範囲の計算
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 時間記録を取得
    const allEntries = await TimeEntry.find({ 
      userId,
      endTime: { $exists: true },
      duration: { $exists: true }
    });

    const todayEntries = await TimeEntry.find({ 
      userId,
      startTime: { $gte: today },
      endTime: { $exists: true },
      duration: { $exists: true }
    });

    const weekEntries = await TimeEntry.find({ 
      userId,
      startTime: { $gte: weekStart },
      endTime: { $exists: true },
      duration: { $exists: true }
    });

    const monthEntries = await TimeEntry.find({ 
      userId,
      startTime: { $gte: monthStart },
      endTime: { $exists: true },
      duration: { $exists: true }
    });

    // 統計計算
    const totalTime = allEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalEntries = allEntries.length;
    const averageSessionTime = totalEntries > 0 ? Math.round(totalTime / totalEntries) : 0;
    const todayTime = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const thisWeekTime = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const thisMonthTime = monthEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    // プロジェクト別集計
    const projectBreakdown = allEntries.reduce((acc, entry) => {
      const projectId = entry.projectId || 'no-project';
      const projectName = projectId === 'no-project' ? 'プロジェクト未設定' : `プロジェクト ${projectId}`;
      
      if (!acc[projectId]) {
        acc[projectId] = {
          projectId,
          projectName,
          totalTime: 0,
          entryCount: 0,
        };
      }
      
      acc[projectId].totalTime += entry.duration || 0;
      acc[projectId].entryCount += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const projectBreakdownArray = Object.values(projectBreakdown);

    console.log('✅ Summary report generated:', {
      totalTime,
      totalEntries,
      userId,
    });

    // レスポンスの構築
    const response: SummaryReportResponse = {
      success: true,
      message: 'サマリーレポートを生成しました',
      summary: {
        totalTime,
        totalEntries,
        averageSessionTime,
        todayTime,
        thisWeekTime,
        thisMonthTime,
        projectBreakdown: projectBreakdownArray,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Summary report error:', error);
    return handleError(res, error, 'サマリーレポート生成中にエラーが発生しました');
  }
}
