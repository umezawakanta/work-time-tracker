import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-5d9q.vercel.app'];
  const isPreview = origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);
  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin! : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      status: 405,
      code: 'METHOD_NOT_ALLOWED',
      message: '許可されていないメソッドです',
    });
  }

  const requestId = (req.headers['x-request-id'] as string) || undefined;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(200).json({ success: true, auth: false, requestId });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'work-time-tracker',
      audience: 'work-time-tracker-users',
    }) as any;

    const user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isVerified: decoded.isVerified,
    };

    return res.status(200).json({ success: true, auth: true, user, requestId });
  } catch (e) {
    return res.status(200).json({ success: true, auth: false, requestId });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../src/server/config/database';
import { User } from '../../src/server/models/User';

interface AuthCheckResponse {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    isVerified: boolean;
    avatar?: string;
    provider: string;
  };
  error?: string;
  message?: string;
}

// CORS設定関数
function setCorsHeaders(res: VercelResponse, origin: string | undefined) {
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-5d9q.vercel.app'];

  const isVercelPreview =
    origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const origin = req.headers.origin;

    // CORS設定
    setCorsHeaders(res, origin);

    // プリフライトリクエストの処理
    if (req.method === 'OPTIONS') {
      console.log('*** AUTH CHECK PREFLIGHT REQUEST ***');
      res.status(200).end();
      return;
    }

    // HTTPメソッドの検証
    if (req.method !== 'GET') {
      res.status(405).json({
        isAuthenticated: false,
        error: 'Method not allowed',
        message: 'このメソッドは許可されていません',
      } as AuthCheckResponse);
      return;
    }

    console.log('*** AUTH CHECK ENDPOINT HIT ***');
    console.log('Origin:', origin);

    // Authorizationヘッダーの検証
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      res.status(401).json({
        isAuthenticated: false,
        error: 'No valid authorization header',
        message: '認証ヘッダーが見つかりません',
      } as AuthCheckResponse);
      return;
    }

    // トークンの抽出と検証
    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Token received:', token.substring(0, 20) + '...');

    // Connect to database
    await connectDB();

    // JWT検証
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, jwtSecret, {
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      });
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError);
      res.status(401).json({
        isAuthenticated: false,
        error: 'Invalid token',
        message: 'トークンが無効です',
      } as AuthCheckResponse);
      return;
    }

    // データベースからユーザー情報を取得
    const user = await User.findOne({
      $or: [{ _id: decodedToken.userId }, { id: decodedToken.userId }],
    });

    if (!user) {
      console.log('❌ User not found:', decodedToken.userId);
      res.status(401).json({
        isAuthenticated: false,
        error: 'User not found',
        message: 'ユーザーが見つかりません',
      } as AuthCheckResponse);
      return;
    }

    // ユーザー状態確認
    if (user.status !== 'active') {
      console.log('❌ User account inactive:', user.status);
      res.status(401).json({
        isAuthenticated: false,
        error: 'Account inactive',
        message: 'アカウントが無効です',
      } as AuthCheckResponse);
      return;
    }

    // 最終活動時刻を更新
    user.lastActivityAt = new Date();
    await user.save();

    console.log('✅ Authentication successful for user:', user.email);

    // 成功レスポンス
    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        provider: user.provider,
      },
      message: '認証が確認されました',
    } as AuthCheckResponse);
  } catch (error) {
    console.error('❌ Auth check error:', error);
    res.status(500).json({
      isAuthenticated: false,
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
    } as AuthCheckResponse);
  }
}
