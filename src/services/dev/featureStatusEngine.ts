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
  const artifacts = featureArtifactsRegistry[feature.id] || {};

  // シグナル
  const isMocked =
    signals.devStatus?.flags?.mockRoutes?.some((p) => feature.path.startsWith(p)) ?? false;
  const realOk = !feature.requiresRealAPI || !USE_MOCK_DATA;

  // アーティファクト有無
  const hasRequirements = Boolean(artifacts.requirements);
  const hasDesign = Boolean(artifacts.basic_design || artifacts.detailed_design);
  const hasSource = Boolean(artifacts.source_code);
  const hasUnit = Boolean(
    artifacts.unit_tests || artifacts.unit_test_spec || signals.testSummary?.unit?.hasCoverage
  );
  const hasE2E = Boolean(artifacts.e2e_tests || signals.testSummary?.e2e?.available);
  const hasDocsAny = Boolean(artifacts.operation_manual || artifacts.runbook || artifacts.faq);

  // 段階的推定（前段を満たさない限り次に進まない）
  let current: FeatureStatus = 'planning';
  if (!hasRequirements) return current;

  current = 'designing';
  if (!hasDesign) return current;

  current = 'developing';
  if (!hasSource) return current;

  current = 'unit_testing';
  if (!hasUnit) return current;

  current = 'integration_testing';
  if (!hasE2E) return current;

  if (!isMocked && realOk) {
    current = 'system_testing';
  } else {
    return current;
  }

  if (hasDocsAny) {
    current = 'documenting';
  }

  // review / release_pending / complete は承認でのみ進行（自動では進めない）
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
    let eff = minByOrder(a, s);
    // 追加ガード: 要件定義書が承認されていない場合は常に planning
    if (!isRequirementsApproved(f.id)) {
      eff = 'planning';
    }
    effective[f.id] = eff;
  }

  return { suggested, effective, approved, loadedAt: Date.now(), signals };
}

// ===== 承認（成果物単位）ストア =====
type ArtifactApprovalMap = Record<string, Record<string, boolean>>; // featureId -> artifactId -> approved

const ARTIFACT_APPROVAL_KEY = 'feature_artifact_approvals_v1';

function readArtifactApprovals(): ArtifactApprovalMap {
  try {
    const raw = localStorage.getItem(ARTIFACT_APPROVAL_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ArtifactApprovalMap;
  } catch {
    return {};
  }
}

function writeArtifactApprovals(map: ArtifactApprovalMap): void {
  try {
    localStorage.setItem(ARTIFACT_APPROVAL_KEY, JSON.stringify(map));
  } catch {}
}

export function setArtifactApproval(
  featureId: string,
  artifactId: string,
  approved: boolean
): void {
  const map = readArtifactApprovals();
  map[featureId] = map[featureId] || {};
  map[featureId][artifactId] = approved;
  writeArtifactApprovals(map);
}

export function isArtifactApproved(featureId: string, artifactId: string): boolean {
  const map = readArtifactApprovals();
  return Boolean(map[featureId]?.[artifactId]);
}

export function isRequirementsApproved(featureId: string): boolean {
  return isArtifactApproved(featureId, 'requirements');
}
