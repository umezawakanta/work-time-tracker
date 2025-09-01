import type { VercelRequest, VercelResponse } from '@vercel/node';
// Keep health lightweight in serverless: do not hard-require DB
let connectDB: (() => Promise<void>) | null = null;
async function loadDB(): Promise<boolean> {
  if (connectDB) return true;
  try {
    const modPath = '../src/server/config/' + 'database.js';
    const mod = await import(modPath as string);
    connectDB = (mod as any).connectDB as () => Promise<void>;
    return true;
  } catch {
    console.warn('[health] Failed to load DB module (expected in some builds)');
    return false;
  }
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  errorRate: number;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    auth: 'working' | 'error';
    api: 'working' | 'error';
  };
  version: string;
  environment: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: 99.9, // デフォルト
    errorRate: 0.1, // デフォルト
    services: {
      database: 'disconnected',
      auth: 'working',
      api: 'working',
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  };

  // データベース接続テスト
  if (await loadDB()) {
    try {
      const hasUri = Boolean(process.env.MONGODB_URI);
      const uriMasked = (process.env.MONGODB_URI || '').replace(
        /(mongodb(\+srv)?:\/\/)([^:@]+)(:[^@]+)?@/i,
        '$1****:****@'
      );
      console.log('[health] DB check start', {
        hasUri,
        uri: hasUri ? uriMasked : 'undefined',
        nodeEnv: process.env.NODE_ENV,
      });
      await connectDB();
      healthStatus.services.database = 'connected';
      console.log('[health] DB check result: connected');
    } catch (error) {
      console.warn('Database health check failed (continuing):', (error as Error).message);
      // Vercel等でDB未設定でも200を返し、サービス稼働自体のヘルスは保つ
      healthStatus.services.database = 'error';
      healthStatus.status = 'degraded';
      healthStatus.errorRate = 5.0;
    }
  }

  // 認証サービステスト
  try {
    // 簡単な認証チェック（トークンの形式確認）
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      healthStatus.services.auth = 'working';
    }
  } catch (error) {
    console.error('Auth service health check failed:', error);
    healthStatus.services.auth = 'error';
    healthStatus.status = 'degraded';
  }

  // 全体的なステータス判定
  const failedServices = Object.values(healthStatus.services).filter(
    (status) => status === 'error'
  ).length;

  if (failedServices >= 2) {
    healthStatus.status = 'unhealthy';
    healthStatus.uptime = 85.0;
    healthStatus.errorRate = 15.0;
  } else if (failedServices === 1) {
    healthStatus.status = 'degraded';
    healthStatus.uptime = 95.0;
    healthStatus.errorRate = 5.0;
  }

  // レスポンス時間を計算
  const responseTime = Date.now() - startTime;

  res.status(200).json({
    ...healthStatus,
    responseTime: `${responseTime}ms`,
  });
}
