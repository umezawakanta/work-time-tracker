import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log('*** AUTH CHECK ENDPOINT HIT ***');

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        isAuthenticated: false,
        error: 'No valid authorization header',
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (token.length < 10) {
      res.status(401).json({
        isAuthenticated: false,
        error: 'Invalid token format',
      });
      return;
    }

    res.status(200).json({
      isAuthenticated: true,
      message: 'Authentication check successful',
      timestamp: new Date().toISOString(),
      user: {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
      },
    });
  } catch (error) {
    console.error('❌ Auth check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
