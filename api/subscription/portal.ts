interface VercelRequest {
  method?: string;
  headers: any;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: any) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 同一オリジンのモックポータルページに遷移（Docs/将来のポータルへ置換可）
  const url = 'https://work-time-tracker-five.vercel.app/subscription?portal=1';
  res.status(200).json({ url });
}

module.exports = handler as any;

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
  // Minimal mock portal URL
  const base =
    process.env.VITE_APP_URL || (typeof req.headers.origin === 'string' ? req.headers.origin : '');
  const url = `${base || ''}/subscription?portal=1`;
  res.status(200).json({ url } as any);
}
