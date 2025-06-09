import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Enhanced CORS設定
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://work-time-tracker-5d9q.vercel.app',
    ];

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
      console.log('*** AUTH CHECK PREFLIGHT REQUEST ***');
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log('*** AUTH CHECK ENDPOINT HIT ***');
    console.log('Origin:', origin);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      res.status(401).json({
        isAuthenticated: false,
        error: 'No valid authorization header',
        message: '認証ヘッダーが見つかりません',
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token received:', token.substring(0, 20) + '...');

    // Validate token format (should start with auth_token_)
    if (!token.startsWith('auth_token_') && !token.startsWith('demo_token_')) {
      console.log('❌ Invalid token format');
      res.status(401).json({
        isAuthenticated: false,
        error: 'Invalid token format',
        message: 'トークンの形式が正しくありません',
      });
      return;
    }

    if (token.length < 20) {
      console.log('❌ Token too short');
      res.status(401).json({
        isAuthenticated: false,
        error: 'Invalid token length',
        message: 'トークンが無効です',
      });
      return;
    }

    // For demo purposes, accept any valid token format and return user info
    // In a real app, you would validate against database
    console.log('✅ Token validation successful');

    // Extract timestamp from token to determine user session
    const tokenParts = token.split('_');
    const isOldToken = token.startsWith('demo_token_');

    // Default user info (in real app, this would come from database based on token)
    const user = {
      id: isOldToken ? 'demo_user' : 'auth_user',
      _id: isOldToken ? 'demo_user' : 'auth_user',
      name: 'Authenticated User',
      username: 'user',
      email: 'user@example.com',
      isAdmin: false,
      avatar: '',
    };

    res.status(200).json({
      isAuthenticated: true,
      message: '認証確認が成功しました',
      timestamp: new Date().toISOString(),
      user: user,
      tokenType: isOldToken ? 'demo' : 'auth',
    });
  } catch (error) {
    console.error('❌ Auth check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
      isAuthenticated: false,
    });
  }
}
