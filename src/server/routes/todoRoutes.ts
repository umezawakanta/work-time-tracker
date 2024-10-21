import express from 'express';
import { TodoItem, ITodoItem } from '../models/TodoItem.js';

const router = express.Router();

// GET all todos
router.get('/', async (_req, res) => {
  try {
    const todos = await TodoItem.find().sort({ completed: 1, isPrioritized: -1, priority: 1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos', error });
  }
});

// POST new todo
router.post('/', async (req, res) => {
  try {
    const { task, priority, isPrioritized } = req.body;
    const newTodo = new TodoItem({ task, completed: false, completedDate: null, priority, isPrioritized });
    const savedTodo = await newTodo.save();
    res.status(201).json({ message: 'Todo created successfully', todo: savedTodo });
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo', error });
  }
});

// PUT update todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.completed && !updates.completedDate) {
      updates.completedDate = new Date();
    } else if (!updates.completed) {
      updates.completedDate = null;
    }
    const updatedTodo = await TodoItem.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo updated successfully', todo: updatedTodo });
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo', error });
  }
});

// DELETE todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await TodoItem.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo', error });
  }
});

// Reset all todos
router.post('/reset', async (_req, res) => {
  try {
    await TodoItem.updateMany({}, { completed: false, completedDate: null, isPrioritized: false });
    const todos = await TodoItem.find().sort({ priority: 1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error resetting todos', error });
  }
});

// Reorder todos
router.post('/reorder', async (req, res) => {
  try {
    const { items } = req.body as { items: Array<ITodoItem> };
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { priority: item.priority } }
      }
    }));
    await TodoItem.bulkWrite(bulkOps);
    const updatedTodos = await TodoItem.find().sort({ completed: 1, isPrioritized: -1, priority: 1 });
    res.json({ message: 'Todos reordered successfully', todos: updatedTodos });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering todos', error });
  }
});

// Toggle priority
router.post('/:id/toggle-priority', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await TodoItem.findById(id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    todo.isPrioritized = !todo.isPrioritized;
    const updatedTodo = await todo.save();
    res.json({ message: 'Todo priority toggled successfully', todo: updatedTodo });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling todo priority', error });
  }
});

export default router;