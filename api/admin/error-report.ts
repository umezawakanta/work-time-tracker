import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveErrorReport } from '../_lib/errorStore';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' } as any);
    return;
  }
  try {
    const { email, url, userAgent, message, stack, componentStack } = (req.body || {}) as Record<
      string,
      unknown
    >;
    await saveErrorReport({
      email: typeof email === 'string' ? email : undefined,
      url: typeof url === 'string' ? url : undefined,
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
      message: String(message || ''),
      stack: typeof stack === 'string' ? stack : undefined,
      componentStack: typeof componentStack === 'string' ? componentStack : undefined,
    });
    res.status(200).json({ success: true } as any);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to save error report' } as any);
  }
}


