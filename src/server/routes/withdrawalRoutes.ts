import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { WithdrawalEntry, IWithdrawalEntry } from '../models/withdrawEntry.js';

const router = express.Router();

const validateWithdrawalEntry = [
  body('date').isISO8601().toDate().withMessage('日付は有効なISO8601形式である必要があります'),
  body('bank').notEmpty().withMessage('銀行名は必須です'),
  body('branch').notEmpty().withMessage('支店名は必須です'),
  body('amount').isNumeric().withMessage('金額は数値である必要があります'),
  body('description').notEmpty().withMessage('説明は必須です'),
];

router.post(
  '/',
  validateWithdrawalEntry,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const withdrawalData: IWithdrawalEntry = new WithdrawalEntry({
        date: req.body.date,
        bank: req.body.bank,
        branch: req.body.branch,
        amount: req.body.amount,
        description: req.body.description,
      });

      const savedWithdrawal = await withdrawalData.save();
      res.status(201).json({
        message: '口座引き落とし情報が正常に記録されました',
        withdrawal: savedWithdrawal,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const withdrawals = await WithdrawalEntry.find().sort({ date: -1 });
    res.json(withdrawals);
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id',
  validateWithdrawalEntry,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const updatedWithdrawal = await WithdrawalEntry.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updatedWithdrawal) {
        res.status(404).json({ message: '指定された口座引き落とし情報が見つかりません' });
        return;
      }
      res.json({
        message: '口座引き落とし情報が正常に更新されました',
        withdrawal: updatedWithdrawal,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedWithdrawal = await WithdrawalEntry.findByIdAndDelete(req.params.id);
    if (!deletedWithdrawal) {
      res.status(404).json({ message: '指定された口座引き落とし情報が見つかりません' });
      return;
    }
    res.json({
      message: '口座引き落とし情報が正常に削除されました',
      withdrawal: deletedWithdrawal,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
