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

  const hasValidYmd = (value: unknown): value is string => {
    if (typeof value !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  };

  // 対象機能の決定
  let candidates = featuresRegistry.slice();
  if (providedIds) {
    candidates = candidates.filter((f) => providedIds.includes(f.id));
  } else if (map) {
    candidates = candidates.filter((f) => inProgressSet.has(map[f.id] as FeatureStatus));
  } else {
    candidates = candidates.filter((f) => inProgressSet.has(normalizeToNewStatus(f.status)));
  }
  // 共有機能そのものや無効化中の機能は除外
  candidates = candidates.filter((f) => f.id !== 'share-dev-progress' && !(f as any).disabled);

  // 共有要件: 着手中かつリリース予定日が設定済み(YYYY-MM-DD)
  candidates = candidates.filter((f) => hasValidYmd(f.targetRelease));

  // 優先度順→名前順
  const priorityOrder: Record<'P0' | 'P1' | 'P2' | 'P3', number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
  candidates.sort((a, b) => {
    const pa = priorityOrder[(a.priority ?? 'P3') as 'P0' | 'P1' | 'P2' | 'P3'];
    const pb = priorityOrder[(b.priority ?? 'P3') as 'P0' | 'P1' | 'P2' | 'P3'];
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  // 行生成
  const lines: string[] = [];
  lines.push(`本日の進捗（${new Date().toLocaleDateString('ja-JP')}）`);
  lines.push('');
  for (const f of candidates) {
    const status = (map?.[f.id] ?? normalizeToNewStatus(f.status)) as FeatureStatus;
    const progress = getFeatureProgressPercent(status);
    const ymd = f.targetRelease as string; // filtered above to be valid
    const [y, m, d] = ymd.split('-');
    const dateStr = `${y}/${m}/${d}`;
    const emoji =
      status === 'release_pending'
        ? '🚀'
        : status === 'system_testing'
          ? '🧪'
          : status === 'integration_testing'
            ? '🔗'
            : '✅';
    lines.push(`${emoji} ${f.name}：${progress}%（リリース予定日: ${dateStr}）`);
  }

  const body = lines.join('\n');
  return `開発状況アップデート\n------------------\n${body}`;
}

function buildTwitterIntentUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

function summarizeForTwitterIntent(
  originalText: string,
  url: string,
  maxUrlLength: number
): string {
  // If already short enough, return as-is
  const candidate = originalText;
  const intentUrl = buildTwitterIntentUrl(candidate, url);
  if (intentUrl.length <= maxUrlLength) return candidate;

  // Split by lines and keep header lines
  const lines = originalText.split(/\r?\n/);
  const headerLines: string[] = [];
  const featureLines: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (i <= 1)
      headerLines.push(lines[i]); // タイトルと区切り線
    else featureLines.push(lines[i]);
  }

  // Binary-like reduction: keep top N lines, add summary
  let low = 0;
  let high = featureLines.length; // exclusive
  let best: string = headerLines.join('\n');

  const buildWith = (n: number) => {
    const kept = featureLines.slice(0, n);
    const remaining = featureLines.length - n;
    const summary = remaining > 0 ? `\n…ほか${remaining}件の進捗` : '';
    return `${headerLines.join('\n')}\n${kept.join('\n')}${summary}`.trim();
  };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const textTry = buildWith(mid);
    const urlTry = buildTwitterIntentUrl(textTry, url);
    if (urlTry.length <= maxUrlLength) {
      best = textTry;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // 最後に、万一まだ長い場合は強制トリム
  let finalText = best;
  const finalUrl = buildTwitterIntentUrl(finalText, url);
  if (finalUrl.length > maxUrlLength) {
    // 文字数ベースの安全トリム
    const OVERFLOW_SAFE = 280; // ざっくりな調整
    finalText = finalText.slice(0, Math.max(0, finalText.length - OVERFLOW_SAFE)) + '…';
  }
  return finalText;
}

export function openShare(text: string, url: string): void {
  if (typeof window === 'undefined') return;
  // Always use Twitter Web Intent to ensure text+URL appear (native share may drop text)
  const MAX_URL = 1800; // stay well under typical URL limits
  const safeText = summarizeForTwitterIntent(text, url, MAX_URL);
  const intent = buildTwitterIntentUrl(safeText, url);
  window.open(intent, '_blank');
}

export function getCanonicalUrl(): string {
  try {
    // Prefer window-injected env (works in browser and Jest)
    if (typeof window !== 'undefined') {
      const injected = (window as any)?.__VITE_ENV__?.VITE_CANONICAL_URL as unknown;
      if (typeof injected === 'string' && injected) return injected;
    }
    // Fallback to process.env for Node/Jest
    if (typeof process !== 'undefined' && (process as any).env) {
      const fromProc = (process as any).env.VITE_CANONICAL_URL as unknown;
      if (typeof fromProc === 'string' && fromProc) return fromProc;
    }
  } catch {}
  return 'https://work-time-tracker-five.vercel.app';
}
