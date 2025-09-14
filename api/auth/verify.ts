import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS設定
  const origin = req.headers.origin;
  // Add all trusted preview origins here (explicitly enumerate if possible)
  // (For dynamic environments, consider using env vars or a config to auto-list legitimate preview domains)
  const allowedOrigins = [
    'http://localhost:3000',
    'https://work-time-tracker-five.vercel.app',
    // For example, explicitly list expected preview deploy URLs:
    // 'https://work-time-tracker-five-abcde123.vercel.app',
    // 'https://work-time-tracker-five-fghij456.vercel.app',
  ];

  // Block 'null' and only allow origins that are explicitly whitelisted.
  const isAllowedOrigin = origin
    && origin !== "null"
    && origin !== null
    && allowedOrigins.includes(origin);

  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // Do NOT set Access-Control-Allow-Origin: '*' if credentials are involved.
    res.setHeader('Access-Control-Allow-Origin', ''); // Set to empty string or consider omitting header entirely.
    res.setHeader('Access-Control-Allow-Credentials', 'false');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization header missing or invalid' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // トークンが有効な場合、ユーザー情報を返す
      return res.status(200).json({
        success: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          displayName: decoded.displayName || 'User',
          role: decoded.role || 'user',
          isVerified: true,
          isAdmin: decoded.isAdmin || false,
          roles: decoded.roles || []
        },
        message: 'Token is valid'
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
