import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' } as any);

  const days = Number(req.query.days || 7);
  const today = new Date();
  const data = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * 86400000);
    return {
      date: d.toISOString().slice(0, 10),
      views: Math.floor(Math.random() * 200) + 50,
    };
  });
  res.status(200).json({ success: true, data } as any);
}

// duplicate removed
