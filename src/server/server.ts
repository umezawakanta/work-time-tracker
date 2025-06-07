// ESM用のCommonJSモジュールのインポート
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const express = require('express');
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http'; // HTTPサーバーを使用
import { connectDB } from './config/database.js';
import workTimeRoutes from './routes/workTimeRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import userSubscriptionRoutes from './routes/userSubscriptionRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import sleepTrackerRoutes from './routes/sleepTrackerRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import tweetRoutes from './routes/tweetRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import surveyRoutes from './routes/surveyRoutes.js';
import partyRoutes from './routes/partyRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js'; // 通知ルートをインポート
import { setupWebSocketServer } from './services/webSocketService.js'; // WebSocketサービスをインポート
import wbsRoutes from './routes/wbsRoutes.js';
import implementationRoutes from './routes/implementationRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import abstinenceRoutes from './routes/abstinenceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// HTTPサーバーを作成（WebSocketと共用するため）
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 詳細ログを追加
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
  console.log('Origin:', req.get('Origin') || 'No origin');
  console.log('User-Agent:', req.get('User-Agent'));
  console.log('Content-Type:', req.get('Content-Type') || 'No content-type');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('=== END REQUEST LOG ===\n');
  next();
});

app.use(express.json({ limit: '10mb' }));
// helmet を一時的に無効化
// app.use(helmet());
app.use(morgan('combined'));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 静的ファイルの提供
app.use('/uploads', express.static(uploadsDir));

// WebSocketサーバーのセットアップ
const wsService = setupWebSocketServer(server);
// グローバルに利用できるようにする（通知サービスなどから利用可能に）
app.set('wsService', wsService);

// Routes の前に追加
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// Routes の前に追加で基本テスト
app.get('/test', (req: Request, res: Response) => {
  console.log('*** TEST ENDPOINT HIT ***');
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
  });
});

// 基本的なPOSTテストも追加
app.post('/test', (req: Request, res: Response) => {
  console.log('*** POST TEST ENDPOINT HIT ***');
  console.log('POST Body:', req.body);
  res.json({
    message: 'POST is working!',
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Routes
console.log('Setting up API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/worktime', workTimeRoutes);
app.use('/api/asset', assetRoutes);
app.use('/api/debt', debtRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/userSubscription', userSubscriptionRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/sleep-records', sleepTrackerRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes); // 通知APIルートを追加
app.use('/api/wbs', wbsRoutes); // 追加
app.use('/api/implementation', implementationRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/abstinence', abstinenceRoutes);

// Not Found middleware
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Resource not found' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response): void => {
  console.error('=== Global Error Handler ===');
  console.error('Error type:', err.constructor.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', _req.url);
  console.error('Request method:', _req.method);
  console.error('Request body:', JSON.stringify(_req.body, null, 2));
  console.error('=== End Global Error Handler ===');

  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
    errorType: err.constructor.name,
  });
});

// 環境変数の確認
console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('=== End Environment Check ===');

const PORT = process.env.PORT || 3001;
// app.listen()ではなくserver.listen()を使用
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is also running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});

export default app;
