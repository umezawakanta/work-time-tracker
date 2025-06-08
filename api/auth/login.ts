import { VercelRequest, VercelResponse } from '@vercel/node';

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
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, rememberMe = false }: LoginRequest = req.body;

    // バリデーション
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        message: 'メールアドレスとパスワードは必須です',
      });
    }

    // デモ環境の認証ロジック
    const adminEmails = ['admin@example.com', 'demo@example.com', 'test@example.com'];
    const isValidDemo =
      email.includes('demo') || email.includes('test') || adminEmails.includes(email);
    const isPasswordValid = password.length >= 3; // デモ用の簡単な検証

    if (!isValidDemo || !isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'メールアドレスまたはパスワードが正しくありません',
      });
    }

    // JWT風のトークンを生成（デモ用）
    const token = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ユーザー情報を作成
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

    console.log('✅ Login successful:', {
      email: user.email,
      isAdmin: user.isAdmin,
      rememberMe,
    });

    const response: LoginResponse = {
      token,
      user,
      message: 'ログインに成功しました',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
    });
  }
}
