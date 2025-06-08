import { VercelRequest, VercelResponse } from '@vercel/node';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
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
  message: string;
  expiresIn: number;
  refreshExpiresIn: number;
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
    const { name, email, password }: RegisterRequest = req.body;

    // バリデーション
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required',
        message: '名前、メールアドレス、パスワードは必須です',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'パスワードは6文字以上である必要があります',
      });
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: '有効なメールアドレスを入力してください',
      });
    }

    // デモ環境での登録処理
    const adminEmails = ['admin@example.com', 'demo@example.com'];
    const isAdmin = adminEmails.includes(email) || email.includes('admin');

    // JWT風のトークンを生成（デモ用）
    const accessToken = `demo_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refreshToken = `demo_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ユーザー情報を作成
    const user = {
      id: `user_${Date.now()}`,
      _id: `user_${Date.now()}`,
      name: name,
      username: email.split('@')[0],
      email: email,
      isAdmin: isAdmin,
      avatar: '',
    };

    console.log('✅ User registered successfully:', {
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    });

    const response: RegisterResponse = {
      accessToken,
      refreshToken,
      user,
      message: '登録が完了しました',
      expiresIn: 3600, // 1時間
      refreshExpiresIn: 604800, // 7日間
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
    });
  }
}
