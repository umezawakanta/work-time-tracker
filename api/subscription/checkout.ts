import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' } as any);
    return;
  }
  // Minimal mock: immediately return a session URL pointing back to success state
  const base =
    process.env.VITE_APP_URL || (typeof req.headers.origin === 'string' ? req.headers.origin : '');
  const sessionUrl = `${base || ''}/subscription?success=1`;
  res.status(200).json({ sessionUrl } as any);
}
