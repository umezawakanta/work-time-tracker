import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS対応
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST: トークンの保存（実際にはクライアント側でlocalStorageに保存される）
  if (req.method === 'POST') {
    try {
      const { accessToken, refreshToken, expiresAt, refreshExpiresAt } = req.body;

      if (!accessToken || !refreshToken) {
        return res.status(400).json({
          error: 'Missing required tokens',
          message: 'accessToken and refreshToken are required'
        });
      }

      console.log('🔐 Tokens received and would be stored server-side');
      console.log('  - Access token length:', accessToken.length);
      console.log('  - Refresh token length:', refreshToken.length);
      console.log('  - Expires at:', expiresAt ? new Date(expiresAt).toISOString() : 'not set');
      console.log('  - Refresh expires at:', refreshExpiresAt ? new Date(refreshExpiresAt).toISOString() : 'not set');

      // 実際の保存はクライアント側（localStorage）で行われる
      // ここでは成功レスポンスを返すだけ
      res.status(200).json({
        success: true,
        message: 'Tokens processed successfully',
        stored: {
          accessToken: true,
          refreshToken: true,
          expiresAt: !!expiresAt,
          refreshExpiresAt: !!refreshExpiresAt
        }
      });
    } catch (error) {
      console.error('❌ Token save error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process tokens'
      });
    }
    return;
  }

  // DELETE: トークンの削除
  if (req.method === 'DELETE') {
    try {
      console.log('🗑️ Tokens deletion requested');

      // 実際の削除はクライアント側（localStorage）で行われる
      // ここでは成功レスポンスを返すだけ
      res.status(200).json({
        success: true,
        message: 'Tokens deleted successfully'
      });
    } catch (error) {
      console.error('❌ Token deletion error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete tokens'
      });
    }
    return;
  }

  // GET: トークン状態の確認（ヘルスチェック用）
  if (req.method === 'GET') {
    try {
      console.log('🔍 Token status check requested');

      // サーバー側ではトークンを持っていないので、常に空の状態を返す
      res.status(200).json({
        success: true,
        hasTokens: false,
        message: 'Token status checked (tokens are stored client-side)'
      });
    } catch (error) {
      console.error('❌ Token status check error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check token status'
      });
    }
    return;
  }

  // HEAD: ヘルスチェック用
  if (req.method === 'HEAD') {
    res.status(200).end();
    return;
  }

  // サポートされていないメソッド
  res.setHeader('Allow', 'GET, POST, DELETE, HEAD');
  res.status(405).json({
    error: 'Method not allowed',
    message: `Method ${req.method} is not allowed. Use GET, POST, DELETE, or HEAD.`
  });
}
