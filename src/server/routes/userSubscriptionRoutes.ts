import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { IUserSubscription, UserSubscription } from "../models/UserSubscription.js";

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

export default router;