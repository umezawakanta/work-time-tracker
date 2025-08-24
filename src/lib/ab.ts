export type Variant = 'A' | 'B';

const STORAGE_PREFIX = 'ab:';

export function getVariant(experiment: string, variants: Variant[] = ['A', 'B']): Variant {
  try {
    const key = STORAGE_PREFIX + experiment;
    const existing = localStorage.getItem(key) as Variant | null;
    if (existing === 'A' || existing === 'B') return existing;
    const pick = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(key, pick);
    return pick;
  } catch {
    return 'A';
  }
}
