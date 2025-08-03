// Very simple server for todo API
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// POST todos
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

app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Todos: http://localhost:${PORT}/api/todos`);
});
