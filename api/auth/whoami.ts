import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
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

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, status: 401, code: 'UNAUTHORIZED', message: '認証が必要です' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'work-time-tracker',
      audience: 'work-time-tracker-users',
    }) as any;

    return res.status(200).json({
      success: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        roles: Array.isArray((decoded as any).roles)
          ? ((decoded as any).roles as string[])
          : undefined,
        isAdmin:
          (decoded as any).isAdmin === true ||
          decoded.role === 'admin' ||
          (Array.isArray((decoded as any).roles) &&
            ((decoded as any).roles as string[]).includes('admin')),
        isVerified: decoded.isVerified,
      },
    });
  } catch (e) {
    return res.status(401).json({
      success: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: '無効な認証トークンです',
    });
  }
}
