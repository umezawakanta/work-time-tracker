// Generate test error for error monitoring testing
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return void res.status(200).end();
  if (req.method !== 'POST')
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

    // MongoDB接続
    const mongoLib = require('../_lib/mongo');
    await mongoLib.connectMongoDirect();
    const mongoose = await mongoLib.getMongoose();

    // エラーログスキーマを取得
    const { getErrorLogModel } = require('../_schemas/errorLog');
    const ErrorLog = getErrorLogModel();

    // テストエラーを生成
    const testErrors = [
      {
        level: 'error',
        message: 'Test API error - Database connection timeout',
        stack:
          'Error: Connection timeout\n    at connectDB (/app/src/config/database.js:45:12)\n    at async handler (/app/api/test.js:23:8)',
        userId: user._id.toString(),
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 500,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip: '192.168.1.100',
        sessionId: 'test_session_' + Date.now(),
        tags: ['test', 'database', 'timeout'],
        metadata: { test: true, generatedAt: new Date().toISOString() },
      },
      {
        level: 'warn',
        message: 'Test warning - Rate limit approaching',
        stack:
          'Warning: Rate limit approaching\n    at rateLimiter (/app/src/middleware/rateLimit.js:15:8)',
        userId: user._id.toString(),
        endpoint: '/api/admin/generate-test-error',
        method: 'POST',
        statusCode: 200,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ip: '192.168.1.101',
        sessionId: 'test_session_' + Date.now(),
        tags: ['test', 'rate-limit', 'warning'],
        metadata: { test: true, generatedAt: new Date().toISOString() },
      },
      {
        level: 'error',
        message: 'Test critical error - Authentication failure',
        stack:
          'Error: Authentication failed\n    at verifyJWT (/app/src/middleware/auth.js:67:12)\n    at async handler (/app/api/protected.js:12:8)',
        userId: user._id.toString(),
        endpoint: '/api/protected',
        method: 'GET',
        statusCode: 401,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        ip: '192.168.1.102',
        sessionId: 'test_session_' + Date.now(),
        tags: ['test', 'auth', 'critical'],
        metadata: { test: true, generatedAt: new Date().toISOString() },
      },
    ];

    // エラーログを保存
    const savedErrors = await ErrorLog.insertMany(testErrors);

    return void res.status(200).json({
      success: true,
      message: 'Test errors generated successfully',
      errors: savedErrors.map((error) => ({
        id: error._id.toString(),
        level: error.level,
        message: error.message,
        timestamp: error.timestamp,
      })),
    });
  } catch (e: any) {
    console.error('Generate test error error:', e);
    return void res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: e?.message,
    });
  }
};
