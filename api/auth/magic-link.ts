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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
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
    const emailRaw = String(body.email || '').trim().toLowerCase();

    if (!emailRaw) {
      res.status(400).json({ success: false as any, message: 'Email is required' } as any);
      return;
    }
    if (!isValidEmail(emailRaw)) {
      res
        .status(400)
        .json({ success: false as any, message: 'Invalid email format' } as any);
      return;
    }

    // In a real implementation, create a one-time token and send email with login URL.
    // For demo/preview environments, we just return success.
    const response: MagicLinkResponse = {
      success: true,
      message: 'マジックリンクを送信しました（デモ環境: 実際の送信は行われません）',
      email: emailRaw,
    };
    res.status(200).json(response as any);
  } catch (error) {
    console.error('[MAGIC-LINK] Error:', error);
    res.status(500).json({ success: false as any, message: 'Internal Server Error' } as any);
  }
}


