export type Bucket = 'A' | 'B';

const STORAGE_KEY = 'ab:bucket';

export function getBucket(): Bucket {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'A' || stored === 'B') return stored;
    const assigned: Bucket = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(STORAGE_KEY, assigned);
    return assigned;
  } catch {
    // Fallback deterministic bucket when storage unavailable
    return 'A';
  }
}

export function setBucket(bucket: Bucket): void {
  try {
    localStorage.setItem(STORAGE_KEY, bucket);
  } catch {}
}

export function isBucket(bucket: Bucket): boolean {
  return getBucket() === bucket;
}
