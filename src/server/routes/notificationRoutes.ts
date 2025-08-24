import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Notification, INotification } from '../models/Notification.js';
import { NotificationSettings } from '../models/NotificationSettings.js';
import { isAuthenticated } from '../middleware/auth.js';
import { NotificationFilter } from '@/types/index.js';
import { AuthUser } from '@/types/express.js';

const router = express.Router();

// バリデーションルール
const validateNotification = [
  body('userId').notEmpty().withMessage('ユーザーIDは必須です'),
  body('title').notEmpty().withMessage('タイトルは必須です'),
  body('message').notEmpty().withMessage('メッセージは必須です'),
  body('type')
    .isIn(['reminder', 'report', 'alert', 'success', 'info'])
    .withMessage('タイプは有効な値である必要があります'),
];

// 認証後のユーザーチェック関数を修正
const checkUserAccess = (req: Request, userId: string): boolean => {
  if (!req.user) return false;

  // req.userをAuthUser型にキャスト
  const user = req.user as AuthUser;
  return user.id === userId || user.isAdmin === true;
};

// ユーザーの通知一覧を取得
router.get(
  '/user/:userId',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ユーザーIDの取得とアクセス権の確認
      const userId = req.params.userId;

      // リクエストしているユーザーとターゲットユーザーが一致するか確認（または管理者権限）
      if (!checkUserAccess(req, userId)) {
        res.status(403).json({ message: 'アクセス権限がありません' });
        return;
      }

      // クエリパラメータでフィルタリング
      const { limit = 20, skip = 0, read, type } = req.query;

      // フィルタ条件を構築
      const filter: NotificationFilter = { userId };
      if (read !== undefined) {
        filter.read = read === 'true';
      }
      if (type) {
        // typeパラメータが配列の場合は最初の要素を使用、文字列の場合はそのまま使用
        filter.type = Array.isArray(type) ? type[0] : type;
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
  '/user/:userId/unread-count',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;

      // リクエストしているユーザーとターゲットユーザーが一致するか確認
      if (!checkUserAccess(req, userId)) {
        res.status(403).json({ message: 'アクセス権限がありません' });
        return;
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
  '/:id/read',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // userの存在確認
      if (!req.user) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }

      const notificationId = req.params.id;

      // 通知の取得
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        res.status(404).json({ message: '通知が見つかりません' });
        return;
      }

      // アクセス権の確認（AuthUser型へのキャスト）
      const user = req.user as AuthUser;
      if (user.id !== notification.userId && !user.isAdmin) {
        res.status(403).json({ message: 'アクセス権限がありません' });
        return;
      }

      // 既に既読の場合は何もしない
      if (notification.read) {
        res.json({
          message: '通知は既に既読です',
          notification,
        });
        return;
      }

      // 既読に更新
      notification.read = true;
      await notification.save();

      res.json({
        message: '通知を既読にしました',
        notification,
      });
    } catch (error) {
      next(error);
    }
  }
);

// すべての通知を既読にする
router.patch(
  '/user/:userId/read-all',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;

      // アクセス権の確認
      if (!checkUserAccess(req, userId)) {
        res.status(403).json({ message: 'アクセス権限がありません' });
        return;
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
        notifications,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 通知を削除する
router.delete(
  '/:id',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // userの存在確認
      if (!req.user) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      const notificationId = req.params.id;

      // 通知の取得
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        res.status(404).json({ message: '通知が見つかりません' });
        return;
      }

      // アクセス権の確認
      const user = req.user as AuthUser;
      if (user.id !== notification.userId && !user.isAdmin) {
        res.status(403).json({ message: 'アクセス権限がありません' });
        return;
      }

      // 通知を削除
      await Notification.findByIdAndDelete(notificationId);

      res.json({
        message: '通知を削除しました',
        id: notificationId,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ユーザーのすべての通知を削除する
router.delete(
  '/user/:userId',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;

      // アクセス権の確認
      if (!checkUserAccess(req, userId)) {
        res.status(403).json({ message: 'アクセス権限がありません' });
        return;
      }

      // すべての通知を削除
      const result = await Notification.deleteMany({ userId });

      res.json({
        message: `${result.deletedCount}件の通知を削除しました`,
        count: result.deletedCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 新しい通知を作成する（管理者用/システム用）
router.post(
  '/',
  isAuthenticated,
  validateNotification, // 配列ではなく展開する
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // userの存在確認
      if (!req.user) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }

      // 管理者またはシステム通知の場合のみ許可
      const user = req.user as AuthUser;
      if (!user.isAdmin && req.user.id !== 'system') {
        res.status(403).json({ message: '通知の作成権限がありません' });
        return;
      }

      // 通知設定のチェック
      const settings = await NotificationSettings.findOne({ userId: req.body.userId });

      // 通知タイプがオフになっている場合はスキップ
      if (settings) {
        const notificationType = req.body.type;
        if (
          (notificationType === 'reminder' && !settings.reminders) ||
          (notificationType === 'report' && !settings.reports) ||
          (notificationType === 'alert' && !settings.alerts) ||
          !settings.inApp
        ) {
          res.status(200).json({
            message: 'ユーザーの通知設定により通知はスキップされました',
            skipped: true,
          });
          return;
        }
      }

      // 新しい通知を作成
      const notificationData: Partial<INotification> = {
        userId: typeof req.body.userId === 'string' ? req.body.userId : String(req.body.userId),
        title: typeof req.body.title === 'string' ? req.body.title : String(req.body.title),
        message: typeof req.body.message === 'string' ? req.body.message : String(req.body.message),
        type: req.body.type as 'reminder' | 'report' | 'alert' | 'success' | 'info',
        read: false,
        timestamp: new Date(),
      };

      // オプションフィールドの追加
      if (req.body.link) notificationData.link = String(req.body.link);
      if (req.body.expiresAt) {
        const expiresAt = req.body.expiresAt;

        // 日付文字列、タイムスタンプ、または日付オブジェクトの場合に対応
        if (typeof expiresAt === 'string' || typeof expiresAt === 'number') {
          notificationData.expiresAt = new Date(expiresAt);
        } else if (expiresAt instanceof Date) {
          notificationData.expiresAt = expiresAt;
        }
      }
      if (req.body.metadata) notificationData.metadata = req.body.metadata; // objectの場合はそのまま

      const notification = new Notification(notificationData);
      await notification.save();

      res.status(201).json({
        message: '通知が正常に作成されました',
        notification,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 通知設定を取得する
router.get(
  '/settings/:userId',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;

      // アクセス権の確認
      if (!checkUserAccess(req, userId)) {
        res.status(403).json({ message: 'アクセス権限がありません' });
        return;
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
  '/settings/:userId',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;

      // アクセス権の確認
      if (!checkUserAccess(req, userId)) {
        res.status(403).json({ message: 'アクセス権限がありません' });
        return;
      }

      // 有効なフィールドのみを抽出
      const validFields = [
        'email',
        'push',
        'inApp',
        'reminders',
        'reports',
        'alerts',
        'marketing',
        'emailFrequency',
      ];

      type ValidField = (typeof validFields)[number];

      const updateData: Partial<Record<ValidField, unknown>> = {};
      validFields.forEach((field) => {
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
        message: '通知設定が更新されました',
        settings,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
