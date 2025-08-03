// Enhanced simple server for todo API with proper error handling
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ status: 'OK', message: 'Simple server running' });
});

// GET todos
app.get('/api/todos', (req, res) => {
  console.log('✅ GET /api/todos called');
  res.json([
    {
      id: '1',
      task: 'サンプルタスク1',
      completed: false,
      priority: 'high',
      isPrioritized: true,
      type: 'todo',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      task: 'サンプルタスク2',
      completed: false,
      priority: 'medium',
      isPrioritized: false,
      type: 'todo',
      createdAt: new Date().toISOString(),
    },
  ]);
});

// Debug endpoint to test connectivity
app.get('/api/debug', (req, res) => {
  console.log('🔍 Debug endpoint called');
  res.json({
    success: true,
    message: 'Debug endpoint working',
    server: 'server-simple.ts',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    query: req.query,
  });
});

// POST todos
app.post('/api/todos', (req, res) => {
  console.log('✅ POST /api/todos called');
  console.log('📨 Request headers:', req.headers);
  console.log('📝 Request body:', req.body);
  console.log('🌐 Request origin:', req.get('origin'));

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

// 404 Error handler - must be after all routes
app.use((req: Request, res: Response): void => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('🚨 Global Error Handler:');
  console.error('Error:', err);
  console.error('Request:', req.method, req.url);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Route debugging - log all registered routes
console.log('\n🗺️  Registered Routes:');
console.log('   GET  /api/health');
console.log('   GET  /api/debug');
console.log('   GET  /api/todos');
console.log('   POST /api/todos');

app.listen(PORT, () => {
  console.log(`\n✅ Enhanced server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Todos: http://localhost:${PORT}/api/todos`);
  console.log('🔍 Debug mode enabled - detailed logging active\n');
});
