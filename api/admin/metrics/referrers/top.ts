interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined>;
}
interface VercelResponse {
  status: (c: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (n: string, v: string) => void;
  end: () => void;
}
import { cors } from '../../../../lib/cors';
import { requireAdmin } from '../../../../lib/authAdmin';

async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req as any, res as any);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ctx = requireAdmin(req as any, res as any);
  if (!ctx) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const data = [
    { referrer: 'google', count: 320 },
    { referrer: 'x.com', count: 90 },
    { referrer: 'direct', count: 70 },
  ];
  return res.status(200).json({ ok: true, data });
}

module.exports = handler;
