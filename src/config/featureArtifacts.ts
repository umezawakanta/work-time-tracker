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
    requirements: {
      title: '要件定義書',
      href: '/docs/features/beta-user-recruitment/requirements',
    },
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
};
