type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory rate limiter (best-effort, per serverless instance).
 * Returns true if allowed, false if limited.
 */
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count < limit) {
    b.count += 1;
    return true;
  }
  return false;
}

export function getResetMs(key: string): number {
  const now = Date.now();
  const b = buckets.get(key);
  return Math.max(0, (b?.resetAt ?? now) - now);
}
