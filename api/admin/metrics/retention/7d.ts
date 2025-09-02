import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../../lib/cors';
import { requireAdmin } from '../../../../lib/authAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ctx = requireAdmin(req, res);
  if (!ctx) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const today = new Date();
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      day: d.toISOString().slice(0, 10),
      newUsers: Math.floor(5 + Math.random() * 20),
      retainedNextDay: Math.floor(2 + Math.random() * 10),
    };
  });
  return res.status(200).json({ ok: true, data });
}
