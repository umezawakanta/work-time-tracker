import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    _id: string;
    name: string;
    username: string;
    email: string;
    isAdmin: boolean;
    avatar: string;
  };
  message: string;
}

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
      console.log('*** PREFLIGHT REQUEST ***');
      console.log('Origin:', origin);
      console.log('Method:', req.headers['access-control-request-method']);
      console.log('Headers:', req.headers['access-control-request-headers']);
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log('*** AUTH LOGIN ENDPOINT HIT ***');
    console.log('Origin:', origin);
    console.log('Request body:', req.body);

    const { email, password, rememberMe: _rememberMe = false }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required',
        message: 'メールアドレスとパスワードは必須です',
      });
      return;
    }

    // デモ環境の認証ロジック
    const adminEmails = ['admin@example.com', 'demo@example.com', 'test@example.com'];
    const isValidDemo =
      email.includes('demo') || email.includes('test') || adminEmails.includes(email);
    const isPasswordValid = password.length >= 3;

    if (!isValidDemo || !isPasswordValid) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'メールアドレスまたはパスワードが正しくありません',
      });
      return;
    }

    const token = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: `user_${Date.now()}`,
      _id: `user_${Date.now()}`,
      name: email.includes('admin')
        ? 'Admin User'
        : email.includes('demo')
          ? 'Demo User'
          : 'Test User',
      username: email.split('@')[0],
      email: email,
      isAdmin: adminEmails.includes(email) || email.includes('admin'),
      avatar: '',
    };

    const response: LoginResponse = {
      token,
      user,
      message: 'ログインに成功しました',
    };

    console.log('Login successful for:', email);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
