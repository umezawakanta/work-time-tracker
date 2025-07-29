import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function cors(req: VercelRequest, res: VercelResponse) {
  // 許可するオリジンを設定
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://work-time-tracker.vercel.app',
    process.env.CORS_ALLOWED_ORIGINS || '',
  ].filter(Boolean);

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, stripe-signature'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
