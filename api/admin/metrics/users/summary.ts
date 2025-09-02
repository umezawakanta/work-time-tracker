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

  // Mocked response to avoid server imports
  const now = new Date();
  const totalUsers = 1500;
  const dau = 120;
  const wau = 600;
  const mau = 1200;
  const new7d = 80;
  return res.status(200).json({
    ok: true,
    data: { totalUsers, dau, wau, mau, new7d, generatedAt: now.toISOString() },
  });
}

module.exports = handler;
