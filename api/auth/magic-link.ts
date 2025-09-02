import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';

type MagicLinkRequest = {
  email?: string;
};

type MagicLinkResponse = {
  success: true;
  message: string;
  email: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false as any, message: 'Method Not Allowed' } as any);
    return;
  }

  try {
    const body: MagicLinkRequest = (req.body || {}) as MagicLinkRequest;
    const emailRaw = String(body.email || '')
      .trim()
      .toLowerCase();

    if (!emailRaw) {
      res.status(400).json({ success: false as any, message: 'Email is required' } as any);
      return;
    }
    if (!isValidEmail(emailRaw)) {
      res.status(400).json({ success: false as any, message: 'Invalid email format' } as any);
      return;
    }

    // 現時点では実装されていないため、モック返却は行わず未実装を返す
    res
      .status(501)
      .json({ success: false as any, message: 'Magic link login is not enabled' } as any);
  } catch (error) {
    console.error('[MAGIC-LINK] Error:', error);
    res.status(500).json({ success: false as any, message: 'Internal Server Error' } as any);
  }
}

module.exports = handler;
