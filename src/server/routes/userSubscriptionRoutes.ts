// ユーザーサブスクリプション（サイト内プラン管理）用のルーター
import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { UserSubscription, IUserSubscription } from "../models/userSubscription.js";

const router = express.Router();

interface ScheduleChangeRequestBody {
  newPlanId: string;
  changeDate: string; // ISO8601形式の日付文字列
}

// ユーザーサブスクリプションのバリデーション
const validateUserSubscription = [
  body("userId").notEmpty().withMessage("ユーザーIDは必須です"),
  body("planId").notEmpty().withMessage("プランIDは必須です"),
  body("status").isIn(['active', 'canceled', 'expired']).withMessage("ステータスは 'active', 'canceled', 'expired' のいずれかである必要があります"),
  body("currentPeriodEnd").isISO8601().withMessage("currentPeriodEndは有効な日付である必要があります"),
];

// ユーザーサブスクリプション情報の取得
router.get("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
router.get("/user/:userId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userSubscription = await UserSubscription.findOne({ userId: req.params.userId });
    
    if (!userSubscription) {
      res.status(404).json({ message: "指定されたユーザーのサブスクリプション情報が見つかりません" });
      return;
    }
    
    res.json(userSubscription);
  } catch (error) {
    next(error);
  }
});

// 特定のサブスクリプション情報を取得
router.get("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userSubscription = await UserSubscription.findById(req.params.id);
    
    if (!userSubscription) {
      res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
      return;
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // すでに登録済みのユーザーがいないかチェック
      const existingSubscription = await UserSubscription.findOne({ userId: req.body.userId });
      if (existingSubscription) {
        res.status(400).json({ message: "このユーザーは既にサブスクリプションに登録されています" });
        return;
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
        updatedAt: new Date()
      };

      const updatedUserSubscription = await UserSubscription.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      
      if (!updatedUserSubscription) {
        res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
        return;
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
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
        res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
        return;
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
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
        res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
        return;
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deletedUserSubscription = await UserSubscription.findByIdAndDelete(
        req.params.id
      );
      
      if (!deletedUserSubscription) {
        res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
        return;
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

// サブスクリプションの確認ステータスを更新
router.patch(
  "/:id/check-status",
  body("month").notEmpty().withMessage("月の指定は必須です"),
  body("checked").isBoolean().withMessage("checkedはブール値である必要があります"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { month, checked } = req.body;
      
      const userSubscription = await UserSubscription.findById(req.params.id);
      if (!userSubscription) {
        res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
        return;
      }

      // サブスクリプションを更新
      userSubscription.checkStatuses = userSubscription.checkStatuses || {};
      if (typeof month === 'string' && typeof checked === 'boolean') {
        (userSubscription.checkStatuses as Record<string, boolean>)[month] = checked;
      }
      userSubscription.updatedAt = new Date();
      
      await userSubscription.save();
      
      res.json({
        message: `チェックステータスが更新されました`,
        userSubscription
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // Type assertion を使って型を特定
      const body = req.body as unknown;
      if (
        !body || 
        typeof body !== 'object' || 
        !('userId' in body) || 
        !('paymentMethod' in body) || 
        typeof body.paymentMethod !== 'object'
      ) {
        res.status(400).json({
          message: "無効なリクエスト形式です。'userId'と'paymentMethod'が必要です。"
        });
        return;
      }

      const { userId } = body as { userId: string };
      const paymentMethod = body.paymentMethod as Record<string, unknown>;
      
      // 保存する支払い方法のデータから機密情報を削除
      // 実際の実装では、決済代行サービスのトークンなどを利用するべき
      const sanitizedPaymentMethod = {
        type: typeof paymentMethod.type === 'string' ? paymentMethod.type : 'unknown',
        lastFour: typeof paymentMethod.cardNumber === 'string' ? paymentMethod.cardNumber.slice(-4) : null,
        expiryDate: typeof paymentMethod.expiryDate === 'string' ? paymentMethod.expiryDate : null,
        cardholderName: typeof paymentMethod.cardholderName === 'string' ? paymentMethod.cardholderName : null,
        isDefault: true,
      };

      // 既存の支払い方法情報があれば更新
      const subscription = await UserSubscription.findOne({ userId });
      if (!subscription) {
        res.status(404).json({ message: "ユーザーのサブスクリプション情報が見つかりません" });
        return;
      }

      const updatedSubscription = await UserSubscription.findByIdAndUpdate(
        subscription._id,
        {
          $set: { paymentMethod: sanitizedPaymentMethod, updatedAt: new Date() }
        },
        { new: true }
      );

      res.json({
        message: "支払い方法が正常に更新されました",
        paymentMethod: sanitizedPaymentMethod,
        userSubscription: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  }
);

// 請求履歴の取得
router.get(
  "/invoices/:userId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { id } = req.params;
      
      // Type safety check
      const body = req.body as unknown;
      if (
        !body || 
        typeof body !== 'object' || 
        !('newPlanId' in body) || 
        !('changeDate' in body) || 
        typeof body.newPlanId !== 'string' ||
        typeof body.changeDate !== 'string'
      ) {
        res.status(400).json({
          message: "無効なリクエスト形式です。'newPlanId'と'changeDate'が必要です。"
        });
        return;
      }

      const { newPlanId, changeDate } = body as ScheduleChangeRequestBody;
      
      const subscription = await UserSubscription.findById(id);
      if (!subscription) {
        res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
        return;
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reason = typeof req.body.reason === 'string' ? req.body.reason : null;
      
      const subscription = await UserSubscription.findById(id);
      if (!subscription) {
        res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
        return;
      }

      // サブスクリプションを即時解約
      const updatedSubscription = await UserSubscription.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "canceled",
            cancelReason: reason,
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      const subscription = await UserSubscription.findById(id);
      if (!subscription) {
        res.status(404).json({ message: "指定されたサブスクリプション情報が見つかりません" });
        return;
      }

      if (subscription.status !== "canceled") {
        res.status(400).json({ message: "解約されていないサブスクリプションは復活できません" });
        return;
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