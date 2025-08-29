import { featuresRegistry, Feature, FeatureStatus } from '@/config/features';
import { featureArtifactsRegistry } from '@/config/featureArtifacts';
import { USE_MOCK_DATA } from '@/services/api/apiConfig';

export interface DevStatusFlags {
  generatedAt?: string;
  totals?: {
    filesScanned?: number;
    findings?: number;
    todo?: number;
    mock?: number;
    wip?: number;
    errorHints?: number;
  };
  flags?: {
    wipRoutes?: string[];
    mockRoutes?: string[];
  };
}

export interface TestSummary {
  generatedAt?: string;
  unit?: { hasCoverage?: boolean };
  e2e?: { available?: boolean };
}

export interface DerivedStatusesResult {
  suggested: Record<string, FeatureStatus>;
  effective: Record<string, FeatureStatus>;
  approved: Record<string, FeatureStatus>;
  loadedAt: number;
  signals: {
    devStatus: DevStatusFlags | null;
    testSummary: TestSummary | null;
  };
}

export const NEW_STATUS_ORDER: FeatureStatus[] = [
  'planning',
  'designing',
  'developing',
  'unit_testing',
  'integration_testing',
  'system_testing',
  'documenting',
  'review',
  'release_pending',
  'complete',
];

function compareStatus(a: FeatureStatus, b: FeatureStatus): number {
  return NEW_STATUS_ORDER.indexOf(a) - NEW_STATUS_ORDER.indexOf(b);
}

function maxStatus(a: FeatureStatus, b: FeatureStatus): FeatureStatus {
  return compareStatus(a, b) >= 0 ? a : b;
}

export function toNextStatus(current: FeatureStatus): FeatureStatus | null {
  const idx = NEW_STATUS_ORDER.indexOf(current);
  if (idx < 0 || idx + 1 >= NEW_STATUS_ORDER.length) return null;
  return NEW_STATUS_ORDER[idx + 1];
}

export function normalizeToNewStatus(status: FeatureStatus): FeatureStatus {
  switch (status) {
    case 'planned':
      return 'planning';
    case 'in_progress':
      return 'developing';
    case 'testing':
      return 'unit_testing';
    case 'docs':
      return 'documenting';
    default:
      return status;
  }
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function loadSignals(): Promise<{
  devStatus: DevStatusFlags | null;
  testSummary: TestSummary | null;
}> {
  const [devStatus, testSummary] = await Promise.all([
    fetchJson<DevStatusFlags>('/dev-status.json'),
    fetchJson<TestSummary>('/test-summary.json'),
  ]);
  return { devStatus, testSummary };
}

export function computeSuggestedFeatureStatus(
  feature: Feature,
  signals: { devStatus: DevStatusFlags | null; testSummary: TestSummary | null }
): FeatureStatus {
  let current: FeatureStatus = normalizeToNewStatus(feature.status);

  const artifacts = featureArtifactsRegistry[feature.id] || {};

  // planning: 要件定義着手
  if (artifacts.requirements) current = maxStatus(current, 'planning');

  // designing: 基本/詳細設計
  if (artifacts.basic_design || artifacts.detailed_design) {
    current = maxStatus(current, 'designing');
  }

  // developing: 実装（ソースコード登録）
  if (artifacts.source_code) current = maxStatus(current, 'developing');

  // unit testing: 単体テスト（spec or coverage）
  if (artifacts.unit_tests || artifacts.unit_test_spec || signals.testSummary?.unit?.hasCoverage) {
    current = maxStatus(current, 'unit_testing');
  }

  // integration testing: e2e 等が利用可能
  if (artifacts.e2e_tests || signals.testSummary?.e2e?.available) {
    current = maxStatus(current, 'integration_testing');
  }

  // system testing: 本番相当で実API接続（モックでない）
  const isMocked =
    signals.devStatus?.flags?.mockRoutes?.some((p) => feature.path.startsWith(p)) ?? false;
  const realOk = !feature.requiresRealAPI || !USE_MOCK_DATA;
  if (!isMocked && realOk) {
    current = maxStatus(current, 'system_testing');
  }

  // documenting: 操作手順書/運用手順書/FAQ
  if (artifacts.operation_manual || artifacts.runbook || artifacts.faq) {
    current = maxStatus(current, 'documenting');
  }

  // review: ドキュメントレビュー（自動判定はせず、提案として document までで十分）
  // release_pending: モックでなければ出荷準備可能
  if (!isMocked) {
    current = maxStatus(current, 'release_pending');
  }

  // complete: 既存宣言が complete かつ実API条件クリア時のみ提案
  if (feature.status === 'complete' && !isMocked && realOk) {
    current = 'complete';
  }

  return current;
}

// Simple local approval store (admin UI writes here). Can be swapped for API later.
const APPROVAL_STORAGE_KEY = 'feature_approved_status_v1';

function readApproved(): Record<string, FeatureStatus> {
  try {
    const raw = localStorage.getItem(APPROVAL_STORAGE_KEY);
    if (!raw) return seedApprovedFromRegistry();
    return JSON.parse(raw) as Record<string, FeatureStatus>;
  } catch {
    return seedApprovedFromRegistry();
  }
}

function seedApprovedFromRegistry(): Record<string, FeatureStatus> {
  const map: Record<string, FeatureStatus> = {};
  for (const f of featuresRegistry) {
    map[f.id] = normalizeToNewStatus(f.status);
  }
  try {
    localStorage.setItem(APPROVAL_STORAGE_KEY, JSON.stringify(map));
  } catch {}
  return map;
}

export function setApprovedStatus(featureId: string, status: FeatureStatus): void {
  const map = readApproved();
  map[featureId] = status;
  try {
    localStorage.setItem(APPROVAL_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function getApprovedStatus(featureId: string): FeatureStatus | null {
  const map = readApproved();
  return map[featureId] ?? null;
}

export function getApprovedMap(): Record<string, FeatureStatus> {
  return readApproved();
}

function minByOrder(a: FeatureStatus, b: FeatureStatus): FeatureStatus {
  return compareStatus(a, b) <= 0 ? a : b;
}

export async function deriveAllFeatureStatuses(): Promise<DerivedStatusesResult> {
  const signals = await loadSignals();
  const suggested: Record<string, FeatureStatus> = {};
  const approved = getApprovedMap();
  const effective: Record<string, FeatureStatus> = {};

  for (const f of featuresRegistry) {
    const s = computeSuggestedFeatureStatus(f, signals);
    suggested[f.id] = s;
    const a = approved[f.id] ?? normalizeToNewStatus(f.status);
    // 有効値は「提案」と「承認済み」のうち低い方（すべて承認制）
    effective[f.id] = minByOrder(a, s);
  }

  return { suggested, effective, approved, loadedAt: Date.now(), signals };
}
