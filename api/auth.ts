import { VercelRequest, VercelResponse } from '@vercel/node';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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

  // URLから操作を判定
  const { url } = req;
  const path = url?.split('?')[0]; // クエリパラメータを除去

  try {
    if (path?.endsWith('/auth/login') || path?.endsWith('/auth')) {
      return await handleLogin(req, res);
    } else if (path?.endsWith('/auth/register')) {
      return await handleRegister(req, res);
    } else if (path?.endsWith('/auth/check')) {
      return await handleCheck(req, res);
    } else if (path?.endsWith('/auth/user')) {
      return await handleUser(req, res);
    } else if (path?.endsWith('/auth/password-reset')) {
      return await handlePasswordReset(req, res);
    } else if (path?.includes('/auth/password-reset/verify')) {
      return await handlePasswordResetVerify(req, res);
    } else {
      return res.status(404).json({ error: 'Auth endpoint not found' });
    }
  } catch (error) {
    console.error('❌ Auth API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
    });
  }
}

// ログイン処理
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, rememberMe = false }: LoginRequest = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      message: 'メールアドレスとパスワードは必須です',
    });
  }

  // デモ環境の認証ロジック
  const adminEmails = ['admin@example.com', 'demo@example.com', 'test@example.com'];
  const isValidDemo = email.includes('demo') || email.includes('test') || adminEmails.includes(email);
  const isPasswordValid = password.length >= 3;

  if (!isValidDemo || !isPasswordValid) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'メールアドレスまたはパスワードが正しくありません',
    });
  }

  // JWT風のトークンを生成（デモ用）
  const token = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const user = {
    id: `user_${Date.now()}`,
    _id: `user_${Date.now()}`,
    name: email.includes('admin') ? 'Admin User' : email.includes('demo') ? 'Demo User' : 'Test User',
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

  return res.status(200).json(response);
}

// ユーザー登録処理
async function handleRegister(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, confirmPassword }: RegisterRequest = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      error: 'All fields are required',
      message: 'すべてのフィールドは必須です',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      error: 'Passwords do not match',
      message: 'パスワードが一致しません',
    });
  }

  const token = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const user = {
    id: `user_${Date.now()}`,
    _id: `user_${Date.now()}`,
    name,
    username: email.split('@')[0],
    email,
    isAdmin: false,
    avatar: '',
  };

  return res.status(201).json({
    token,
    user,
    message: 'ユーザー登録が完了しました',
  });
}

// 認証チェック処理
async function handleCheck(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      isAuthenticated: false,
      error: 'No valid authorization header',
    });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token.length < 10) {
    return res.status(401).json({
      isAuthenticated: false,
      error: 'Invalid token format',
    });
  }

  return res.status(200).json({
    isAuthenticated: true,
    message: 'Authentication check successful',
    timestamp: new Date().toISOString(),
    user: {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
    },
  });
}

// ユーザー情報取得処理
async function handleUser(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    user: {
      id: 'demo-user',
      _id: 'demo-user-id',
      name: 'Demo User',
      username: 'demouser',
      email: 'demo@example.com',
      isAdmin: true,
      avatar: '',
    },
  });
}

// パスワードリセット処理
async function handlePasswordReset(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Email is required',
      message: 'メールアドレスは必須です',
    });
  }

  return res.status(200).json({
    message: 'パスワードリセットメールを送信しました',
    resetToken: `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}

// パスワードリセット確認処理
async function handlePasswordResetVerify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      error: 'Token and new password are required',
      message: 'トークンと新しいパスワードは必須です',
    });
  }

  return res.status(200).json({
    message: 'パスワードがリセットされました',
    success: true,
  });
} 