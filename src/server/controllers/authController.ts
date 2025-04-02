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

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.error('Login error: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // パスワードが文字列であることを確認
    const passwordStr = String(password);

    const user = await User.findOne({ email }) as IUser | null;
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.error('Login error: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 修正: 文字列に変換したパスワードを使用
    const isMatch = await user.comparePassword(passwordStr);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.error('Login error: Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
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

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email }) as IUser | null;
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
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

export const checkAuth = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ isAuthenticated: false });
    }

    const user = await User.findById(req.user.id).select('name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '認証されていません' });
    }

    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    res.json({ user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'プロフィールの更新中にエラーが発生しました' });
  }
};

export const getUserData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '認証されていません' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'ユーザーデータの取得中にエラーが発生しました' });
  }
};