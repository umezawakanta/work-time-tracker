import * as express from 'express';
import { Request, Response } from 'express';
import { TodoItem, ITodoItem } from '../models/TodoItem.js';
import { TodoHistory } from '../models/TodoHistory.js';
import { TodoArchive } from '../models/TodoArchive.js';
import TodoWBSIntegrationService from '../../services/integration/TodoWBSIntegrationService.js';

const router = express.Router();

// GET all todos
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const todos = await TodoItem.find().sort({ completed: 1, isPrioritized: -1, priority: 1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos', error });
  }
});

// POST new todo
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { task, priority, isPrioritized, type, deadline, tags, category } = req.body;
    const newTodo = new TodoItem({
      task,
      completed: false,
      completedDate: null,
      priority,
      isPrioritized,
      type: type || 'input',
      deadline: deadline || null,
      tags: tags || [],
      category: category || '',
    });
    const savedTodo = await newTodo.save();

    // WBS連携を実行
    try {
      await TodoWBSIntegrationService.handleTodoCreation(
        {
          _id: savedTodo.id,
          task: savedTodo.task,
          type: savedTodo.type,
          completed: savedTodo.completed,
          priority: savedTodo.priority,
          isPrioritized: savedTodo.isPrioritized,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedDate: null,
          deadline: savedTodo.deadline ? savedTodo.deadline.toISOString() : undefined,
          tags: savedTodo.tags,
          priorityLevel: 'medium',
        },
        typeof req.body.userId === 'string' ? req.body.userId : 'default-user'
      );
    } catch (wbsError) {
      console.error('WBS integration failed:', wbsError);
      // WBS連携が失敗してもToDoの作成は成功とする
    }

    res.status(201).json({ message: 'Todo created successfully', todo: savedTodo });
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo', error });
  }
});

// PUT update todo
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
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
      res.status(404).json({ message: 'Todo not found' });
      return;
    }

    // WBS同期を実行
    await TodoWBSIntegrationService.syncTodoToWBS({
      _id: updatedTodo.id,
      task: updatedTodo.task,
      type: updatedTodo.type,
      completed: updatedTodo.completed,
      priority: updatedTodo.priority,
      isPrioritized: updatedTodo.isPrioritized,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedDate: updatedTodo.completedDate ? updatedTodo.completedDate.toISOString() : null,
      deadline: updatedTodo.deadline ? updatedTodo.deadline.toISOString() : undefined,
      tags: updatedTodo.tags,
      priorityLevel: 'medium',
    });

    res.json({ message: 'Todo updated successfully', todo: updatedTodo });
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo', error });
  }
});

// DELETE todo
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTodo = await TodoItem.findByIdAndDelete(id);
    if (!deletedTodo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo', error });
  }
});

// Reset todos but preserve history
router.post('/reset', async (_req: Request, res: Response): Promise<void> => {
  try {
    // 完了したタスクを見つける
    const completedTodos = await TodoItem.find({ completed: true });

    // 完了したタスクの数をカウント
    const completedCount = completedTodos.length;

    // 履歴データを保存
    if (completedCount > 0) {
      const today = new Date().toISOString().split('T')[0];

      // 今日の日付のデータがすでに存在するか確認
      const existingHistory = await TodoHistory.findOne({ date: today });

      if (existingHistory) {
        // 既存のデータを更新
        existingHistory.completedCount += completedCount;
        existingHistory.taskDetails.push(
          ...completedTodos.map((todo) => ({
            task: todo.task,
            completedDate: todo.completedDate,
          }))
        );
        await existingHistory.save();
      } else {
        // 新しい履歴レコードを作成
        await TodoHistory.create({
          date: today,
          completedCount: completedCount,
          taskDetails: completedTodos.map((todo) => ({
            task: todo.task,
            completedDate: todo.completedDate,
          })),
        });
      }
    }

    // 完了したタスクをアーカイブとしてマーク
    const todosToArchive = await TodoItem.find({ completed: true });
    for (const todo of todosToArchive) {
      // ArchiveCollectionに保存
      await TodoArchive.create({
        originalId: todo._id,
        task: todo.task,
        completed: true,
        completedDate: todo.completedDate,
        priority: todo.priority,
        isPrioritized: todo.isPrioritized,
        type: todo.type,
        deadline: todo.deadline ? todo.deadline.toISOString() : undefined,
        archivedAt: new Date(),
      });

      // 元のタスクを削除
      await TodoItem.findByIdAndDelete(todo._id);
    }

    // 未完了のタスクはそのまま残す
    const activeTodos = await TodoItem.find({
      completed: false,
    }).sort({ isPrioritized: -1, priority: 1 });

    res.json(activeTodos);
  } catch (error) {
    res.status(500).json({ message: 'Error resetting todos', error });
  }
});

// 履歴データ取得のためのエンドポイントを追加
router.get('/history', async (_req: Request, res: Response): Promise<void> => {
  try {
    // 過去30日分の履歴を取得
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const history = await TodoHistory.find({
      date: { $gte: thirtyDaysAgoStr },
    }).sort({ date: 1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todo history', error });
  }
});

// 日別のTodo完了数を取得するエンドポイント（グラフ用）
router.get('/history/daily', async (_req: Request, res: Response): Promise<void> => {
  try {
    // 過去30日分の集計データを取得
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const history = await TodoHistory.find({
      date: { $gte: thirtyDaysAgoStr },
    }).sort({ date: 1 });

    // 日付ごとの完了数を集計 - provide initial value and use proper types
    const dailyCounts: DailyCounts = history.reduce((acc: DailyCounts, item) => {
      acc[item.date] = item.completedCount;
      return acc;
    }, {} as DailyCounts);

    // 日付の配列を生成（過去30日間の全日付）
    const allDates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      allDates.unshift(dateStr);
    }

    // 結果フォーマット
    const result = allDates.map((date) => ({
      date: date,
      count: dailyCounts[date] || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily history', error });
  }
});

// Reorder todos
router.post('/reorder', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body as { items: Array<ITodoItem> };
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { priority: item.priority } },
      },
    }));
    await TodoItem.bulkWrite(bulkOps);
    const updatedTodos = await TodoItem.find().sort({
      completed: 1,
      isPrioritized: -1,
      priority: 1,
    });
    res.json({ message: 'Todos reordered successfully', todos: updatedTodos });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering todos', error });
  }
});

// Toggle priority
router.post('/:id/toggle-priority', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const todo = await TodoItem.findById(id);
    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }
    todo.isPrioritized = !todo.isPrioritized;
    const updatedTodo = await todo.save();
    res.json({ message: 'Todo priority toggled successfully', todo: updatedTodo });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling todo priority', error });
  }
});

// Define proper types for the aggregation result
interface DailyCounts {
  [date: string]: number;
}

export default router;
