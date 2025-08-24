import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { WorkTimeEntry, IWorkTimeEntry } from '../models/WorkTimeEntry.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const validateWorkTimeEntry = [
  body('projectName').notEmpty().withMessage('プロジェクト名は必須です'),
  body('startTime')
    .isISO8601()
    .toDate()
    .withMessage('開始時間は有効なISO8601形式である必要があります'),
  body('endTime')
    .isISO8601()
    .toDate()
    .withMessage('終了時間は有効なISO8601形式である必要があります'),
  body('description').optional().isString(),
  body('duration').isInt().withMessage('期間は整数である必要があります'),
  body('date').isISO8601().toDate().withMessage('日付は有効なISO8601形式である必要があります'),
];

// 全ての作業時間エンドポイントに認証を追加
router.use(authMiddleware);

router.post(
  '/',
  validateWorkTimeEntry,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: '入力データが無効です', errors: errors.array() });
      return;
    }

    try {
      // ユーザーIDを認証情報から取得
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }

      const workTimeData: IWorkTimeEntry = new WorkTimeEntry({
        ...req.body,
        userId, // ユーザーIDを追加
      });

      const savedWorkTime = await workTimeData.save();
      res.status(201).json({
        message: '作業時間が正常に記録されました',
        workTime: savedWorkTime,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }

    // ユーザー固有の作業時間を取得
    const workTimes = await WorkTimeEntry.find({ userId }).sort({ createdAt: -1 });
    res.json(workTimes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workTime = await WorkTimeEntry.findById(req.params.id);
    if (!workTime) {
      res.status(404).json({ message: '指定された作業時間が見つかりません' });
      return;
    }
    res.json(workTime);
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id',
  validateWorkTimeEntry,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: '入力データが無効です', errors: errors.array() });
      return;
    }

    try {
      const updatedWorkTime = await WorkTimeEntry.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updatedWorkTime) {
        res.status(404).json({ message: '指定された作業時間が見つかりません' });
        return;
      }
      res.json({
        message: '作業時間が正常に更新されました',
        workTime: updatedWorkTime,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedWorkTime = await WorkTimeEntry.findByIdAndDelete(req.params.id);
    if (!deletedWorkTime) {
      res.status(404).json({ message: '指定された作業時間が見つかりません' });
      return;
    }
    res.json({
      message: '作業時間が正常に削除されました',
      workTime: deletedWorkTime,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
