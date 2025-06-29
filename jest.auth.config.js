/**
 * 認証システム専用 Jest 設定
 * 
 * このファイルは認証関連テストのみを実行する際の設定を提供します。
 * 使用方法: npm run test:auth
 */

module.exports = {
  // 基本設定を継承
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // 認証テスト専用の設定
  displayName: '🔐 Authentication Tests',

  // モジュール解決設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': 'identity-obj-proxy',
    '\\.scss$': 'identity-obj-proxy',
    '\\.svg$': 'jest-transform-stub',
  },

  // TypeScript 変換設定
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        target: 'es2020',
        lib: ['es2020', 'dom', 'dom.iterable'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
      },
      useESM: false,
    }],
  },

  // セットアップファイル
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts',
    '<rootDir>/src/services/auth/__tests__/setup.ts'
  ],

  // 認証テストのみを対象とする
  testMatch: [
    '<rootDir>/src/services/auth/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/services/auth/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/context/**/__tests__/*Auth*.{ts,tsx}',
    '<rootDir>/src/pages/**/__tests__/*Login*.{ts,tsx}',
    '<rootDir>/src/pages/**/__tests__/*Register*.{ts,tsx}',
    '<rootDir>/src/hooks/**/__tests__/*Auth*.{ts,tsx}',
    '<rootDir>/src/hooks/**/__tests__/*useAuth*.{ts,tsx}',
  ],

  // 除外パターン
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/__tests__/setup.ts',
  ],

  // 変換を無視するパターン
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],

  // モジュール拡張子
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // モジュールディレクトリ
  moduleDirectories: ['node_modules', 'src'],

  // テストなしでも通す
  passWithNoTests: false,

  // グローバル設定
  globals: {},

  // カバレッジ設定（認証システム専用）
  collectCoverageFrom: [
    'src/services/auth/**/*.{ts,tsx}',
    'src/context/*Auth*.{ts,tsx}',
    'src/pages/*Login*.{ts,tsx}',
    'src/pages/*Register*.{ts,tsx}',
    'src/hooks/*Auth*.{ts,tsx}',
    'src/hooks/*useAuth*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/setup.ts',
  ],

  // カバレッジディレクトリ
  coverageDirectory: 'coverage/auth',

  // カバレッジレポーター
  coverageReporters: ['text', 'lcov', 'html', 'clover'],

  // カバレッジ閾値（認証システム用）
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/services/auth/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/context/AuthContext.tsx': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // テストタイムアウト
  testTimeout: 15000, // 認証テストは少し長めに設定

  // 詳細出力
  verbose: true,

  // エラー時の詳細情報
  errorOnDeprecated: true,

  // テスト実行前のクリアスクリーン
  clearMocks: true,
  restoreMocks: true,

  // 認証テスト専用の環境変数
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Watch モード設定
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // 並列実行設定
  maxWorkers: '50%',

  // キャッシュディレクトリ
  cacheDirectory: '<rootDir>/node_modules/.cache/jest-auth',

  // モジュール境界の設定
  haste: {
    enableSymlinks: false,
  },

  // テスト結果のフォーマット
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/auth/html-report',
        filename: 'auth-test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: '🔐 Authentication System Test Report',
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage/auth',
        outputName: 'auth-test-results.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{displayName} - {filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],

  // テスト前後のスクリプト
  globalSetup: undefined,
  globalTeardown: undefined,

  // スナップショット設定
  snapshotSerializers: [],

  // テストマッチャー設定
  testMatch: [
    '<rootDir>/src/services/auth/**/__tests__/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/context/__tests__/AuthContext.test.{ts,tsx}',
    '<rootDir>/src/pages/__tests__/Login.*.test.{ts,tsx}',
    '<rootDir>/src/pages/__tests__/Register.*.test.{ts,tsx}',
  ],

  // モック設定
  automock: false,
  unmockedModulePathPatterns: [],

  // 依存関係の設定
  dependencyExtractor: undefined,

  // プロジェクト設定
  projects: undefined,
  runner: 'jest-runner',

  // 認証テスト専用のシード設定
  randomize: false,
  seed: 42,

  // ファイル変更検知の設定
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
  ],

  // Node.js 固有の設定
  testEnvironment: 'jsdom',
  testURL: 'http://localhost',

  // エラーハンドリング
  bail: 0, // エラーでも継続
  collectCoverage: true,
  forceExit: false,
  detectOpenHandles: true,

  // デバッグ設定
  silent: false,

  // 認証テスト用のカスタムマッチャー
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts',
    '<rootDir>/src/services/auth/__tests__/setup.ts',
  ],
}; 