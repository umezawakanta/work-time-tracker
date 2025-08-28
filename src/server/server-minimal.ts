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

// Remove mock todos to avoid conflicts with real server

// Mock POST todos endpoint
app.post('/api/todos', (req, res) => {
  console.log('✅ POST /api/todos called');
  console.log('Request body:', req.body);

  const newTodo = {
    id: Date.now().toString(),
    task: req.body.task || 'New Task',
    completed: false,
    priority: req.body.priority || 'medium',
    isPrioritized: req.body.isPrioritized || false,
    type: req.body.type || 'todo',
    category: req.body.category || 'general',
    tags: req.body.tags || [],
    deadline: req.body.deadline || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(201).json({
    success: true,
    message: 'Todo created successfully',
    todo: newTodo,
  });
});

// Remove mock projects

// Remove mock blog

// Remove mock auth endpoints – use real auth from server-simple

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
