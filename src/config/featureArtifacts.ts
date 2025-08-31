export type ArtifactId =
  | 'requirements'
  | 'basic_design'
  | 'detailed_design'
  | 'source_code'
  | 'github_actions'
  | 'unit_test_spec'
  | 'unit_tests'
  | 'e2e_tests'
  | 'integration_test_spec'
  | 'system_test_spec'
  | 'operation_manual'
  | 'runbook'
  | 'faq';

export interface FeatureArtifactLink {
  title: string;
  href: string; // internal route or markdown doc path
}

export type FeatureArtifacts = Partial<Record<ArtifactId, FeatureArtifactLink>>;

// Central listing: map feature id -> artifacts
export const featureArtifactsRegistry: Record<string, FeatureArtifacts> = {
  sitemap: {
    requirements: { title: '要件定義書', href: '/docs/features/sitemap/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/sitemap/basic-design' },
    detailed_design: { title: '詳細設計書', href: '/docs/features/sitemap/detailed-design' },
    source_code: { title: 'ソースコード', href: '/sitemap' },
    github_actions: {
      title: 'GitHub Actions ワークフロー',
      href: '/docs/features/sitemap/github-actions',
    },
    unit_test_spec: { title: '単体試験仕様書', href: '/docs/features/sitemap/unit-test-spec' },
    unit_tests: { title: 'ユニットテストコード', href: '/docs/features/sitemap/unit-tests' },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/sitemap/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/sitemap/integration-test-spec',
    },
    system_test_spec: { title: '総合試験仕様書', href: '/docs/features/sitemap/system-test-spec' },
    operation_manual: { title: '操作手順書', href: '/docs/features/sitemap/operation-manual' },
    runbook: { title: '運用手順書', href: '/docs/features/sitemap/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/sitemap/faq' },
  },
  'quadrant-dashboard': {
    requirements: { title: '要件定義書', href: '/docs/features/quadrant-dashboard/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/quadrant-dashboard/basic-design' },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/quadrant-dashboard/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/quadrant-dashboard' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/quadrant-dashboard/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/quadrant-dashboard/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/quadrant-dashboard/unit-tests',
    },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/quadrant-dashboard/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/quadrant-dashboard/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/quadrant-dashboard/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/quadrant-dashboard/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/quadrant-dashboard/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/quadrant-dashboard/faq' },
  },
  'accessibility-audit': {
    requirements: { title: '要件定義書', href: '/docs/features/accessibility-audit/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/accessibility-audit/basic-design' },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/accessibility-audit/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/accessibility-audit' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/accessibility-audit/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/accessibility-audit/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/accessibility-audit/unit-tests',
    },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/accessibility-audit/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/accessibility-audit/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/accessibility-audit/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/accessibility-audit/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/accessibility-audit/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/accessibility-audit/faq' },
  },
  'advanced-performance-monitoring': {
    requirements: {
      title: '要件定義書',
      href: '/docs/features/advanced-performance-monitoring/requirements',
    },
    basic_design: {
      title: '基本設計書',
      href: '/docs/features/advanced-performance-monitoring/basic-design',
    },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/advanced-performance-monitoring/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/advanced-performance-monitoring' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/advanced-performance-monitoring/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/advanced-performance-monitoring/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/advanced-performance-monitoring/unit-tests',
    },
    e2e_tests: {
      title: 'e2eテストコード',
      href: '/docs/features/advanced-performance-monitoring/e2e-tests',
    },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/advanced-performance-monitoring/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/advanced-performance-monitoring/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/advanced-performance-monitoring/operation-manual',
    },
    runbook: {
      title: '運用手順書',
      href: '/docs/features/advanced-performance-monitoring/runbook',
    },
    faq: { title: 'FAQ', href: '/docs/features/advanced-performance-monitoring/faq' },
  },
  'production-optimization': {
    requirements: {
      title: '要件定義書',
      href: '/docs/features/production-optimization/requirements',
    },
    basic_design: {
      title: '基本設計書',
      href: '/docs/features/production-optimization/basic-design',
    },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/production-optimization/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/production-optimization' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/production-optimization/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/production-optimization/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/production-optimization/unit-tests',
    },
    e2e_tests: {
      title: 'e2eテストコード',
      href: '/docs/features/production-optimization/e2e-tests',
    },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/production-optimization/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/production-optimization/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/production-optimization/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/production-optimization/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/production-optimization/faq' },
  },
  'mobile-optimization': {
    requirements: { title: '要件定義書', href: '/docs/features/mobile-optimization/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/mobile-optimization/basic-design' },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/mobile-optimization/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/mobile-optimization' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/mobile-optimization/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/mobile-optimization/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/mobile-optimization/unit-tests',
    },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/mobile-optimization/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/mobile-optimization/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/mobile-optimization/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/mobile-optimization/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/mobile-optimization/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/mobile-optimization/faq' },
  },
  'error-dashboard': {
    requirements: { title: '要件定義書', href: '/docs/features/error-dashboard/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/error-dashboard/basic-design' },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/error-dashboard/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/error-dashboard' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/error-dashboard/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/error-dashboard/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/error-dashboard/unit-tests',
    },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/error-dashboard/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/error-dashboard/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/error-dashboard/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/error-dashboard/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/error-dashboard/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/error-dashboard/faq' },
  },
  'coverage-report': {
    requirements: { title: '要件定義書', href: '/docs/features/coverage-report/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/coverage-report/basic-design' },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/coverage-report/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/coverage-report' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/coverage-report/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/coverage-report/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/coverage-report/unit-tests',
    },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/coverage-report/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/coverage-report/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/coverage-report/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/coverage-report/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/coverage-report/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/coverage-report/faq' },
  },
  'dev-status': {
    requirements: { title: '要件定義書', href: '/docs/features/dev-status/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/dev-status/basic-design' },
    detailed_design: { title: '詳細設計書', href: '/docs/features/dev-status/detailed-design' },
    source_code: { title: 'ソースコード', href: '/dev-status' },
    github_actions: { title: 'GitHub Actions', href: '/docs/features/dev-status/github-actions' },
    unit_test_spec: { title: '単体試験仕様書', href: '/docs/features/dev-status/unit-test-spec' },
    unit_tests: { title: 'ユニットテストコード', href: '/docs/features/dev-status/unit-tests' },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/dev-status/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/dev-status/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/dev-status/system-test-spec',
    },
    operation_manual: { title: '操作手順書', href: '/docs/features/dev-status/operation-manual' },
    runbook: { title: '運用手順書', href: '/docs/features/dev-status/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/dev-status/faq' },
  },
  'cognitive-finance': {
    requirements: { title: '要件定義書', href: '/docs/features/cognitive-finance/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/cognitive-finance/basic-design' },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/cognitive-finance/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/cognitive-finance' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/cognitive-finance/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/cognitive-finance/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/cognitive-finance/unit-tests',
    },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/cognitive-finance/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/cognitive-finance/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/cognitive-finance/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/cognitive-finance/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/cognitive-finance/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/cognitive-finance/faq' },
  },
  'beta-user-recruitment': {
    basic_design: {
      title: '基本設計書',
      href: '/docs/features/beta-user-recruitment/basic-design',
    },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/beta-user-recruitment/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/beta-user-recruitment' },
    github_actions: {
      title: 'GitHub Actions',
      href: '/docs/features/beta-user-recruitment/github-actions',
    },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/beta-user-recruitment/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/beta-user-recruitment/unit-tests',
    },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/beta-user-recruitment/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/beta-user-recruitment/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/beta-user-recruitment/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/beta-user-recruitment/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/beta-user-recruitment/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/beta-user-recruitment/faq' },
  },
  subscription: {
    requirements: {
      title: '要件定義書',
      href: '/docs/features/subscription/requirements',
    },
  },
  'bug-list': {
    requirements: {
      title: '要件定義書',
      href: '/docs/features/bug-list/requirements',
    },
  },
  'user-testing': {
    requirements: { title: '要件定義書', href: '/docs/features/user-testing/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/user-testing/basic-design' },
    detailed_design: { title: '詳細設計書', href: '/docs/features/user-testing/detailed-design' },
    source_code: { title: 'ソースコード', href: '/user-testing' },
    github_actions: { title: 'GitHub Actions', href: '/docs/features/user-testing/github-actions' },
    unit_test_spec: { title: '単体試験仕様書', href: '/docs/features/user-testing/unit-test-spec' },
    unit_tests: { title: 'ユニットテストコード', href: '/docs/features/user-testing/unit-tests' },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/user-testing/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/user-testing/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/user-testing/system-test-spec',
    },
    operation_manual: { title: '操作手順書', href: '/docs/features/user-testing/operation-manual' },
    runbook: { title: '運用手順書', href: '/docs/features/user-testing/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/user-testing/faq' },
  },
  login: {
    requirements: { title: '要件定義書', href: '/docs/features/login/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/login/basic-design' },
    detailed_design: { title: '詳細設計書', href: '/docs/features/login/detailed-design' },
    source_code: { title: 'ソースコード', href: '/login' },
    unit_test_spec: { title: '単体試験仕様書', href: '/docs/features/login/unit-test-spec' },
    unit_tests: { title: 'ユニットテストコード', href: '/docs/features/login/unit-tests' },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/login/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/login/integration-test-spec',
    },
    system_test_spec: { title: '総合試験仕様書', href: '/docs/features/login/system-test-spec' },
    operation_manual: { title: '操作手順書', href: '/docs/features/login/operation-manual' },
    runbook: { title: '運用手順書', href: '/docs/features/login/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/login/faq' },
  },
  'user-registration': {
    requirements: { title: '要件定義書', href: '/docs/features/user-registration/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/user-registration/basic-design' },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/user-registration/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/register' },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/user-registration/unit-test-spec',
    },
    unit_tests: {
      title: 'ユニットテストコード',
      href: '/docs/features/user-registration/unit-tests',
    },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/user-registration/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/user-registration/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/user-registration/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/user-registration/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/user-registration/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/user-registration/faq' },
  },
  logout: {
    requirements: { title: '要件定義書', href: '/docs/features/logout/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/logout/basic-design' },
    detailed_design: { title: '詳細設計書', href: '/docs/features/logout/detailed-design' },
    source_code: { title: 'ソースコード', href: '/_bg/logout' },
    unit_test_spec: { title: '単体試験仕様書', href: '/docs/features/logout/unit-test-spec' },
    unit_tests: { title: 'ユニットテストコード', href: '/docs/features/logout/unit-tests' },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/logout/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/logout/integration-test-spec',
    },
    system_test_spec: { title: '総合試験仕様書', href: '/docs/features/logout/system-test-spec' },
    operation_manual: { title: '操作手順書', href: '/docs/features/logout/operation-manual' },
    runbook: { title: '運用手順書', href: '/docs/features/logout/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/logout/faq' },
  },
  'share-dev-progress': {
    requirements: { title: '要件定義書', href: '/docs/features/share-dev-progress/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/share-dev-progress/basic-design' },
    detailed_design: {
      title: '詳細設計書',
      href: '/docs/features/share-dev-progress/detailed-design',
    },
    source_code: { title: 'ソースコード', href: '/_bg/share-dev-progress' },
    unit_test_spec: {
      title: '単体試験仕様書',
      href: '/docs/features/share-dev-progress/unit-test-spec',
    },
    e2e_tests: {
      title: 'e2eテスト（プレースホルダー）',
      href: '/docs/features/share-dev-progress/e2e-tests',
    },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/share-dev-progress/integration-test-spec',
    },
    system_test_spec: {
      title: '総合試験仕様書',
      href: '/docs/features/share-dev-progress/system-test-spec',
    },
    operation_manual: {
      title: '操作手順書',
      href: '/docs/features/share-dev-progress/operation-manual',
    },
    runbook: { title: '運用手順書', href: '/docs/features/share-dev-progress/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/share-dev-progress/faq' },
  },
  admin: {
    requirements: { title: '要件定義書', href: '/docs/features/admin/requirements' },
    basic_design: { title: '基本設計書', href: '/docs/features/admin/basic-design' },
    detailed_design: { title: '詳細設計書', href: '/docs/features/admin/detailed-design' },
    source_code: { title: 'ソースコード', href: '/admin' },
    github_actions: { title: 'GitHub Actions', href: '/docs/features/admin/github-actions' },
    unit_test_spec: { title: '単体試験仕様書', href: '/docs/features/admin/unit-test-spec' },
    unit_tests: { title: 'ユニットテストコード', href: '/docs/features/admin/unit-tests' },
    e2e_tests: { title: 'e2eテストコード', href: '/docs/features/admin/e2e-tests' },
    integration_test_spec: {
      title: '結合試験仕様書',
      href: '/docs/features/admin/integration-test-spec',
    },
    system_test_spec: { title: '総合試験仕様書', href: '/docs/features/admin/system-test-spec' },
    operation_manual: { title: '操作手順書', href: '/docs/features/admin/operation-manual' },
    runbook: { title: '運用手順書', href: '/docs/features/admin/runbook' },
    faq: { title: 'FAQ', href: '/docs/features/admin/faq' },
  },
};
