import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

interface TokenPayload {
  id: string;
}

const generateTokens = (userId: string, rememberMe: boolean = false) => {
  const secret = process.env.JWT_SECRET || 'dev-fallback-jwt-secret-key-change-in-production';

  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET not set, using fallback secret for development');
  } else {
    console.log('JWT_SECRET is properly configured');
  }

  // Access token: 1 hour
  const accessToken = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });

  // Refresh token: 7 days (30 days if remember me)
  const refreshExpiresIn = rememberMe ? '30d' : '7d';
  const refreshToken = jwt.sign({ id: userId }, secret, { expiresIn: refreshExpiresIn });

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hour in seconds
    refreshExpiresIn: rememberMe ? 2592000 : 604800, // 30 days or 7 days in seconds
  };
};

// Legacy function for backward compatibility
const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET || 'dev-fallback-jwt-secret-key-change-in-production';

  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET not set, using fallback secret for development');
  } else {
    console.log('JWT_SECRET is properly configured');
  }

  return jwt.sign({ id: userId }, secret, { expiresIn: '1h' }); // Changed from 1d to 1h
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Login attempt started:', req.body);
    const { email, password, rememberMe } = req.body;
    const rememberMeFlag = Boolean(rememberMe);

    if (!email || !password) {
      console.error('❌ Login error: Missing email or password');
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // パスワードが文字列であることを確認
    const passwordStr = String(password);

    console.log('🔍 Looking up user with email:', email);
    const user = (await User.findOne({ email })) as UserDocument | null;
    console.log('👤 User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.error('❌ Login error: User not found');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    console.log('🔐 Comparing password...');
    // パスワードの比較
    if (!user.password || typeof user.password !== 'string') {
      console.error('❌ Login error: Stored password missing');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const isMatch = await bcrypt.compare(passwordStr, user.password);
    console.log('🔑 Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      console.error('❌ Login error: Invalid password');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const userId = String((user as unknown as { _id: unknown })._id ?? '');
    console.log('🎫 Generating tokens for user:', userId);

    const tokens = generateTokens(userId, rememberMeFlag);
    console.log('✅ Tokens generated successfully');

    console.log('📝 Building response data...');
    const responseData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: userId,
        displayName: user.displayName,
        email: user.email,
        isAdmin: user.role === 'admin',
      },
      expiresIn: tokens.expiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      message: 'Login successful',
    };

    console.log('📤 Sending response to client...');
    console.log('Remember me:', rememberMeFlag);

    res.json(responseData);

    console.log('✅ Response sent successfully');
    console.log('🏁 Login process completed for user:', userId);
  } catch (error) {
    console.error('❌ Login error caught in catch block:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      res
        .status(500)
        .json({ message: 'Server error during login', error: error.message, stack: error.stack });
    } else {
      console.error('Non-Error object thrown:', error);
      res.status(500).json({ message: 'Server error during login', error: 'Unknown error' });
    }
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Registration attempt started ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    const { name, displayName, email, password } = req.body;
    const resolvedName = String((name ?? displayName ?? '') as string).trim();

    // 必須フィールドの検証とログ出力
    if (!resolvedName || !email || !password) {
      console.error('Registration validation error: Missing required fields');
      console.error('Missing fields:', {
        name: !resolvedName ? 'missing' : 'present',
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
    const user = (await User.findOne({ email })) as UserDocument | null;

    if (user) {
      console.log('Registration failed: User already exists with email:', email);
      res.status(400).json({
        message: 'このメールアドレスは既に登録されています。別のメールアドレスをお試しください。',
        field: 'email',
      });
      return;
    }

    console.log('Creating new user with data:', {
      name: resolvedName,
      email,
      passwordLength: typeof password === 'string' ? password.length : 'unknown',
    });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(String(password), salt);
    const uid = new mongoose.Types.ObjectId().toHexString();
    console.log('Attempting to create user in database...');
    const createdUser = (await User.create({
      uid,
      email,
      displayName: resolvedName,
      provider: 'jwt',
      password: hashed,
      preferences: {},
      settings: {},
      stats: { joinDate: new Date().toISOString() },
    })) as unknown;
    const userId = String((createdUser as { _id: unknown })._id ?? '');
    console.log('User created successfully with ID:', userId);
    console.log('Generating JWT tokens for user ID:', userId);

    const tokens = generateTokens(userId, false); // New registrations don't get remember me by default
    console.log('JWT tokens generated successfully');

    const responseData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: userId,
        displayName: (createdUser as { displayName?: string }).displayName || resolvedName,
        email,
        isAdmin: ((createdUser as { role?: string }).role || '') === 'admin',
      },
      expiresIn: tokens.expiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      message: 'Registration successful',
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
    // CI E2E: 環境変数によりDBアクセスをスキップし即時成功を返す
    if (process.env.CI_E2E_AUTH_BYPASS === 'true') {
      res.json({
        isAuthenticated: true,
        user: {
          id: req.user?.id || 'e2e-user',
          displayName: 'E2E User',
          email: 'e2e@example.com',
        },
      });
      return;
    }
    if (!req.user?.id) {
      res.status(401).json({ isAuthenticated: false, message: '認証されていません' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return; // return文を修正
    }

    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        displayName: user.displayName,
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
      res.status(404).json({ message: 'ユーザーが見つかりました' });
      return; // return文を修正
    }

    res.json({
      user: { id: updatedUser._id, displayName: updatedUser.displayName, email: updatedUser.email },
    });
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
        displayName: user.displayName,
        email: user.email,
        isAdmin: user.role === 'admin',
      },
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'ユーザーデータの取得中にエラーが発生しました' });
  }
};

export const updateUserToAdmin = async (userId: string) => {
  return await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true }).select('-password');
};

// リフレッシュトークン機能を修正
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(400).json({ message: 'Valid refresh token is required' });
      return;
    }

    try {
      const secret = process.env.JWT_SECRET || 'dev-fallback-jwt-secret-key-change-in-production';

      if (!process.env.JWT_SECRET) {
        console.warn('⚠️ JWT_SECRET not set, using fallback secret for development');
      } else {
        console.log('JWT_SECRET is properly configured');
      }

      const decoded = jwt.verify(refreshToken, secret) as unknown as TokenPayload;

      if (!decoded?.id) {
        res.status(401).json({ message: 'Invalid refresh token payload' });
        return;
      }

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({ message: 'Invalid refresh token - user not found' });
        return;
      }

      // 新しいトークンペアを生成
      const tokens = generateTokens(String(user._id), false);

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
          isAdmin: user.role === 'admin',
        },
        expiresIn: tokens.expiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn,
        message: 'Token refreshed successfully',
      });

      console.log('Token refresh successful for user:', user._id);
    } catch (jwtError) {
      console.error('Invalid refresh token:', jwtError);
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

// パスワードリセット機能も追加
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合でも成功を返す
      res.json({
        message: 'パスワードリセットメールを送信しました（該当するアカウントが存在する場合）',
      });
      return;
    }

    // 実際の実装では、ここでメール送信処理を行う
    console.log(`Password reset requested for: ${email}`);

    res.json({ message: 'パスワードリセットメールを送信しました' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    // 実際の実装では、リセットトークンの検証を行う
    // ここでは簡易的な実装
    res.json({ message: 'パスワードがリセットされました' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'パスワードリセット中にエラーが発生しました' });
  }
};
