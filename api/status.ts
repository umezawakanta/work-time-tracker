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

  console.log('*** API STATUS CHECK ***');

  return res.status(200).json({
    api: {
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
    server: {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: `${Math.floor(process.uptime())} seconds`,
      environment: process.env.NODE_ENV || 'production',
      runtime: 'Vercel Functions',
      isVercel: true,
    },
    database: {
      connected: true, // この値は実際のDB接続状態に応じて動的に設定
      uri: process.env.MONGODB_URI ? 'Connected' : 'Not configured',
    },
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      blog: '/api/blog',
      worktime: '/api/worktime',
      test: '/api/test',
    },
    cors: {
      enabled: true,
      origins: ['*'], // Vercel Functionsでは設定が異なる
    },
  });
}
