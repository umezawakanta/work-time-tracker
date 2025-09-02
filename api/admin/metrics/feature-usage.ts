import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../lib/cors';
import { requireAdmin } from '../../../lib/authAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ctx = requireAdmin(req, res);
  if (!ctx) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const data = { ai_ok: 12, assessment_saved: 7, learning_saved: 3 };
  return res.status(200).json({ ok: true, data });
}
