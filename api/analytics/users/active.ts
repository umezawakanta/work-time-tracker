import type { VercelRequest, VercelResponse } from '@vercel/node';
import { countActiveUsersSince } from '../../_lib/analyticsStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const hours = Math.max(1, Math.min(48, Number(req.query.hours) || 24));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const count = await countActiveUsersSince(since);
    return res.status(200).json({ ok: true, hours, since, activeUsers: count });
  } catch (e) {
    console.error('[ActiveUsers] Error', e);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
