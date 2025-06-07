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
    console.error('JWT_SECRET environment variable is not set');
    throw new Error('JWT_SECRET is not defined');
  }
  console.log('JWT_SECRET is properly configured');
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

    const user = (await User.findOne({ email })) as IUser | null;
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
      res
        .status(500)
        .json({ message: 'Server error during login', error: error.message, stack: error.stack });
    } else {
      res.status(500).json({ message: 'Server error during login', error: 'Unknown error' });
    }
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Registration attempt started ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    const { name, email, password } = req.body;

    // 必須フィールドの検証とログ出力
    if (!name || !email || !password) {
      console.error('Registration validation error: Missing required fields');
      console.error('Missing fields:', {
        name: !name ? 'missing' : 'present',
        email: !email ? 'missing' : 'present',
        password: !password ? 'missing' : 'present',
      });
      res.status(400).json({
        message: '名前、メールアドレス、パスワードをすべて入力してください',
        field: 'general',
      });
      return;
    }

    console.log('Checking if user already exists with email:', email);
    let user = (await User.findOne({ email })) as IUser | null;

    if (user) {
      console.log('Registration failed: User already exists with email:', email);
      res.status(400).json({
        message: 'このメールアドレスは既に登録されています。別のメールアドレスをお試しください。',
        field: 'email',
      });
      return;
    }

    console.log('Creating new user with data:', {
      name,
      email,
      passwordLength: typeof password === 'string' ? password.length : 'unknown',
    });
    user = new User({ name, email, password }) as IUser;

    console.log('Attempting to save user to database...');
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    const userId = user._id?.toString() || '';
    console.log('Generating JWT token for user ID:', userId);

    const token = generateToken(userId);
    console.log('JWT token generated successfully');

    const responseData = {
      token,
      user: { id: userId, name: user.name, email: user.email },
    };
    console.log('Sending successful registration response:', responseData);

    res.status(201).json(responseData);
    console.log('=== Registration completed successfully ===');
  } catch (error) {
    console.error('=== Registration error occurred ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'ValidationError') {
        console.error('Mongoose Validation Error details:', error);
        res.status(400).json({
          message: '入力データに問題があります。すべてのフィールドを正しく入力してください。',
          field: 'general',
          details: error,
        });
        return;
      }

      // Duplicate key error (MongoDB)
      if (error.name === 'MongoServerError' && 'code' in error && error.code === 11000) {
        console.error('MongoDB Duplicate Key Error:', error);
        res.status(400).json({
          message: 'このメールアドレスは既に登録されています。',
          field: 'email',
        });
        return;
      }
    }

    // JWT関連のエラー
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      console.error('JWT configuration error');
      res.status(500).json({
        message: 'サーバーの設定に問題があります。しばらく時間をおいてから再度お試しください。',
        field: 'general',
      });
      return;
    }

    // その他のエラー
    res.status(500).json({
      message:
        'アカウント作成中にエラーが発生しました。しばらく時間をおいてから再度お試しください。',
      field: 'general',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const checkAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  // 戻り値の型を追加
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
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ message: 'Server error during authentication check' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  // 戻り値の型を追加
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

export const getUserData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '認証されていません' });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'ユーザーが見つかりません' });
      return;
    }

    // isAdminプロパティを含めてレスポンスを返す
    res.json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'ユーザーデータの取得中にエラーが発生しました' });
  }
};

export const updateUserToAdmin = async (userId: string) => {
  return await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true }).select('-password');
};
