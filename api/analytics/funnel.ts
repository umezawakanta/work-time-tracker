import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMemorySample } from '../_lib/analyticsStore.js';

type FunnelResult = {
  ok: true;
  steps: string[];
  window: { days: number; start: string; end: string };
  totalIdentities: number;
  counts: number[]; // cumulative counts for each step
  rates: number[]; // counts[i] / counts[0]
};

function normalizeEvent(name: string): string {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
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

    const defaultSteps = ['register_success', 'first_use', 'success', 'subscribe'];
    const stepsParam = String((req.query.steps as string) || '').trim();
    const steps = (stepsParam ? stepsParam.split(',') : defaultSteps).map((s) => normalizeEvent(s));
    if (steps.length === 0) steps.push(...defaultSteps);

    const days = Math.max(1, Math.min(60, Number(req.query.days) || 14));
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    // Pull recent events (memory sample-only; swap to Mongo aggregation later)
    const sample = getMemorySample(5000).filter((e) => {
      try {
        const t = new Date(e.timestamp);
        return t >= start && t <= end;
      } catch {
        return false;
      }
    });

    // Build identity → earliest timestamp per normalized event name
    type IdentityMap = Map<string, Map<string, number>>;
    const identities: IdentityMap = new Map();

    for (const e of sample) {
      try {
        const name = normalizeEvent(e.event);
        const t = new Date(e.timestamp as string).getTime();
        const id = String(e.sessionId || e.clientId || e.ip || '');
        if (!id) continue;
        let m = identities.get(id);
        if (!m) {
          m = new Map();
          identities.set(id, m);
        }
        const prev = m.get(name);
        if (prev == null || t < prev) m.set(name, t);
      } catch {}
    }

    const totalIdentities = identities.size;

    // Compute cumulative counts per step (must occur in order with non-decreasing times)
    const counts = new Array<number>(steps.length).fill(0);
    identities.forEach((eventsMap) => {
      let okSoFar = true;
      let lastTime = -Infinity;
      for (let i = 0; i < steps.length; i++) {
        const ts = eventsMap.get(steps[i]);
        if (ts == null || ts < lastTime) {
          okSoFar = false;
        }
        if (okSoFar) {
          counts[i] += 1;
          lastTime = ts ?? lastTime;
        } else {
          break;
        }
      }
    });

    const rates = counts.map((c) => (counts[0] > 0 ? Number((c / counts[0]).toFixed(4)) : 0));

    const result: FunnelResult = {
      ok: true,
      steps,
      window: { days, start: start.toISOString(), end: end.toISOString() },
      totalIdentities,
      counts,
      rates,
    };
    return res.status(200).json(result);
  } catch (e) {
    console.error('[Funnel] Error', e);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
