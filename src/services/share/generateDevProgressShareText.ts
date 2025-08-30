import { FeatureStatus, featuresRegistry } from '@/config/features';
import { NEW_STATUS_ORDER } from '@/services/dev/featureStatusEngine';

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
  const ids = opts?.featureIds ?? ['login', 'logout', 'user-registration'];
  const map = opts?.statuses ?? null;
  const lines: string[] = [];
  for (const id of ids) {
    const f = (featuresRegistry as any).find((x: any) => x.id === id) as
      | { id: string; name: string; status: FeatureStatus; targetRelease?: string }
      | undefined;
    if (!f) continue;
    const useStatus = (map?.[id] ?? f.status) as FeatureStatus;
    const progress = getFeatureProgressPercent(useStatus);
    const ymd = (f as any).targetRelease || '';
    let dateStr = '未設定';
    if (typeof ymd === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
      const [y, m, d] = ymd.split('-');
      dateStr = `${y}/${m}/${d}`;
    }
    lines.push(`${f.name}：${progress}% リリース予定日：${dateStr}`);
  }
  const body = lines.join('\n');
  return `開発状況アップデート\n------------------\n${body}\n------------------`;
}

export function openShare(text: string, url: string): void {
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    (navigator as any).share({ text, url }).catch(() => {
      // noop
    });
  } else if (typeof window !== 'undefined') {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}%0A${encodeURIComponent(
      url
    )}`;
    window.open(intent, '_blank');
  }
}
