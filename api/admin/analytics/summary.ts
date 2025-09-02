import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const range = String((req.query?.range as string) || '7d');
  const totalUsers = 1500;
  const activeUsers = 420;
  const newUsers = range === '7d' ? 80 : range === '30d' ? 300 : 900;
  const returningUsers = Math.round(newUsers * 0.6);
  const averageSessionDuration = 260;
  const pageViewsTotal = range === '7d' ? 7800 : range === '30d' ? 33000 : 98000;

  const topPages = [
    { page: '/', views: Math.round(pageViewsTotal * 0.3) },
    { page: '/tasks', views: Math.round(pageViewsTotal * 0.2) },
    { page: '/admin', views: Math.round(pageViewsTotal * 0.05) },
  ];

  const deviceBreakdown = { desktop: 62, mobile: 34, tablet: 4 };
  const trafficSources = { direct: 50, organic: 30, referral: 15, ads: 5 } as Record<
    string,
    number
  >;
  const featureUsage = { ai_ok: 12, assessment_saved: 7, learning_saved: 3 };
  const topReferrers = [
    { referrer: 'google', count: 320 },
    { referrer: 'x.com', count: 90 },
  ];
  const compare = { today: 1100, yesterday: 1000, diff: 100, pct: 10 };
  const retentionCohort: Array<{ day: string; newUsers: number; retainedNextDay: number }> = [
    { day: '2025-08-30', newUsers: 30, retainedNextDay: 18 },
  ];
  const topErrors = [{ message: 'NetworkError: Failed to fetch', count: 12 }];

  res.status(200).json({
    totalUsers,
    activeUsers,
    newUsers,
    returningUsers,
    averageSessionDuration,
    pageViewsTotal,
    topPages,
    deviceBreakdown,
    trafficSources,
    featureUsage,
    topReferrers,
    compare,
    retentionCohort,
    topErrors,
  });
}
