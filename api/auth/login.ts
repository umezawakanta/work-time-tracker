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

    console.log('Parsed login data:', {
      email,
      password: password ? '***' : 'missing',
      rememberMe: _rememberMe,
    });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      res.status(400).json({
        error: 'Email and password are required',
        message: 'メールアドレスとパスワードは必須です',
      });
      return;
    }

    // Real user authentication with predefined user database
    console.log('🔍 Validating credentials against user database...');

    // Predefined user database
    const users = [
      {
        id: 'user_1',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Administrator',
        username: 'admin',
        isAdmin: true,
      },
      {
        id: 'user_2',
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Demo User',
        username: 'demo',
        isAdmin: false,
      },
      {
        id: 'user_3',
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
        username: 'test',
        isAdmin: false,
      },
      {
        id: 'user_4',
        email: 'user@example.com',
        password: 'user123',
        name: 'General User',
        username: 'user',
        isAdmin: false,
      },
      {
        id: 'user_5',
        email: 'developer@example.com',
        password: 'dev123',
        name: 'Developer',
        username: 'developer',
        isAdmin: true,
      },
    ];

    // Find user by email
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log('❌ User not found:', email);
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'メールアドレスまたはパスワードが正しくありません',
        hint: '利用可能なアカウント: admin@example.com, demo@example.com, test@example.com, user@example.com, developer@example.com',
      });
      return;
    }

    // Validate password
    if (user.password !== password) {
      console.log('❌ Invalid password for user:', email);
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'メールアドレスまたはパスワードが正しくありません',
      });
      return;
    }

    console.log('✅ Authentication successful for:', email);

    const token = `auth_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const authenticatedUser = {
      id: user.id,
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: '',
    };

    const response: LoginResponse = {
      token,
      user: authenticatedUser,
      message: 'ログインに成功しました',
    };

    console.log('✅ Login successful for:', email, 'Admin:', user.isAdmin);
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
