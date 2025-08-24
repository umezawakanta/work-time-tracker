import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    return res.status(200).json({
      success: true,
      status: 'OK',
      provider: 'anthropic',
      hasApiKey: Boolean(anthropicKey),
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(200).json({ success: true, status: 'DEGRADED', hasApiKey: false });
  }
}
