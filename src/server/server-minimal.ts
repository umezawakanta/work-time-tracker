// Minimal API Server for Work Time Tracker
import express from 'express';
import cors from 'cors';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// 強化されたCORS設定
app.use(
  cors({
    origin: true, // 全オリジン許可
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

// 追加のCORSヘッダー設定
app.use((req, res, next) => {
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

// Handle explicit OPTIONS requests
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Work Time Tracker API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mock todos endpoint
app.get('/api/todos', (req, res) => {
  console.log('✅ GET /api/todos called');
  res.json([
    {
      id: '1',
      task: 'サンプルタスク1',
      completed: false,
      priority: 1,
      isPrioritized: true,
      type: 'todo',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      task: 'サンプルタスク2',
      completed: true,
      priority: 2,
      isPrioritized: false,
      type: 'todo',
      createdAt: new Date().toISOString(),
    },
  ]);
});

// Mock projects endpoint
app.get('/api/projects', (req, res) => {
  console.log('✅ GET /api/projects called');
  res.json({
    success: true,
    data: [
      {
        id: 'project-1',
        name: 'Work Time Tracker',
        description: 'ADHD/ASD特化の勤怠管理システム',
        status: 'active',
        progress: 95,
        startDate: '2025-01-01',
        endDate: '2025-02-28',
        technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      },
    ],
    message: 'Projects loaded successfully',
  });
});

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('✅ POST /api/auth/login called');
  res.json({
    success: true,
    token: 'demo-jwt-token',
    user: {
      id: 'user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
    },
  });
});

app.get('/api/auth/check', (req, res) => {
  console.log('✅ GET /api/auth/check called');
  res.json({
    success: true,
    user: {
      id: 'user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message || 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log('🎉 Work Time Tracker API Server');
  console.log('🚀 ================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Todos API: http://localhost:${PORT}/api/todos`);
  console.log(`✅ Projects API: http://localhost:${PORT}/api/projects`);
  console.log(`✅ Auth API: http://localhost:${PORT}/api/auth/check`);
  console.log('🚀 ================================');
  console.log('🎊 All APIs ready for frontend!');
  console.log('🚀 ================================');
});

export default app;
