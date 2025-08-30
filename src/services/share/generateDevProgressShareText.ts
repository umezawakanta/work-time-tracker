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
  // Prefer native share when available (mobile/desktop supporting Web Share API)
  const nav = window.navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
  if (typeof nav.share === 'function') {
    nav.share({ text, url }).catch(() => {
      // fallback to Twitter intent on any failure
      const MAX_URL = 1800; // stay well under typical URL limits
      const safeText = summarizeForTwitterIntent(text, url, MAX_URL);
      const intent = buildTwitterIntentUrl(safeText, url);
      window.open(intent, '_blank');
    });
    return;
  }
  // Fallback: Twitter web intent with robust summarization
  const MAX_URL = 1800;
  const safeText = summarizeForTwitterIntent(text, url, MAX_URL);
  const intent = buildTwitterIntentUrl(safeText, url);
  window.open(intent, '_blank');
}

export function getCanonicalUrl(): string {
  try {
    const env = (import.meta as any).env as Record<string, unknown>;
    const fromEnv = (env?.VITE_CANONICAL_URL as string) || '';
    if (fromEnv) return fromEnv;
  } catch {}
  return 'https://work-time-tracker-five.vercel.app';
}
