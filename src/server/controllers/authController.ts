import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';

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
    const { email, password } = req.body;
    const user = await User.findOne({ email }) as IUser | null;
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const userId = user._id?.toString() || '';
    const token = generateToken(userId);
    res.json({ token, user: { id: userId, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
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
  if (!req.user) {
    return res.status(401).json({ isAuthenticated: false });
  }
  res.json({ isAuthenticated: true, user: req.user });
};