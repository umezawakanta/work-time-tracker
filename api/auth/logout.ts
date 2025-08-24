import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORSヘッダーの設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONSリクエストへの対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // トークンの検証（オプション）
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const userId = await verifyToken(token);

      // ここで必要に応じてサーバーサイドのセッション削除やログ記録を行う
      console.log(`User ${userId} logged out`);
    }

    // クライアントに成功レスポンスを返す
    // （実際のトークン削除はクライアント側で行われる）
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // エラーが発生してもログアウト自体は成功させる
    return res.status(200).json({
      success: true,
      message: 'Logout completed with warnings',
    });
  }
}
