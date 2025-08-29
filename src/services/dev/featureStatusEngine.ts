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
  map: Record<string, FeatureStatus>;
  loadedAt: number;
  signals: {
    devStatus: DevStatusFlags | null;
    testSummary: TestSummary | null;
  };
}

const STATUS_ORDER: FeatureStatus[] = [
  'planned',
  'in_progress',
  'testing',
  'docs',
  'review',
  'release_pending',
  'complete',
];

function maxStatus(a: FeatureStatus, b: FeatureStatus): FeatureStatus {
  const ia = STATUS_ORDER.indexOf(a);
  const ib = STATUS_ORDER.indexOf(b);
  return (ia >= ib ? a : b) as FeatureStatus;
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

export function computeDerivedFeatureStatus(
  feature: Feature,
  signals: { devStatus: DevStatusFlags | null; testSummary: TestSummary | null }
): FeatureStatus {
  // Baseline from declared status, but never below 'planned'
  let current: FeatureStatus = feature.status ?? 'planned';

  // If feature is complete but running in mock mode with real API requirement, cap before complete
  if (feature.requiresRealAPI && USE_MOCK_DATA) {
    current = current === 'complete' ? 'review' : current;
  }

  const artifacts = featureArtifactsRegistry[feature.id] || {};

  // planned: requirements defined
  if (artifacts.requirements) {
    current = maxStatus(current, 'planned');
  }

  // in_progress: source code and basic/detailed design exist
  if (artifacts.source_code || artifacts.basic_design || artifacts.detailed_design) {
    current = maxStatus(current, 'in_progress');
  }

  // testing: unit tests/spec or global unit coverage
  if (artifacts.unit_tests || artifacts.unit_test_spec || signals.testSummary?.unit?.hasCoverage) {
    current = maxStatus(current, 'testing');
  }

  // docs: operation manuals/runbooks/faq present
  if (artifacts.operation_manual || artifacts.runbook || artifacts.faq) {
    current = maxStatus(current, 'docs');
  }

  // review: integration/system test specs present
  if (artifacts.integration_test_spec || artifacts.system_test_spec) {
    current = maxStatus(current, 'review');
  }

  // If route is still mocked, do not advance to release/complete
  const isMocked =
    signals.devStatus?.flags?.mockRoutes?.some((p) => feature.path.startsWith(p)) ?? false;
  if (!isMocked) {
    current = maxStatus(current, 'release_pending');
  }

  // complete: only when declared complete AND not mocked AND real API not mocked when required
  const canBeComplete =
    feature.status === 'complete' && !isMocked && (!feature.requiresRealAPI || !USE_MOCK_DATA);
  if (canBeComplete) {
    current = 'complete';
  }

  return current;
}

export async function deriveAllFeatureStatuses(): Promise<DerivedStatusesResult> {
  const signals = await loadSignals();
  const map: Record<string, FeatureStatus> = {};
  for (const f of featuresRegistry) {
    map[f.id] = computeDerivedFeatureStatus(f, signals);
  }
  return { map, loadedAt: Date.now(), signals };
}
