import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { IUserSubscription, UserSubscription } from "../models/userSubscription";

const router = express.Router();

// ユーザーサブスクリプションのバリデーション
const validateUserSubscription = [
  body("userId").notEmpty().withMessage("ユーザーIDは必須です"),
  body("planId").notEmpty().withMessage("プランIDは必須です"),
  body("status").isIn(['active', 'canceled', 'expired']).withMessage("ステータスは 'active', 'canceled', 'expired' のいずれかである必要があります"),
  body("currentPeriodEnd").isISO8601().withMessage("currentPeriodEndは有効な日付である必要があります"),
];

// ユーザーサブスクリプション情報の取得
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // クエリパラメータからユーザーIDを取得（オプション）
    const userId = req.query.userId as string;
    
    let query = {};
    if (userId) {
      query = { userId };
    }
    
    const userSubscriptions = await UserSubscription.find(query);
    res.json(userSubscriptions);
  } catch (error) {
    next(error);
  }
});

// 特定のユーザーのサブスクリプション情報を取得
router.get("/user/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userSubscription = await UserSubscription.findOne({ userId: req.params.userId });
    
    if (!userSubscription) {
      return res.status(404).json({ message: "指定されたユーザーのサブスクリプション情報が見つかりません" });
    }
    
    res.json(userSubscription);
  } catch (error) {
    next(error);
  }
});

// 特定のサブスクリプション情報を取得
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userSubscription = await UserSubscription.findById(req.params.id);
    
    if (!userSubscription) {
      return res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
    }
    
    res.json(userSubscription);
  } catch (error) {
    next(error);
  }
});

