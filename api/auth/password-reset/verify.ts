import { VercelRequest, VercelResponse } from '@vercel/node';

interface VerifyTokenRequest {
  token: string;
}

// 簡易的なリセットトークンストレージ（デモ用）
// 実際の実装では外部データベースやRedisなどを使用
const resetTokens = new Map<string, { email: string; expires: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'サポートされていないHTTPメソッドです'
    });
  }

  try {
    const { token }: VerifyTokenRequest = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'トークンは必須です'
      });
    }

    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(404).json({
        error: 'Invalid Token',
        message: '無効なトークンです',
        valid: false
      });
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return res.status(400).json({
        error: 'Token Expired',
        message: 'トークンの有効期限が切れています',
        valid: false
      });
    }

    console.log('✅ トークン検証成功:', {
      token,
      email: tokenData.email,
      expires: new Date(tokenData.expires).toISOString()
    });

    return res.status(200).json({
      valid: true,
      message: 'トークンは有効です'
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'サーバーエラーが発生しました',
      valid: false
    });
  }
} 