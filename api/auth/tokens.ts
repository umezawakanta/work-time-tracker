import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

// インメモリストレージ（実際の本番環境ではデータベースを使用）
const tokenStorage = new Map<string, TokenPair>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'HEAD') {
    res.status(200).end();
    return;
  }

  if (req.method === 'DELETE') {
    res.status(200).json({ message: 'Token deleted' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
