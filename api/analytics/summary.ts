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
import { cors } from '../../lib/cors';

type RangeParam = 'day' | 'week' | 'month' | '24h' | '7d' | '30d';

function resolveWindow(range: string | undefined): { from: Date; to: Date } {
  const now = new Date();
  const r = String(range || '7d').toLowerCase();
  const from = new Date(now);
  if (r === 'day' || r === '24h') from.setDate(now.getDate() - 1);
  else if (r === 'week' || r === '7d') from.setDate(now.getDate() - 7);
  else if (r === 'month' || r === '30d') from.setDate(now.getDate() - 30);
  else from.setDate(now.getDate() - 7);
  return { from, to: now };
}

async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req as any, res as any);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const { from, to } = resolveWindow((req.query?.range as RangeParam) || '7d');

  // Keep only mocked response to avoid server imports during build
  return res.status(200).json({
    success: true,
    data: {
      totalUsers: 1200,
      activeUsers: 350,
      newUsers: 80,
      returningUsers: 270,
      averageSessionDuration: 240,
      pageViewsTotal: 7200,
      topPages: [
        { page: '/', views: 2200 },
        { page: '/tasks', views: 1400 },
        { page: '/subscription', views: 600 },
      ],
      generatedAt: new Date().toISOString(),
      range: req.query?.range || '7d',
    },
  });
}

module.exports = handler;
