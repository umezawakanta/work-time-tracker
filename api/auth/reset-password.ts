import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Enhanced CORS設定
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
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
      console.log('*** RESET PASSWORD PREFLIGHT REQUEST ***');
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log('*** AUTH RESET PASSWORD ENDPOINT HIT ***');
    console.log('Origin:', origin);

    const { token, password, confirmPassword }: ResetPasswordRequest = req.body;

    if (!token || !password || !confirmPassword) {
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

    if (password.length < 3) {
      res.status(400).json({
        error: 'Password too short',
        message: 'パスワードは3文字以上である必要があります',
      });
      return;
    }

    // For demo purposes, accept any token and allow password reset
    // In a real app, you would validate the token against the database
    console.log('Password reset completed for token:', token);

    res.status(200).json({
      success: true,
      message: 'パスワードをリセットしました',
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
