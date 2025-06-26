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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ログ出力（デバッグ用）
  console.log(`📡 Token API: ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // HEADリクエストのサポート（健全性チェック用）
  if (req.method === 'HEAD') {
    res.status(200).end();
    return;
  }

  try {
    const userId = 'default-user'; // 実際の実装では認証から取得

    switch (req.method) {
      case 'GET': {
        // トークンを取得
        console.log(`🔍 Getting tokens for user: ${userId}`);
        const tokens = tokenStorage.get(userId);
        if (!tokens) {
          console.log(`📝 No tokens found for user: ${userId}`);
          return res.status(404).json({
            error: 'Tokens not found',
            message: 'No tokens exist for this user',
          });
        }
        console.log(`✅ Tokens found for user: ${userId}`);
        return res.status(200).json(tokens);
      }

      case 'POST': {
        // トークンを保存
        console.log(`💾 Saving tokens for user: ${userId}`);
        const tokenData = req.body as TokenPair;
        if (!tokenData.accessToken || !tokenData.refreshToken) {
          console.log(`❌ Invalid token data:`, {
            hasAccessToken: !!tokenData.accessToken,
            hasRefreshToken: !!tokenData.refreshToken,
          });
          return res.status(400).json({ error: 'Invalid token data' });
        }
        tokenStorage.set(userId, tokenData);
        console.log(`✅ Tokens saved successfully for user: ${userId}`);
        return res.status(200).json({ message: 'Tokens saved successfully' });
      }

      case 'DELETE': {
        // トークンを削除
        console.log(`🗑️ Deleting tokens for user: ${userId}`);
        const existed = tokenStorage.has(userId);
        tokenStorage.delete(userId);
        console.log(`✅ Tokens deleted for user: ${userId} (existed: ${existed})`);
        return res.status(200).json({
          message: 'Tokens deleted successfully',
          existed,
        });
      }

      default:
        console.log(`❌ Method not allowed: ${req.method}`);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Token endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
