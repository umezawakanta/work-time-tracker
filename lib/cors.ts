import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function cors(req: VercelRequest, res: VercelResponse) {
  // 許可するオリジンを設定
  const extra = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://work-time-tracker-five.vercel.app',
    ...extra,
  ];

  const origin = req.headers.origin;
  const isPreview = Boolean(
    origin && /^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/.test(origin)
  );
  const isAllowed = Boolean(origin && (allowedOrigins.includes(origin) || isPreview));
  if (isAllowed && origin) res.setHeader('Access-Control-Allow-Origin', origin);

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, stripe-signature, X-User-Id, X-User-Role'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
}
