import { FeatureStatus, featuresRegistry } from '@/config/features';
import { NEW_STATUS_ORDER, normalizeToNewStatus } from '@/services/dev/featureStatusEngine';

export interface ShareProgressOptions {
  featureIds?: string[];
  statuses?: Record<string, FeatureStatus> | null; // effective/suggested map if available
}

function getFeatureProgressPercent(status: FeatureStatus): number {
  const idx = NEW_STATUS_ORDER.indexOf(status as FeatureStatus);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / NEW_STATUS_ORDER.length) * 100);
}

export function generateDevProgressShareText(opts?: ShareProgressOptions): string {
  const map = opts?.statuses ?? null;
  const providedIds = opts?.featureIds ?? null;
  const inProgressSet = new Set<FeatureStatus>([
    'designing',
    'developing',
    'unit_testing',
    'integration_testing',
    'system_testing',
    'documenting',
    'review',
    'release_pending',
  ]);

  // 対象機能の決定
  let candidates = featuresRegistry.slice();
  if (providedIds) {
    candidates = candidates.filter((f) => providedIds.includes(f.id));
  } else if (map) {
    candidates = candidates.filter((f) => inProgressSet.has(map[f.id] as FeatureStatus));
  } else {
    candidates = candidates.filter((f) => inProgressSet.has(normalizeToNewStatus(f.status)));
  }

  // 優先度順→名前順
  const priorityOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
  candidates.sort((a, b) => {
    const pa = priorityOrder[(a as any).priority || 'P3'];
    const pb = priorityOrder[(b as any).priority || 'P3'];
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  // 行生成
  const lines: string[] = [];
  for (const f of candidates) {
    const status = (map?.[f.id] ?? normalizeToNewStatus(f.status)) as FeatureStatus;
    const progress = getFeatureProgressPercent(status);
    const ymd = (f as any).targetRelease || '';
    let dateStr = '未設定';
    if (typeof ymd === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
      const [y, m, d] = ymd.split('-');
      dateStr = `${y}/${m}/${d}`;
    }
    lines.push(`${f.name}：${progress}% リリース予定日：${dateStr}`);
  }

  const body = lines.join('\n');
  return `開発状況アップデート\n------------------\n${body}`;
}

export function openShare(text: string, url: string): void {
  // Prefer Twitter Web Intent to ensure text is preserved on X
  if (typeof window !== 'undefined') {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      url
    )}`;
    window.open(intent, '_blank');
    return;
  }
}

export function getCanonicalUrl(): string {
  try {
    const env = (import.meta as any).env as Record<string, unknown>;
    const fromEnv = (env?.VITE_CANONICAL_URL as string) || '';
    if (fromEnv) return fromEnv;
  } catch {}
  return 'https://work-time-tracker-five.vercel.app';
}
