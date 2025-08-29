import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listErrorReports } from '../_lib/errorStore';
import { cors } from '../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await cors(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' } as any);
    return;
  }
  try {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit || 50)));
    const rows = await listErrorReports(limit);
    res.status(200).json({ success: true, data: rows } as any);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch error reports' } as any);
  }
}
