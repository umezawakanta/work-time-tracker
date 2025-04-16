import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: '1d' });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.error('Login error: Missing email or password');
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // パスワードが文字列であることを確認
    const passwordStr = String(password);

    const user = await User.findOne({ email }) as IUser | null;
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.error('Login error: User not found');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 修正: 文字列に変換したパスワードを使用
    const isMatch = await user.comparePassword(passwordStr);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.error('Login error: Invalid password');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const userId = user._id?.toString() || '';
    const token = generateToken(userId);
    console.log('Login successful for user:', userId);

    res.json({ token, user: { id: userId, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error during login', error: error.message, stack: error.stack });
    } else {
      res.status(500).json({ message: 'Server error during login', error: 'Unknown error' });
    }
  }
};

export const register = async (req: Request, res: Response): Promise<void> => { // 戻り値の型を追加
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email }) as IUser | null;
    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return; // return文を修正
    }
    user = new User({ name, email, password }) as IUser;
    await user.save();
    const userId = user._id?.toString() || '';
    const token = generateToken(userId);
    res.status(201).json({ token, user: { id: userId, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const checkAuth = async (req: AuthRequest, res: Response): Promise<void> => { // 戻り値の型を追加
  try {
    if (!req.user) {
      res.status(401).json({ isAuthenticated: false });
      return; // return文を修正
    }

    const user = await User.findById(req.user.id).select('name email');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return; // return文を修正
    }

    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ message: 'Server error during authentication check' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => { // 戻り値の型を追加
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '認証されていません' });
      return; // return文を修正
    }

    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'ユーザーが見つかりません' });
      return; // return文を修正
    }

    res.json({ user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'プロフィールの更新中にエラーが発生しました' });
  }
};

export const getUserData = async (req: AuthRequest, res: Response): Promise<void> => { // 戻り値の型を追加
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '認証されていません' });
      return; // return文を修正
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'ユーザーが見つかりません' });
      return; // return文を修正
    }

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'ユーザーデータの取得中にエラーが発生しました' });
  }
};