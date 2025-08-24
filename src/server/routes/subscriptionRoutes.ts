// 一般サブスクリプション（外部サービス）用のルーター
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { SubscriptionModel } from '../models/Subscription.js';

const router = express.Router();

// バリデーションルール
// -----------------------------------------------------

// 基本サブスクリプション情報のバリデーション
const validateSubscription = [
  body('name').notEmpty().withMessage('名称は必須です'),
  body('billingDate').notEmpty().withMessage('引き落とし日は必須です'),
  body('type').notEmpty().withMessage('種別は必須です'),
  body('amount').isNumeric().withMessage('金額は数値である必要があります'),
];

// 基本的なCRUD操作
// -----------------------------------------------------

// サブスクリプション一覧の取得
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // クエリパラメータからユーザーIDを取得（オプション）
    const userId = req.query.userId as string;

    let query = {};
    if (userId) {
      query = { userId };
    }

    const subscriptions = await SubscriptionModel.find(query).sort({ name: 1 });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

// 特定のサブスクリプション情報を取得
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscription = await SubscriptionModel.findById(req.params.id);

    if (!subscription) {
      res.status(404).json({ message: '指定されたサブスクリプション情報が見つかりません' });
      return;
    }

    res.json(subscription);
  } catch (error) {
    next(error);
  }
});

// 新規サブスクリプション登録
router.post(
  '/',
  validateSubscription,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const subscriptionData = new SubscriptionModel({
        name: req.body.name,
        billingDate: req.body.billingDate,
        type: req.body.type,
        amount: req.body.amount,
        ...(req.body.userId ? { userId: req.body.userId } : {}),
        ...(req.body.paymentMethod ? { paymentMethod: req.body.paymentMethod } : {}),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedSubscription = await subscriptionData.save();
      res.status(201).json({
        message: 'サブスクリプションが正常に登録されました',
        subscription: savedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

// サブスクリプション情報更新
router.put(
  '/:id',
  validateSubscription,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // 更新データに updatedAt を追加
      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      };

      const updatedSubscription = await SubscriptionModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
        }
      );

      if (!updatedSubscription) {
        res.status(404).json({ message: '指定されたサブスクリプション情報が見つかりません' });
        return;
      }

      res.json({
        message: 'サブスクリプション情報が正常に更新されました',
        subscription: updatedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

// サブスクリプション削除
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedSubscription = await SubscriptionModel.findByIdAndDelete(req.params.id);

    if (!deletedSubscription) {
      res.status(404).json({ message: '指定されたサブスクリプション情報が見つかりません' });
      return;
    }

    res.json({
      message: 'サブスクリプションが正常に削除されました',
      subscription: deletedSubscription,
    });
  } catch (error) {
    next(error);
  }
});

// 専門的なエンドポイント
// -----------------------------------------------------

// 特定の月のサブスクリプションを取得
router.get(
  '/month/:yearMonth',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // この実装は簡易的なものです。実際には日付の比較ロジックが必要になります
      const subscriptions = await SubscriptionModel.find({
        // billingDateから年月を抽出して比較するロジックが必要
      });
      res.json(subscriptions);
    } catch (error) {
      next(error);
    }
  }
);

// 特定の種別のサブスクリプションを取得
router.get(
  '/type/:type',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscriptions = await SubscriptionModel.find({ type: req.params.type });
      res.json(subscriptions);
    } catch (error) {
      next(error);
    }
  }
);

// 支払い方法でサブスクリプションをフィルタリング
router.get(
  '/payment-method/:method',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscriptions = await SubscriptionModel.find({
        'paymentMethod.type': req.params.method,
      });
      res.json(subscriptions);
    } catch (error) {
      next(error);
    }
  }
);

// サブスクリプションの合計金額を取得
router.get(
  '/total-amount',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await SubscriptionModel.aggregate([
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]);

      const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
      res.json({ totalAmount });
    } catch (error) {
      next(error);
    }
  }
);

// 月ごとのサブスクリプション合計金額を取得
router.get(
  '/monthly-totals',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // この実装は簡易的なものです。実際には日付ごとの集計ロジックが必要になります
      const monthlySummary = [
        { month: '2024-01', amount: 9800 },
        { month: '2024-02', amount: 9800 },
        { month: '2024-03', amount: 10500 },
      ];

      res.json(monthlySummary);
    } catch (error) {
      next(error);
    }
  }
);

// サブスクリプションの確認ステータスを更新
router.patch(
  '/:id/check-status',
  body('month').notEmpty().withMessage('月の指定は必須です'),
  body('checked').isBoolean().withMessage('checkedはブール値である必要があります'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const subscription = await SubscriptionModel.findById(req.params.id);
      if (!subscription) {
        res.status(404).json({ message: '指定されたサブスクリプション情報が見つかりません' });
        return;
      }

      // Initialize checkStatuses if it doesn't exist
      if (!(subscription as any).checkStatuses) {
        (subscription as any).checkStatuses = {};
      }

      // Record the check
      const month = String(req.body.month || new Date().toISOString().slice(0, 7));
      const checked = req.body.checked === true;
      ((subscription as any).checkStatuses as Record<string, boolean>)[month] = checked;
      subscription.updatedAt = new Date();

      await subscription.save();

      res.json({
        message: 'チェックステータスが更新されました',
        subscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
