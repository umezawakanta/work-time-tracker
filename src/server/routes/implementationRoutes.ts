import express, { Request, Response, NextFunction } from 'express';
import { ImplementationTask } from '../models/ImplementationTask.js';
import { ImplementationLog } from '../models/ImplementationLog.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

interface TaskUpdateData {
  status: string;
  updatedAt: Date;
  completedDate?: Date;
}

// GET /api/implementation/tasks/:projectId - プロジェクトのタスク一覧取得
router.get(
  '/tasks/:projectId',
  // authMiddleware, // Disabled for development
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const tasks = await ImplementationTask.find({ projectId }).sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/implementation/tasks - 新しいタスクを作成
router.post(
  '/tasks',
  // authMiddleware, // Disabled for development
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskData = {
        ...req.body,
        createdBy: req.user?.id,
      };

      const newTask = new ImplementationTask(taskData);
      const savedTask = await newTask.save();

      res.status(201).json(savedTask);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/implementation/tasks/:taskId - タスクを更新
router.put(
  '/tasks/:taskId',
  // authMiddleware, // Disabled for development
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const updates = req.body;

      const updatedTask = await ImplementationTask.findByIdAndUpdate(
        taskId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/implementation/tasks/:taskId/status - タスクステータスを更新
router.put(
  '/tasks/:taskId/status',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { status } = req.body as { status: string };

      const updateData: TaskUpdateData = { status, updatedAt: new Date() };
      if (status === 'completed') {
        updateData.completedDate = new Date();
      }

      const updatedTask = await ImplementationTask.findByIdAndUpdate(taskId, updateData, {
        new: true,
      });

      if (!updatedTask) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/implementation/tasks/:taskId/checklist/:checklistId - チェックリスト項目を更新
router.put(
  '/tasks/:taskId/checklist/:checklistId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId, checklistId } = req.params;
      const { completed } = req.body;
      const isCompleted = Boolean(completed);

      const task = await ImplementationTask.findById(taskId);
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      const checklistItem = task.checklist.find((item) => item.id === checklistId);
      if (!checklistItem) {
        res.status(404).json({ message: 'Checklist item not found' });
        return;
      }

      checklistItem.completed = isCompleted;
      if (isCompleted) {
        checklistItem.completedAt = new Date().toISOString();
      } else {
        checklistItem.completedAt = undefined;
      }

      await task.save();

      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/implementation/logs/:projectId - プロジェクトのログ一覧取得
router.get(
  '/logs/:projectId',
  // authMiddleware, // Disabled for development
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { limit = 50 } = req.query;

      const logs = await ImplementationLog.find({ projectId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit as string));

      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/implementation/logs - 新しいログを追加
router.post(
  '/logs',
  // authMiddleware, // Disabled for development
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logData = {
        ...req.body,
        userId: req.user?.id,
        timestamp: new Date(),
      };

      const newLog = new ImplementationLog(logData);
      const savedLog = await newLog.save();

      res.status(201).json(savedLog);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
