import * as express from 'express';
import { Request, Response } from 'express';
import {
  login,
  register,
  checkAuth,
  updateProfile,
  getUserData,
  refreshToken,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController.js';
// import { authMiddleware } from '../middleware/authMiddleware.js'; // Disabled for development
import { User } from '../models/User.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/check', /* authMiddleware, */ checkAuth);
router.get(
  '/profile',
  /* authMiddleware, */ (req: Request, res: Response): void => {
    res.json({ user: req.user || { id: 'demo-user', message: 'Development mode' } });
  }
);
router.put('/profile', /* authMiddleware, */ updateProfile);
router.get('/user', /* authMiddleware, */ getUserData);

// 新しいエンドポイントを追加
router.post('/refresh', refreshToken);
router.post('/password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// 管理者権限付与エンドポイント（開発用）
router.post(
  '/promote-admin',
  /* authMiddleware, */ // Disabled for development
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 環境が開発環境の場合のみ許可
      if (process.env.NODE_ENV === 'production') {
        res.status(403).json({ message: '本番環境では管理者権限の付与はできません' });
        return;
      }

      // ユーザー認証チェック
      if (!req.user) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }

      // ユーザーを管理者にする処理をここに実装
      // req.user を使用してユーザー情報を更新
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { isAdmin: true },
        { new: true }
      ).select('-password');

      res.json({ user: updatedUser, message: '管理者権限を付与しました' });
    } catch (error) {
      console.error('Admin promotion error:', error);
      res.status(500).json({ message: '管理者権限の付与に失敗しました' });
    }
  }
);

export default router;
