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
  const windowArg = String((req.query?.window as string) || '7d');
  const base = windowArg === '7d' ? 1000 : windowArg === '30d' ? 4200 : 12500;
  const rows = [
    { page: '/', views: Math.round(base * 0.32) },
    { page: '/tasks', views: Math.round(base * 0.22) },
    { page: '/login', views: Math.round(base * 0.1) },
    { page: '/admin', views: Math.round(base * 0.05) },
  ];
  res.status(200).json(rows);
}

// duplicate removed
