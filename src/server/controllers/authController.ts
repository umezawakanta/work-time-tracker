import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// 暫定的なユーザー情報
const TEMP_USER = {
  email: 'kanta13jp@gmail.com',
  password: 'P@ssw0rd01'
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('ログイン試行:', email);

    // 暫定的な認証ロジック
    if (email === TEMP_USER.email && password === TEMP_USER.password) {
      const token = jwt.sign({ userId: 'temp_user_id' }, JWT_SECRET, { expiresIn: '1h' });
      console.log('ログイン成功:', email);
      res.json({ token });
    } else {
      console.log('ログイン失敗:', email);
      res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

export const checkAuth = (req: Request, res: Response) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('認証チェック: トークンがありません');
    return res.status(401).json({ message: 'トークンがありません、認証が拒否されました' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log('認証チェック成功:', decoded.userId);
    res.json({ isAuthenticated: true, userId: decoded.userId });
  } catch (error) {
    console.error('トークン検証失敗:', error);
    res.status(401).json({ message: 'トークンが無効です' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};