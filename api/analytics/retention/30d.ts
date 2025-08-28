import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../lib/cors';
import { connectDB } from '../../../src/server/config/database';
import { AnalyticsEvent } from '../../../src/server/models/AnalyticsEvent';

// Simple 30-day cohort: for each start day, users who were new that day and who returned next day (D1)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });

  try {
    await connectDB();
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 29);

    // New users per day (using event 'register' or first seen clientId without earlier events)
    const registrations = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: '$clientId',
          firstSeen: { $min: '$timestamp' },
        },
      },
      {
        $project: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$firstSeen' } },
        },
      },
      { $group: { _id: '$day', size: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const d1 = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: '$clientId',
          days: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } },
        },
      },
      { $project: { days: 1 } },
    ]);

    const dailyMap = new Map<string, number>();
    for (const r of registrations) dailyMap.set(String(r._id), Number(r.size || 0));

    // Compute D1 retained count: users who have both day and next-day in their set
    const retainedMap = new Map<string, number>();
    const daySetPerUser: string[][] = d1.map((x: any) => x.days as string[]);
    const allDays: string[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });
    for (const day of allDays) retainedMap.set(day, 0);
    for (const days of daySetPerUser) {
      const s = new Set(days);
      for (const day of allDays) {
        const next = new Date(day + 'T00:00:00Z');
        next.setDate(next.getDate() + 1);
        const nextKey = next.toISOString().slice(0, 10);
        if (s.has(day) && s.has(nextKey)) {
          retainedMap.set(day, (retainedMap.get(day) || 0) + 1);
        }
      }
    }

    const cohorts = allDays.map((day) => ({
      date: day,
      size: dailyMap.get(day) || 0,
      days: [0, retainedMap.get(day) || 0], // expose D0 placeholder and D1 count for UI
    }));

    return res.status(200).json({ success: true, data: { cohorts } });
  } catch (e) {
    console.error('[analytics/retention/30d] error', e);
    return res.status(200).json({ success: true, data: { cohorts: [] }, degraded: true });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMemorySample } from '../../_lib/analyticsStore.js';

type CohortRow = {
  date: string; // cohort start date (YYYY-MM-DD)
  size: number; // number of unique identities on day 0
  days: number[]; // length 30, counts for day 0..29
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const windowDays = 30; // fixed 30d retention
    const end = new Date();
    const start = new Date(end.getTime() - windowDays * 24 * 60 * 60 * 1000);

    // NOTE: For now we use in-memory sample. Can be swapped to Mongo aggregation later.
    const events = getMemorySample(5000)
      .filter((e) => {
        try {
          const t = new Date(e.timestamp);
          return t >= start && t <= end && !!(e.sessionId || e.clientId || e.ip);
        } catch {
          return false;
        }
      })
      .map((e) => ({
        t: new Date(e.timestamp as string),
        key: String(e.sessionId || e.clientId || e.ip || ''),
      }));

    // Identity → earliest date (cohort day 0)
    const firstSeen = new Map<string, string>();
    for (const ev of events) {
      const k = ev.key;
      if (!k) continue;
      const day = toDateKey(ev.t);
      const existing = firstSeen.get(k);
      if (!existing || day < existing) firstSeen.set(k, day);
    }

    // Build cohort set maps: cohortDayKey -> array[30] of Set(identity)
    const cohortsMap = new Map<string, Array<Set<string>>>();
    for (const ev of events) {
      const id = ev.key;
      if (!id) continue;
      const cohortDay = firstSeen.get(id);
      if (!cohortDay) continue;
      // Only cohorts within window
      if (cohortDay < toDateKey(start) || cohortDay > toDateKey(end)) continue;
      const dayIndex = Math.floor(
        (ev.t.getTime() - new Date(cohortDay).getTime()) / (24 * 60 * 60 * 1000)
      );
      if (dayIndex < 0 || dayIndex >= windowDays) continue;
      let arr = cohortsMap.get(cohortDay);
      if (!arr) {
        arr = Array.from({ length: windowDays }, () => new Set<string>());
        cohortsMap.set(cohortDay, arr);
      }
      arr[dayIndex].add(id);
    }

    const rows: CohortRow[] = Array.from(cohortsMap.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, sets]) => ({
        date,
        size: sets[0]?.size || 0,
        days: sets.map((s) => s.size),
      }));

    return res.status(200).json({
      ok: true,
      start: start.toISOString(),
      end: end.toISOString(),
      windowDays,
      cohorts: rows,
    });
  } catch (e) {
    console.error('[Retention30d] Error', e);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
