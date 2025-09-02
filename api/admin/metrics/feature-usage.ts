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
import { cors } from '../../../lib/cors';
import { requireAdmin } from '../../../lib/authAdmin';

async function handler(req: VercelRequest, res: VercelResponse) {
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

module.exports = handler;
