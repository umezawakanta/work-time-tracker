import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { Notification, INotification } from "../models/Notification.js";
import { NotificationSettings } from "../models/NotificationSettings.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// バリデーションルール
const validateNotification = [
  body("userId").notEmpty().withMessage("ユーザーIDは必須です"),
  body("title").notEmpty().withMessage("タイトルは必須です"),
  body("message").notEmpty().withMessage("メッセージは必須です"),
  body("type")
    .isIn(["reminder", "report", "alert", "success", "info"])
    .withMessage("タイプは有効な値である必要があります"),
];

// ユーザーの通知一覧を取得
router.get(
  "/user/:userId",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ユーザーIDの取得とアクセス権の確認
      const userId = req.params.userId;
      
      // リクエストしているユーザーとターゲットユーザーが一致するか確認（または管理者権限）
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      // クエリパラメータでフィルタリング
      const { limit = 20, skip = 0, read, type } = req.query;
      
      // フィルタ条件を構築
      const filter: any = { userId };
      if (read !== undefined) {
        filter.read = read === 'true';
      }
      if (type) {
        filter.type = type;
      }

      // 通知の取得（最新順）
      const notifications = await Notification.find(filter)
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip(Number(skip));

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }
);

// 未読通知数を取得
router.get(
  "/user/:userId/unread-count",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      
      // リクエストしているユーザーとターゲットユーザーが一致するか確認
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      const count = await Notification.countDocuments({
        userId,
        read: false,
      });

      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
);

// 特定の通知を既読にする
router.patch(
  "/:id/read",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.id;

      // 通知の取得
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "通知が見つかりません" });
      }

      // アクセス権の確認
      if (req.user.id !== notification.userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      // 既に既読の場合は何もしない
      if (notification.read) {
        return res.json({
          message: "通知は既に既読です",
          notification,
        });
      }

      // 既読に更新
      notification.read = true;
      await notification.save();

      res.json({
        message: "通知を既読にしました",
        notification,
      });
    } catch (error) {
      next(error);
    }
  }
);

// すべての通知を既読にする
router.patch(
  "/user/:userId/read-all",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      
      // アクセス権の確認
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      // 一括で既読に更新
      const result = await Notification.updateMany(
        { userId, read: false },
        { $set: { read: true } }
      );

      // 更新された通知の取得
      const notifications = await Notification.find({ userId }).sort({ timestamp: -1 });

      res.json({
        message: `${result.modifiedCount}件の通知を既読にしました`,
        notifications
      });
    } catch (error) {
      next(error);
    }
  }
);

// 通知を削除する
router.delete(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.id;

      // 通知の取得
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "通知が見つかりません" });
      }

      // アクセス権の確認
      if (req.user.id !== notification.userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      // 通知を削除
      await Notification.findByIdAndDelete(notificationId);

      res.json({
        message: "通知を削除しました",
        id: notificationId
      });
    } catch (error) {
      next(error);
    }
  }
);

// ユーザーのすべての通知を削除する
router.delete(
  "/user/:userId",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      
      // アクセス権の確認
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      // すべての通知を削除
      const result = await Notification.deleteMany({ userId });

      res.json({
        message: `${result.deletedCount}件の通知を削除しました`,
        count: result.deletedCount
      });
    } catch (error) {
      next(error);
    }
  }
);

// 新しい通知を作成する（管理者用/システム用）
router.post(
  "/",
  [isAuthenticated, validateNotification],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // 管理者またはシステム通知の場合のみ許可
      if (!req.user.isAdmin && req.user.id !== 'system') {
        return res.status(403).json({ message: "通知の作成権限がありません" });
      }

      // 通知設定のチェック
      const settings = await NotificationSettings.findOne({ userId: req.body.userId });
      
      // 通知タイプがオフになっている場合はスキップ
      if (settings) {
        const notificationType = req.body.type;
        if ((notificationType === 'reminder' && !settings.reminders) ||
            (notificationType === 'report' && !settings.reports) ||
            (notificationType === 'alert' && !settings.alerts) ||
            (!settings.inApp)) {
          return res.status(200).json({ 
            message: "ユーザーの通知設定により通知はスキップされました",
            skipped: true
          });
        }
      }

      // 新しい通知を作成
      const notificationData: Partial<INotification> = {
        userId: req.body.userId,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        read: false,
        timestamp: new Date(),
      };

      // オプションフィールドの追加
      if (req.body.link) notificationData.link = req.body.link;
      if (req.body.expiresAt) notificationData.expiresAt = new Date(req.body.expiresAt);
      if (req.body.metadata) notificationData.metadata = req.body.metadata;

      const notification = new Notification(notificationData);
      await notification.save();

      res.status(201).json({
        message: "通知が正常に作成されました",
        notification,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 通知設定を取得する
router.get(
  "/settings/:userId",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      
      // アクセス権の確認
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      // 設定を取得、存在しない場合はデフォルト設定を作成
      let settings = await NotificationSettings.findOne({ userId });
      
      if (!settings) {
        settings = new NotificationSettings({ userId });
        await settings.save();
      }

      res.json(settings);
    } catch (error) {
      next(error);
    }
  }
);

// 通知設定を更新する
router.patch(
  "/settings/:userId",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      
      // アクセス権の確認
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      // 有効なフィールドのみを抽出
      const validFields = [
        "email", "push", "inApp", "reminders", "reports", 
        "alerts", "marketing", "emailFrequency"
      ];
      
      const updateData: any = {};
      validFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      // 設定を更新、存在しない場合は作成
      const settings = await NotificationSettings.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true }
      );

      res.json({
        message: "通知設定が更新されました",
        settings,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;