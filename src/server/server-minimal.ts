// Minimal API Server for Work Time Tracker
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

console.log('🔍 Starting minimal server setup...');

// Basic middleware
app.use(express.json());

// Apply CORS headers - Express-compatible version
app.use((req, res, next) => {
  // 許可するオリジンを設定
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://work-time-tracker.vercel.app',
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, stripe-signature'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS preflight request for ${req.path} from ${origin || 'unknown'}`);
    res.sendStatus(200);
  } else {
    console.log(`🌐 ${req.method} ${req.path} from ${origin || 'no-origin'}`);
    next();
  }
});

console.log('✅ Basic middleware with robust CORS configured');

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

// Mock blog endpoint
app.get('/api/blog', (req, res) => {
  console.log('✅ GET /api/blog called');
  res.json([
    {
      id: 'blog-1',
      title: 'ADHD/ASD特化の生産性向上術',
      excerpt: 'ADHD・ASDの特性を活かした効率的な作業方法について解説します。',
      content: 'ADHDやASDの方々が直面する課題を理解し、それらを強みに変える方法を紹介します...',
      author: 'Work Time Tracker Team',
      publishedAt: '2025-01-30T10:00:00Z',
      tags: ['ADHD', 'ASD', '生産性', 'ライフハック'],
      category: 'productivity',
      status: 'published',
    },
    {
      id: 'blog-2',
      title: 'タスク管理の基本とコツ',
      excerpt: '効果的なタスク管理でより良い日常を送るためのテクニック集です。',
      content:
        'タスクを適切に分割し、優先順位をつけることで、ストレスを減らしながら生産性を向上させる方法...',
      author: 'Work Time Tracker Team',
      publishedAt: '2025-01-29T14:30:00Z',
      tags: ['タスク管理', '時間管理', '効率化'],
      category: 'task-management',
      status: 'published',
    },
    {
      id: 'blog-3',
      title: 'リモートワークでの集中力維持法',
      excerpt: '在宅勤務やリモートワークで集中力を保つための実践的なアドバイス。',
      content: '自宅での作業環境を整え、集中力を持続させるための具体的な方法をご紹介します...',
      author: 'Work Time Tracker Team',
      publishedAt: '2025-01-28T09:15:00Z',
      tags: ['リモートワーク', '集中力', '環境整備'],
      category: 'remote-work',
      status: 'published',
    },
  ]);
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
  console.log(`✅ Blog API: http://localhost:${PORT}/api/blog`);
  console.log(`✅ Auth API: http://localhost:${PORT}/api/auth/check`);
  console.log('🚀 ================================');
  console.log('🎊 All APIs ready for frontend!');
  console.log('🚀 ================================');
});

export default app;
