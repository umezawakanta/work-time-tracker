import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
// Lazy-load server modules to avoid bundle-time resolution issues
let connectDB: (() => Promise<void>) | null = null;
let User: any = null;
async function loadServerModules(): Promise<boolean> {
  if (connectDB && User) return true;
  try {
    const dbModPath = '../../src/server/config/' + 'database.js';
    const dbMod = await import(dbModPath as string);
    connectDB = (dbMod as any).connectDB as () => Promise<void>;
    const userModPath = '../../src/server/models/' + 'User.js';
    const userMod = await import(userModPath as string);
    User = (userMod as any).User;
    return true;
  } catch {
    return false;
  }
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  expiresIn?: number;
  refreshExpiresIn?: number;
  message: string;
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isVercelPreview =
    origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'POSTメソッドのみ許可されています',
    });
    return;
  }

  try {
    const { refreshToken }: RefreshTokenRequest = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
        message: 'リフレッシュトークンが必要です',
      });
      return;
    }

    console.log('🔄 Refreshing tokens...');

    // Connect to database
    const loaded = await loadServerModules();
    if (!loaded || !connectDB) throw new Error('Server modules not available');
    await connectDB();

    // Verify refresh token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(refreshToken, jwtSecret, {
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      });
    } catch (jwtError) {
      console.log('❌ Invalid refresh token:', jwtError);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        message: '無効なリフレッシュトークンです',
      });
      return;
    }

    // Get user from database
    const user = await User.findOne({
      $or: [{ _id: decodedToken.userId }, { id: decodedToken.userId }],
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'ユーザーが見つかりません',
      });
      return;
    }

    // Check user status
    if (user.status !== 'active') {
      res.status(401).json({
        success: false,
        error: 'Account inactive',
        message: 'アカウントが無効です',
      });
      return;
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      jwtSecret,
      {
        expiresIn: '1h',
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      }
    );

    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'refresh',
      },
      jwtSecret,
      {
        expiresIn: '7d',
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      }
    );

    // Update last activity
    user.lastActivityAt = new Date();
    await user.save();

    const response: RefreshResponse = {
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
      expiresIn: 3600, // 1 hour
      refreshExpiresIn: 604800, // 7 days
      message: 'トークンを更新しました',
    };

    console.log('✅ Token refresh successful for user:', user.email);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'トークン更新中にエラーが発生しました',
    });
  }
}
