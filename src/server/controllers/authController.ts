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

    const user = await User.findOne({ email }) as IUser | null;
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.error('Login error: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.error('Login error: Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userId = user._id?.toString() || '';
    const token = generateToken(userId);
    console.log('Login successful for user:', userId);

    res.json({ 
      token, 
      user: { 
        id: userId, 
        name: user.name, 
        email: user.email,
        isAdmin: user.isAdmin // isAdminフィールドを追加
      } 
    });
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
    user = new User({ name, email, password, isAdmin: false }) as IUser; // 新規ユーザーはデフォルトで非管理者
    await user.save();
    const userId = user._id?.toString() || '';
    const token = generateToken(userId);
    res.status(201).json({ 
      token, 
      user: { 
        id: userId, 
        name: user.name, 
        email: user.email,
        isAdmin: user.isAdmin
      } 
    });
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

    const user = await User.findById(req.user.id).select('name email isAdmin');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin // isAdminフィールドを追加
      }
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ message: 'Server error during authentication check' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // サブスクリプションデータ - 実際のアプリケーションでは別のモデルから取得するかもしれません
    const subscription = {
      isActive: true, // 仮の値
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 例：30日後
    };
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
      subscription
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.name = name || user.name;
    user.email = email || user.email;
    // isAdminは管理者のみが変更できるようにすべきなので、ここでは変更しない
    
    await user.save();
    res.json({ 
      name: user.name, 
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};