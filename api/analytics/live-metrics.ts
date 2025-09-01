import type { VercelRequest, VercelResponse } from '@vercel/node';
// Lightweight mock endpoint for production fallback

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ success: false, error: 'Method not allowed' });

  const now = new Date();
  const hours = Array.from({ length: 8 }).map((_, i) => {
    const d = new Date(now.getTime() - (7 - i) * 3600000);
    return {
      hour: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tasks: Math.floor(Math.random() * 10) + 5,
      users: Math.floor(Math.random() * 8) + 2,
    };
  });
  const payload = {
    activeUsers: Math.floor(Math.random() * 20) + 5,
    completionRate: 70 + Math.floor(Math.random() * 10),
    avgTaskTime: 20 + Math.floor(Math.random() * 10),
    todaysTasks: hours.reduce((a, c) => a + c.tasks, 0),
    weeklyTrend: Math.floor(Math.random() * 10),
    topCategories: [
      { name: '開発', value: 35, color: '#3b82f6' },
      { name: '会議', value: 25, color: '#10b981' },
      { name: '学習', value: 20, color: '#f59e0b' },
      { name: 'レビュー', value: 15, color: '#ef4444' },
      { name: 'その他', value: 5, color: '#8b5cf6' },
    ],
    hourlyActivity: hours,
    realtimeActivity: [],
  };
  return res.status(200).json({ success: true, data: payload });
}
