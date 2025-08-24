import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pageviewBuckets } from '../../../analytics/pageview';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const series: Array<{ day: string; views: number }> = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = formatDate(d);
      const views = (pageviewBuckets as Record<string, number>)[key] || 0;
      series.push({ day: key, views });
    }

    res.status(200).json({ ok: true, data: { window: days, series } });
  } catch (error) {
    console.error('Failed to get pageviews trend:', error);
    // Return empty series rather than failing the admin UI
    res.status(200).json({ ok: true, data: { window: 7, series: [] }, degraded: true });
  }
}
