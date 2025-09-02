interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined>;
  query?: Record<string, any>;
}
interface VercelResponse {
  status: (c: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (n: string, v: string) => void;
  end: () => void;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const { cors } = await import('../../../lib/cors.js');
  await (cors as any)(req as any, res as any);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });

  const hours = clamp(Number((req.query as any).hours || 24), 1, 72);
  // Mocked for stability
  const activeUsers = Math.max(0, Math.round(50 + Math.random() * 50));
  return res.status(200).json({ success: true, data: { hours, activeUsers } });
}

module.exports = handler;
