// ESM用のCommonJSモジュールのインポート
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http'; // HTTPサーバーを使用
import net from 'net'; // ポート競合チェック用
import { connectDB } from './config/database.js';
// Temporarily commenting out imports to isolate the problematic route
// import workTimeRoutes from './routes/workTimeRoutes.js';
// import assetRoutes from './routes/assetRoutes.js';
// import debtRoutes from './routes/debtRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
// import candidateRoutes from './routes/candidateRoutes.js';
// import userSubscriptionRoutes from './routes/userSubscriptionRoutes.js';
// import qualityRoutes from './routes/qualityRoutes.js';
// import withdrawalRoutes from './routes/withdrawalRoutes.js';
import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import sleepTrackerRoutes from './routes/sleepTrackerRoutes.js';
// import blogRoutes from './routes/blogRoutes.js';
// import tweetRoutes from './routes/tweetRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// import surveyRoutes from './routes/surveyRoutes.js';
// import partyRoutes from './routes/partyRoutes.js';
// import habitRoutes from './routes/habitRoutes.js';
// import subscriptionRoutes from './routes/subscriptionRoutes.js';
// import projectRoutes from './routes/projectRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js'; // 通知ルートをインポート
// import { setupWebSocketServer } from './services/webSocketService.js'; // 開発環境では無効化
// import wbsRoutes from './routes/wbsRoutes.js';
// import implementationRoutes from './routes/implementationRoutes.js';
// import teamRoutes from './routes/teamRoutes.js';
// import resourceRoutes from './routes/resourceRoutes.js'; // 一時的に無効化
// import progressRoutes from './routes/progressRoutes.js';
// import abstinenceRoutes from './routes/abstinenceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// HTTPサーバーを作成（WebSocketと共用するため）
const server = http.createServer(app);

// Middleware - Enhanced CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:5173',
  'https://work-time-tracker-5d9q.vercel.app',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
];

// Dynamic CORS origin function to handle Vercel preview deployments
const corsOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  console.log(`CORS: Checking origin: ${origin || 'undefined'}`);

  // Allow requests with no origin (like mobile apps, curl requests, or proxy requests)
  if (!origin) {
    console.log('CORS: Allowing request with no origin');
    return callback(null, true);
  }

  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    console.log(`CORS: Allowing from allowed origins: ${origin}`);
    return callback(null, true);
  }

  // Allow all Vercel preview deployments for work-time-tracker
  if (origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/)) {
    console.log(`CORS: Allowing Vercel preview: ${origin}`);
    return callback(null, true);
  }

  // Allow localhost with any port for development (including proxy requests)
  if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
    console.log(`CORS: Allowing localhost: ${origin}`);
    return callback(null, true);
  }

  console.log(`CORS: Blocked origin: ${origin}`);
  callback(new Error('Not allowed by CORS'));
};

