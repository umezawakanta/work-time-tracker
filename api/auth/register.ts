import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
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
      console.log('*** REGISTER PREFLIGHT REQUEST ***');
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

    console.log('*** AUTH REGISTER ENDPOINT HIT ***');
    console.log('Origin:', origin);
    console.log('Request body:', req.body);

    const { name, email, password, confirmPassword }: RegisterRequest = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({
        error: 'All fields are required',
        message: 'すべてのフィールドは必須です',
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        error: 'Passwords do not match',
        message: 'パスワードが一致しません',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: 'Password too short',
        message: 'パスワードは6文字以上である必要があります',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'Invalid email format',
        message: 'メールアドレスの形式が正しくありません',
      });
      return;
    }

    // Check against existing predefined users (same as login.ts)
    const existingUsers = [
      'admin@example.com',
      'demo@example.com',
      'test@example.com',
      'user@example.com',
      'developer@example.com',
    ];

    if (existingUsers.includes(email.toLowerCase())) {
      res.status(409).json({
        error: 'User already exists',
        message: 'このメールアドレスは既に登録されています',
        hint: '既存のアカウントでログインしてください',
      });
      return;
    }

    // For demo purposes, we'll simulate successful registration
    // In a real app, you would save to database
    const userId = `user_${Date.now()}`;
    const token = `auth_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = {
      id: userId,
      _id: userId,
      name: name,
      username: email.split('@')[0],
      email: email,
      isAdmin: false,
      avatar: '',
    };

    // Log the registration for tracking (in real app, save to database)
    console.log('✅ New user registered:', {
      email,
      name,
      userId,
      timestamp: new Date().toISOString(),
    });

    const response: RegisterResponse = {
      token,
      user,
      message:
        'ユーザー登録が完了しました。デモ環境のため、ログイン時は事前定義されたアカウントをご利用ください。',
    };

    console.log('Registration successful for:', email);
    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
