import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ForgotPasswordRequest {
  email: string;
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
      console.log('*** FORGOT PASSWORD PREFLIGHT REQUEST ***');
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log('*** AUTH FORGOT PASSWORD ENDPOINT HIT ***');
    console.log('Origin:', origin);

    const { email }: ForgotPasswordRequest = req.body;

    if (!email) {
      res.status(400).json({
        error: 'Email is required',
        message: 'メールアドレスは必須です',
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

    // For demo purposes, always return success
    // In a real app, you would generate a reset token and send email
    console.log('Password reset requested for:', email);

    res.status(200).json({
      success: true,
      message: 'パスワードリセットのメールを送信しました（デモ環境のため実際には送信されません）',
      email: email,
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
