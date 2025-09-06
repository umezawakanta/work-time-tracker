// Server error reporting API endpoint
interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined> & { [k: string]: any };
  query: Record<string, string | string[]>;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  res.setHeader(
    'Access-Control-Allow-Origin',
    origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return void res.status(200).end();
  if (req.method !== 'GET')
    return void res.status(405).json({ success: false, message: 'Method Not Allowed' });

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

    const { timeRange = '24h' } = req.query as { timeRange?: string };

    // 時間範囲の計算
    const now = new Date();
    let startTime: Date;
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // MongoDBからエラーログを取得
    const mongoLib = require('../_lib/mongo');
    await mongoLib.connectMongoDirect();
    const mongoose = await mongoLib.getMongoose();

    // 共通スキーマを使用
    const { getErrorLogModel } = require('../_schemas/errorLog');
    const ErrorLog = getErrorLogModel();

    // エラーログを取得
    const errors = await ErrorLog.find({
      timestamp: { $gte: startTime },
    })
      .sort({ timestamp: -1 })
      .limit(1000);

    // 統計情報を計算
    const stats = {
      totalErrors: errors.length,
      errorsByLevel: {} as Record<string, number>,
      errorsByEndpoint: {} as Record<string, number>,
      errorsByHour: {} as Record<string, number>,
      recentErrors: errors.slice(0, 10),
      topErrors: [] as Array<{ message: string; count: number }>,
    };

    // エラーレベル別集計
    errors.forEach((error) => {
      stats.errorsByLevel[error.level] = (stats.errorsByLevel[error.level] || 0) + 1;

      if (error.endpoint) {
        stats.errorsByEndpoint[error.endpoint] = (stats.errorsByEndpoint[error.endpoint] || 0) + 1;
      }

      const hour = new Date(error.timestamp).getHours();
      stats.errorsByHour[hour.toString()] = (stats.errorsByHour[hour.toString()] || 0) + 1;
    });

    // トップエラーメッセージを計算
    const messageCounts = {} as Record<string, number>;
    errors.forEach((error) => {
      messageCounts[error.message] = (messageCounts[error.message] || 0) + 1;
    });
    stats.topErrors = Object.entries(messageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    // レスポンス形式に変換
    const formattedErrors = errors.map((error) => ({
      id: error._id.toString(),
      timestamp: error.timestamp.toISOString(),
      level: error.level,
      message: error.message,
      stack: error.stack,
      userId: error.userId,
      endpoint: error.endpoint,
      method: error.method,
      statusCode: error.statusCode,
      userAgent: error.userAgent,
      ip: error.ip,
      sessionId: error.sessionId,
      tags: error.tags,
      metadata: error.metadata,
    }));

    return void res.status(200).json({
      success: true,
      errors: formattedErrors,
      stats: stats,
    });
  } catch (e: any) {
    console.error('Server errors fetch error:', e);
    return void res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: e?.message,
    });
  }
};