// 強化されたCORS設定を有効化 - すべてのオリジンを許可
app.use(
  cors({
    origin: true, // 開発環境では全オリジン許可
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name',
    ],
    exposedHeaders: ['X-Total-Count'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// 追加のCORSヘッダー設定（フォールバック）
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name'
  );
  res.header('Access-Control-Expose-Headers', 'X-Total-Count');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Handle explicit OPTIONS requests - 有効化
app.options('*', (req, res) => {
  console.log(`✅ OPTIONS request for: ${req.path}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name'
  );
  res.header('Access-Control-Expose-Headers', 'X-Total-Count');
  res.sendStatus(200);
});

app.use(express.json({ limit: '10mb' }));
// 詳細ログを一時的に無効化
// app.use((req: Request, res: Response, next: NextFunction) => {
//   console.log('\n=== INCOMING REQUEST ===');
//   console.log('Time:', new Date().toISOString());
//   console.log('Method:', req.method);
//   console.log('URL:', req.url);
//   console.log('Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
//   console.log('Origin:', req.get('Origin') || 'No origin');
//   console.log('User-Agent:', req.get('User-Agent'));
//   console.log('Content-Type:', req.get('Content-Type') || 'No content-type');
//   console.log('Body:', JSON.stringify(req.body, null, 2));
//   console.log('=== END REQUEST LOG ===\n');
//   next();
// });

// helmet を一時的に無効化
// app.use(helmet());
// app.use(morgan('combined')); // 一時的に無効化

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
connectDB();

// Create uploads directory if it doesn't exist - 一時的に無効化
// const uploadsDir = path.join(__dirname, '../../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// 静的ファイルの提供 - 一時的に無効化
// app.use('/uploads', express.static(uploadsDir));

// WebSocketサーバーのセットアップ（開発環境では無効化）
if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  // const wsService = setupWebSocketServer(server);
  // app.set('wsService', wsService);
  console.log('WebSocket server skipped (Development environment)');
} else {
  console.log('WebSocket server skipped (Development environment)');
}

// Routes の前に追加
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// API Health Check エンドポイント
app.get('/api/health', (req: Request, res: Response) => {
  console.log('*** API HEALTH CHECK ***');
  res.json({
    status: 'OK',
    message: 'Work Time Tracker API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    platform: process.env.VERCEL ? 'Vercel Functions' : 'Node.js Server',
    endpoint: req.url,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// 詳細システム情報
app.get('/api/status', (req: Request, res: Response) => {
  console.log('*** API STATUS CHECK ***');
  res.json({
    api: {
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
    server: {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: `${Math.floor(process.uptime())} seconds`,
      environment: process.env.NODE_ENV || 'development',
      runtime: process.env.VERCEL ? 'Vercel Functions' : 'Node.js Server',
      isVercel: !!process.env.VERCEL,
    },
    database: {
      connected: true, // この値は実際のDB接続状態に応じて動的に設定
      uri: process.env.MONGODB_URI ? 'Connected' : 'Not configured',
    },
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      blog: '/api/blog',
      worktime: '/api/worktime',
      test: '/api/test',
    },
    cors: {
      enabled: true,
      origins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    },
  });
});

// API テストエンドポイント
app.get('/api/test', (req: Request, res: Response) => {
  console.log('*** API TEST ENDPOINT HIT ***');
  res.json({
    success: true,
    message: 'API Test endpoint is working!',
    timestamp: new Date().toISOString(),
    requestInfo: {
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.get('User-Agent'),
        origin: req.get('Origin'),
        authorization: req.get('Authorization') ? 'Present' : 'Not present',
      },
    },
    serverInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// POST テスト
app.post('/api/test', (req: Request, res: Response) => {
  console.log('*** API POST TEST ENDPOINT HIT ***');
  console.log('POST Body:', req.body);
  res.json({
    success: true,
    message: 'API POST test is working!',
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// 認証テスト（トークンなしでもアクセス可能）
app.get('/api/test/auth', (req: Request, res: Response) => {
  const authHeader = req.get('Authorization');
  res.json({
    message: 'Auth test endpoint',
    hasAuthHeader: !!authHeader,
    authHeader: authHeader ? 'Bearer token present' : 'No token',
    timestamp: new Date().toISOString(),
  });
});

// 基本テスト（ルートレベル）
app.get('/test', (req: Request, res: Response) => {
  console.log('*** ROOT TEST ENDPOINT HIT ***');
  res.json({
    message: 'Root test endpoint working!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
  });
});

// Routes - 段階的に有効化してエラー箇所を特定
console.log('Setting up API routes...');

try {
  // 1つずつテストして問題のあるルートを特定
  console.log('🔍 Testing individual routes...');

  // 一時的にprogress routesを無効化して最小構成でテスト
  console.log('✅ Loading minimal test route...');
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });

  console.log('✅ Progress routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
}

// Temporarily test with no routes at all
console.log('✅ Loading essential routes - auth and todos');

// Essential routes for TODO app
try {
  console.log('📝 Loading auth routes...');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded successfully');

  console.log('📝 Loading todo routes...');
  app.use('/api/todos', todoRoutes);
  console.log('✅ Todo routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading essential routes:', error);
}

// 以下は一時的に無効化
// app.use('/api/asset', assetRoutes);
// app.use('/api/debt', debtRoutes);
// app.use('/api/candidates', candidateRoutes);
// app.use('/api/subscription', subscriptionRoutes);
// app.use('/api/userSubscription', userSubscriptionRoutes);
// app.use('/api/withdrawal', withdrawalRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/sleep-records', sleepTrackerRoutes);
// app.use('/api/blog', blogRoutes);
// app.use('/api/tweets', tweetRoutes);
// app.use('/api/surveys', surveyRoutes);
// app.use('/api/parties', partyRoutes);
// app.use('/api/habits', habitRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/wbs', wbsRoutes);
// app.use('/api/implementation', implementationRoutes);
// app.use('/api/team', teamRoutes);
// app.use('/api/resources', resourceRoutes); // 一時的に無効化
// app.use('/api/quality', qualityRoutes);
// app.use('/api/abstinence', abstinenceRoutes);

// Not Found middleware - 一時的に無効化
// app.use((_req: Request, res: Response): void => {
//   res.status(404).json({ message: 'Resource not found' });
// });

// Error handling middleware - 一時的に無効化
// app.use((err: Error, _req: Request, res: Response): void => {
//   console.error('=== Global Error Handler ===');
//   console.error('Error type:', err.constructor.name);
//   console.error('Error message:', err.message);
//   console.error('Error stack:', err.stack);
//   console.error('Request URL:', _req.url);
//   console.error('Request method:', _req.method);
//   console.error('Request body:', JSON.stringify(_req.body, null, 2));
//   console.error('=== End Global Error Handler ===');

//   res.status(500).json({
//     message: 'Something went wrong!',
//     error: err.message,
//     errorType: err.constructor.name,
//   });
// });

// 環境変数の確認
console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('=== End Environment Check ===');

const BASE_PORT = process.env.PORT || 3001;
const PORT = typeof BASE_PORT === 'string' ? parseInt(BASE_PORT, 10) : BASE_PORT;

// Vercel環境の場合はサーバーを起動しない（Functionsとして動作）
if (process.env.VERCEL) {
  console.log('Running in Vercel Functions mode');
} else {
  // ポート使用可能性チェック関数（改良版）
  const findAvailablePort = (startPort: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const tryPort = (port: number) => {
        // 独立したテスト用サーバーを作成
        const testServer = net.createServer();

        testServer.listen(port, () => {
          testServer.close(() => {
            resolve(port);
          });
        });

        testServer.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}...`);
            if (port < startPort + 10) {
              // 最大10ポート試行
              tryPort(port + 1);
            } else {
              reject(new Error(`No available port found after trying ${startPort} to ${port}`));
            }
          } else {
            reject(err);
          }
        });
      };

      tryPort(startPort);
    });
  };

  // 利用可能なポートを見つけてサーバー開始
  findAvailablePort(PORT)
    .then((availablePort) => {
      // メインサーバーを指定ポートで開始
      server.listen(availablePort, () => {
        console.log(`✅ Server is running on port ${availablePort}`);
        // console.log(`✅ WebSocket server is also running on port ${availablePort}`); // 一時的に無効化
        // console.log(`📁 Uploads directory: ${uploadsDir}`); // 一時的に無効化

        if (availablePort !== PORT) {
          console.log(
            `⚠️  Note: Requested port ${PORT} was in use, using port ${availablePort} instead`
          );
        }
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });
}

export default app;
