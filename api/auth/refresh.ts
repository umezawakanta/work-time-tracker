import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    _id: string;
    name: string;
    username: string;
    email: string;
    isAdmin: boolean;
    avatar: string;
  };
  expiresIn: number;
  refreshExpiresIn: number;
  message: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Enhanced CORS設定
    const origin = req.headers.origin;
    const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-5d9q.vercel.app'];

    // Allow all Vercel preview deployments
    const isVercelPreview =
      origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
    const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);

    res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('*** PREFLIGHT REQUEST ***');
      console.log('Origin:', origin);
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log('*** AUTH REFRESH ENDPOINT HIT ***');
    console.log('Origin:', origin);

    const { refreshToken }: RefreshRequest = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      console.log('❌ Missing or invalid refresh token');
      res.status(400).json({
        error: 'Valid refresh token is required',
        message: '有効なリフレッシュトークンが必要です',
      });
      return;
    }

    // Simple token validation - check if it's a valid refresh token format
    if (!refreshToken.startsWith('refresh_')) {
      console.log('❌ Invalid refresh token format');
      res.status(401).json({
        error: 'Invalid refresh token',
        message: '無効なリフレッシュトークンです',
      });
      return;
    }

    console.log('🔄 Refreshing tokens...');

    // Extract user info from token (simplified approach)
    // In a real app, you'd validate against a database and decode JWT
    const tokenParts = refreshToken.split('_');
    if (tokenParts.length < 3) {
      console.log('❌ Malformed refresh token');
      res.status(401).json({
        error: 'Invalid refresh token',
        message: '無効なリフレッシュトークンです',
      });
      return;
    }

    // For demo purposes, create a mock user based on the token
    // In production, you'd fetch the user from the database
    const mockUser = {
      id: 'refresh_user_' + Date.now(),
      email: 'demo@example.com',
      name: 'Demo User',
      username: 'demo',
      isAdmin: false,
    };

    // Generate new tokens
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9);

    const accessToken = `access_${timestamp}_${randomPart}`;
    const newRefreshToken = `refresh_${timestamp}_${randomPart}`;

    // Token expiration times
    const expiresIn = 3600; // 1 hour for access token
    const refreshExpiresIn = 604800; // 7 days for refresh token

    const authenticatedUser = {
      id: mockUser.id,
      _id: mockUser.id,
      name: mockUser.name,
      username: mockUser.username,
      email: mockUser.email,
      isAdmin: mockUser.isAdmin,
      avatar: '',
    };

    const response: RefreshResponse = {
      accessToken,
      refreshToken: newRefreshToken,
      user: authenticatedUser,
      expiresIn,
      refreshExpiresIn,
      message: 'トークンを更新しました',
    };

    console.log('✅ Token refresh successful');
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
