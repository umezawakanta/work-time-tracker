// Keep health lightweight in serverless: avoid ESM imports/exports at top-level (CJS runtime)
declare function __non_esm_import__(path: string): any;
const nonEsmImport: (p: string) => any = (p: string) =>
  (Function('return import(p)') as any)({ p }).catch(() =>
    (globalThis as any).require ? (globalThis as any).require(p) : null
  );

async function getMongoLib() {
  // Prefer dynamic import; fallback to require when available
  try {
    const mod = await import('./_lib/mongo.js');
    return {
      connectMongoDirect: (mod as any).connectMongoDirect as () => Promise<void>,
      maskMongoUri: (mod as any).maskMongoUri as (uri?: string) => string,
      mongoose: (mod as any).mongoose,
    };
  } catch {
    const mod: any = (globalThis as any).require
      ? (globalThis as any).require('./_lib/mongo')
      : null;
    return {
      connectMongoDirect: mod.connectMongoDirect,
      maskMongoUri: mod.maskMongoUri,
      mongoose: mod.mongoose,
    };
  }
}
let connectDB: (() => Promise<void>) | null = null;
console.warn('[health] connectDB:', connectDB);
async function loadDB(): Promise<boolean> {
  console.warn('[health] loadDB:', connectDB);
  if (connectDB) return true;
  console.warn('[health] loadDB:', connectDB);
  try {
    const modPath = '../src/server/config/' + 'database.js';
    console.warn('[health] loadDB:', modPath);
    const mod = await import(modPath as string);
    console.warn('[health] loadDB:', mod);
    connectDB = (mod as any).connectDB as () => Promise<void>;
    console.warn('[health] loadDB:', connectDB);
    return true;
  } catch (e) {
    const err: any = e;
    console.warn('[health] Failed to load DB module (expected in some builds)', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    });
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

async function handler(req: any, res: any) {
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
  const loaded = await loadDB();
  console.warn('[health] loaded:', loaded);
  if (loaded) {
    try {
      const hasUri = Boolean(process.env.MONGODB_URI);
      console.warn('[health] hasUri:', hasUri);
      const { connectMongoDirect, maskMongoUri } = await getMongoLib();
      const uriMasked = maskMongoUri(process.env.MONGODB_URI);
      console.warn('[health] uriMasked:', uriMasked);
      console.log('[health] DB check start', {
        hasUri,
        uri: hasUri ? uriMasked : 'undefined',
        nodeEnv: process.env.NODE_ENV,
        vercel: Boolean(process.env.VERCEL),
        region: process.env.VERCEL_REGION || process.env.AWS_REGION || 'unknown',
      });
      await connectDB();
      console.warn('[health] connectDB: success');
      healthStatus.services.database = 'connected';
      console.log('[health] DB check result: connected');
    } catch (error) {
      const err: any = error;
      console.warn('[health] Primary DB connect failed, trying direct mongo connect:', err);
      console.warn('[health] Primary DB connect failed, trying direct mongo connect', {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        reasonCode: err?.reason?.code,
        reasonMessage: err?.reason?.message,
        labels: err?.errorLabels,
      });
      try {
        const { connectMongoDirect } = await getMongoLib();
        console.warn('[health] connectMongoDirect:');
        await connectMongoDirect();
        console.warn('[health] connectMongoDirect: success');
        healthStatus.services.database = 'connected';
        console.warn('[health] connectMongoDirect: success');
        console.log('[health] DB check result: connected (direct)');
      } catch (e2) {
        const err2: any = e2;
        console.warn('[health] connectMongoDirect: error');
        console.warn('[health] Database health check failed (continuing)', {
          name: err2?.name,
          message: err2?.message,
          code: err2?.code,
          reasonCode: err2?.reason?.code,
          reasonMessage: err2?.reason?.message,
          labels: err2?.errorLabels,
        });
        console.warn('[health] connectMongoDirect: error');
        healthStatus.services.database = 'error';
        console.warn('[health] connectMongoDirect: error');
        healthStatus.status = 'degraded';
        console.warn('[health] connectMongoDirect: error');
        healthStatus.errorRate = 5.0;
        console.warn('[health] connectMongoDirect: error');
      }
    }
  } else {
    // Server DB module unavailable → try direct connect path
    console.warn('[health] DB module unavailable; attempting direct mongo connect');
    try {
      const { connectMongoDirect } = await getMongoLib();
      await connectMongoDirect();
      healthStatus.services.database = 'connected';
      console.log('[health] DB check result: connected (direct: no module)');
    } catch (e3) {
      const err3: any = e3;
      console.warn('[health] Direct connect failed (no module)', {
        name: err3?.name,
        message: err3?.message,
        code: err3?.code,
        reasonCode: err3?.reason?.code,
        reasonMessage: err3?.reason?.message,
        labels: err3?.errorLabels,
      });
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

module.exports = handler;
