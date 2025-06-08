import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('*** USER DATA API ***');
  console.log('Authorization header:', req.headers.authorization);

  // 基本的な認証チェック
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No valid authorization header',
    });
  }

  // 本番環境用のデモユーザーデータを返す（authApi.tsの期待する形式）
  return res.status(200).json({
    user: {
      id: 'demo-user',
      _id: 'demo-user-id',
      name: 'Demo User',
      username: 'demouser',
      email: 'demo@example.com',
      isAdmin: true,
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        language: 'ja',
        notifications: true,
      },
    },
  });
}
