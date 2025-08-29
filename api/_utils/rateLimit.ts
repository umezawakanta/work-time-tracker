import type { VercelRequest, VercelResponse } from '@vercel/node';

const memoryCounter = new Map<string, { count: number; resetAt: number }>();

export function rateLimit({ windowMs = 60000, max = 60 } = {}) {
  return async function (req: VercelRequest, res: VercelResponse): Promise<boolean> {
    try {
      const key = `${req.method}:${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`;
      const now = Date.now();
      const cur = memoryCounter.get(key);
      if (!cur || cur.resetAt < now) {
        memoryCounter.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (cur.count >= max) {
        res.status(429).json({ success: false, message: 'Too many requests' } as any);
        return false;
      }
      cur.count += 1;
      return true;
    } catch {
      return true;
    }
  };
}
