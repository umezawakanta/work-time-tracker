import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { UserSubscription } from "../models/UserSubscription";
import { ISubscription, Subscription } from "../models/Subscription";

const router = express.Router();

// バリデーションミドルウェア
const validateSubscription = [
  body("name").notEmpty().withMessage("名称は必須です"),
  body("billingDate").notEmpty().withMessage("引き落とし日は必須です"),
  body("type").notEmpty().withMessage("種別は必須です"),
  body("amount").isNumeric().withMessage("金額は数値である必要があります"),
];

router.post(
  "/",
  validateSubscription,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const subscriptionData: ISubscription = new Subscription({
        name: req.body.name,
        billingDate: req.body.billingDate,
        type: req.body.type,
        amount: req.body.amount,
      });

      const savedSubscription = await subscriptionData.save();
      res.status(201).json({
        message: "サブスクリプションが正常に登録されました",
        subscription: savedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await Subscription.find().sort({ name: 1 });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  validateSubscription,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedSubscription) {
        return res
          .status(404)
          .json({ message: "指定されたサブスクリプションが見つかりません" });
      }
      res.json({
        message: "サブスクリプション情報が正常に更新されました",
        subscription: updatedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedSubscription = await Subscription.findByIdAndDelete(
        req.params.id
      );
      if (!deletedSubscription) {
        return res
          .status(404)
          .json({ message: "指定されたサブスクリプションが見つかりません" });
      }
      res.json({
        message: "サブスクリプションが正常に削除されました",
        subscription: deletedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ユーザーのサブスクリプション状態を取得
router.get(
  "/user/:userId", 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      
      // ユーザーの最新のサブスクリプション情報を取得
      const userSubscription = await UserSubscription.findOne({ 
        userId: userId, 
        status: 'active' 
      }).sort({ createdAt: -1 });

      if (!userSubscription) {
        // アクティブなサブスクリプションが見つからない場合
        return res.status(404).json({ 
          message: 'アクティブなサブスクリプションが見つかりません' 
        });
      }

      res.json(userSubscription);
    } catch (error) {
      next(error);
    }
  }
);

// ユーザーのサブスクリプションを作成/更新
router.post(
  "/user/:userId", 
  [
    body("planId").notEmpty().withMessage("プランIDは必須です"),
    body("status").isIn(['active', 'canceled', 'expired']).withMessage("無効な状態です")
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.params.userId;
      const { planId, status, cancelAtPeriodEnd } = req.body;

      // 既存の有効なサブスクリプションを非アクティブ化
      await UserSubscription.updateMany(
        { userId: userId, status: 'active' }, 
        { status: 'expired' }
      );

      // 新しいサブスクリプションを作成
      const newUserSubscription = new UserSubscription({
        userId: userId,
        planId: planId,
        status: status,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        cancelAtPeriodEnd: cancelAtPeriodEnd || false
      });

      await newUserSubscription.save();

      res.status(201).json({
        message: 'ユーザーサブスクリプションが正常に更新されました',
        subscription: newUserSubscription
      });
    } catch (error) {
      next(error);
    }
  }
);

// ユーザーのサブスクリプション状態を更新
router.patch(
  "/user/:userId", 
  [
    body("status").isIn(['active', 'canceled', 'expired']).withMessage("無効な状態です")
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.params.userId;
      const { status, cancelAtPeriodEnd } = req.body;

      const updatedSubscription = await UserSubscription.findOneAndUpdate(
        { userId: userId, status: 'active' },
        { 
          status: status,
          ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd })
        },
        { new: true }
      );

      if (!updatedSubscription) {
        return res.status(404).json({ 
          message: 'アクティブなサブスクリプションが見つかりません' 
        });
      }

      res.json({
        message: 'サブスクリプション状態が更新されました',
        subscription: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;