// 新規サブスクリプション登録
router.post(
  "/",
  validateUserSubscription,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // すでに登録済みのユーザーがいないかチェック
      const existingSubscription = await UserSubscription.findOne({ userId: req.body.userId });
      if (existingSubscription) {
        return res.status(400).json({ message: "このユーザーは既にサブスクリプションに登録されています" });
      }

      const userSubscriptionData: IUserSubscription = new UserSubscription({
        userId: req.body.userId,
        planId: req.body.planId,
        status: req.body.status,
        currentPeriodEnd: req.body.currentPeriodEnd,
        cancelAtPeriodEnd: req.body.cancelAtPeriodEnd || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedUserSubscription = await userSubscriptionData.save();
      res.status(201).json({
        message: "ユーザーサブスクリプションが正常に登録されました",
        userSubscription: savedUserSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

// サブスクリプション情報更新
router.put(
  "/:id",
  validateUserSubscription,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // 更新データに updatedAt を追加
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const updatedUserSubscription = await UserSubscription.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      
      if (!updatedUserSubscription) {
        return res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
      }
      
      res.json({
        message: "ユーザーサブスクリプション情報が正常に更新されました",
        userSubscription: updatedUserSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

// キャンセルフラグの更新
router.patch(
  "/:id/cancel",
  body("cancelAtPeriodEnd").isBoolean().withMessage("cancelAtPeriodEndはブール値である必要があります"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedUserSubscription = await UserSubscription.findByIdAndUpdate(
        req.params.id,
        {
          cancelAtPeriodEnd: req.body.cancelAtPeriodEnd,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updatedUserSubscription) {
        return res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
      }
      
      res.json({
        message: req.body.cancelAtPeriodEnd 
          ? "サブスクリプションは次の更新日にキャンセルされます" 
          : "サブスクリプションの自動更新が再開されます",
        userSubscription: updatedUserSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ステータス更新
router.patch(
  "/:id/status",
  body("status").isIn(['active', 'canceled', 'expired']).withMessage("ステータスは 'active', 'canceled', 'expired' のいずれかである必要があります"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedUserSubscription = await UserSubscription.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updatedUserSubscription) {
        return res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
      }
      
      res.json({
        message: `サブスクリプションのステータスが ${req.body.status} に更新されました`,
        userSubscription: updatedUserSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

// サブスクリプション削除
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedUserSubscription = await UserSubscription.findByIdAndDelete(
        req.params.id
      );
      
      if (!deletedUserSubscription) {
        return res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
      }
      
      res.json({
        message: "ユーザーサブスクリプションが正常に削除されました",
        userSubscription: deletedUserSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 支払い方法の更新
router.post(
  "/payment-method",
  body("userId").notEmpty().withMessage("ユーザーIDは必須です"),
  body("paymentMethod").isObject().withMessage("支払い方法情報は必須です"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, paymentMethod } = req.body;
      
      // 保存する支払い方法のデータから機密情報を削除
      // 実際の実装では、決済代行サービスのトークンなどを利用するべき
      const sanitizedPaymentMethod = {
        type: paymentMethod.type,
        lastFour: paymentMethod.cardNumber ? paymentMethod.cardNumber.slice(-4) : null,
        expiryDate: paymentMethod.expiryDate,
        cardholderName: paymentMethod.cardholderName,
        isDefault: true,
      };

      // 既存の支払い方法情報があれば更新
      const subscription = await UserSubscription.findOne({ userId });
      if (!subscription) {
        return res.status(404).json({ message: "ユーザーのサブスクリプション情報が見つかりません" });
      }

      // 実際の実装では、決済情報は別のテーブルで管理するべき
      // 未使用変数の警告を解消するため、変数宣言を変更
      await UserSubscription.findByIdAndUpdate(
        subscription._id,
        {
          $set: { paymentMethod: sanitizedPaymentMethod, updatedAt: new Date() }
        },
        { new: true }
      );

      res.json({
        message: "支払い方法が正常に更新されました",
        paymentMethod: sanitizedPaymentMethod
      });
    } catch (error) {
      next(error);
    }
  }
);

// 請求履歴の取得
router.get(
  "/invoices/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      // 実際の実装では、請求履歴は別のテーブルで管理するべき
      // ここではモックデータを返す
      const mockInvoices = [
        {
          id: "inv_123456",
          userId,
          amount: 980,
          currency: "jpy",
          status: "paid",
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(),
          paymentMethod: {
            type: "credit_card",
            lastFour: "4242"
          },
          createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
        }
      ];

      res.json(mockInvoices);
    } catch (error) {
      next(error);
    }
  }
);

// プラン変更の予約
router.post(
  "/:id/schedule-change",
  body("newPlanId").notEmpty().withMessage("新しいプランIDは必須です"),
  body("changeDate").isISO8601().withMessage("変更日は有効な日付である必要があります"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { newPlanId, changeDate } = req.body;
      
      const subscription = await UserSubscription.findById(id);
      if (!subscription) {
        return res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
      }

      // プラン変更を予約する情報を追加
      // 実際の実装では、バックグラウンドジョブで指定日に処理する
      const updatedSubscription = await UserSubscription.findByIdAndUpdate(
        id,
        {
          $set: {
            scheduledChanges: {
              newPlanId,
              effectiveDate: new Date(changeDate)
            },
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      
      res.json({
        message: "プラン変更が予約されました",
        subscription: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  }
);

// 即時解約
router.post(
  "/:id/cancel-immediately",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const subscription = await UserSubscription.findById(id);
      if (!subscription) {
        return res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
      }

      // サブスクリプションを即時解約
      const updatedSubscription = await UserSubscription.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "canceled",
            cancelReason: reason || null,
            canceledAt: new Date(),
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      
      res.json({
        message: "サブスクリプションが解約されました",
        subscription: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  }
);

// 解約後の復活
router.post(
  "/:id/reactivate",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const subscription = await UserSubscription.findById(id);
      if (!subscription) {
        return res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
      }

      if (subscription.status !== "canceled") {
        return res.status(400).json({ message: "解約されていないサブスクリプションは復活できません" });
      }

      // サブスクリプションを復活
      const now = new Date();
      const newPeriodEnd = new Date(now.setDate(now.getDate() + 30)); // 30日後
      
      const updatedSubscription = await UserSubscription.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "active",
            cancelAtPeriodEnd: false,
            cancelReason: null,
            canceledAt: null,
            currentPeriodEnd: newPeriodEnd,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      
      res.json({
        message: "サブスクリプションが復活しました",
        subscription: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;