import { VercelRequest, VercelResponse } from '@vercel/node';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

// インメモリストレージ（実際の本番環境ではデータベースを使用）
const tokenStorage = new Map<string, TokenPair>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const userId = 'default-user'; // 実際の実装では認証から取得

    switch (req.method) {
      case 'GET': {
        // トークンを取得
        const tokens = tokenStorage.get(userId);
        if (!tokens) {
          return res.status(404).json({ error: 'Tokens not found' });
        }
        return res.status(200).json(tokens);
      }

      case 'POST': {
        // トークンを保存
        const tokenData = req.body as TokenPair;
        if (!tokenData.accessToken || !tokenData.refreshToken) {
          return res.status(400).json({ error: 'Invalid token data' });
        }
        tokenStorage.set(userId, tokenData);
        return res.status(200).json({ message: 'Tokens saved successfully' });
      }

      case 'DELETE': {
        // トークンを削除
        tokenStorage.delete(userId);
        return res.status(200).json({ message: 'Tokens deleted successfully' });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Token endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
