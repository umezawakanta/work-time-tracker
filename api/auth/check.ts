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

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      isAuthenticated: false,
      error: 'No valid authorization header',
    });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token.length < 10) {
    return res.status(401).json({
      isAuthenticated: false,
      error: 'Invalid token format',
    });
  }

  return res.status(200).json({
    isAuthenticated: true,
    message: 'Authentication check successful',
    timestamp: new Date().toISOString(),
    user: {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
    },
  });
}
