/**
 * 認証システム専用 Jest 設定（pnpm対応版）
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
    '\\.svg$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
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
    '<rootDir>/src/services/auth/**/__tests__/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/context/__tests__/AuthContext.test.{ts,tsx}',
    '<rootDir>/src/pages/__tests__/Login.*.test.{ts,tsx}',
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

  // モジュールディレクトリ（pnpm対応）
  moduleDirectories: ['node_modules', 'src'],

  // pnpmの依存関係解決設定
  resolver: undefined,

  // テストなしでも通す
  passWithNoTests: false,

  // グローバル設定
  globals: {},

  // カバレッジ設定
  collectCoverageFrom: [
    'src/services/auth/**/*.{ts,tsx}',
    'src/context/*Auth*.{ts,tsx}',
    'src/pages/*Login*.{ts,tsx}',
    'src/hooks/*Auth*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/setup.ts',
  ],

  // カバレッジディレクトリ
  coverageDirectory: 'coverage/auth',

  // カバレッジレポーター
  coverageReporters: ['text', 'lcov', 'html'],

  // カバレッジ閾値（初期は低めに設定）
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // テストタイムアウト
  testTimeout: 15000,

  // 詳細出力
  verbose: true,

  // エラー時の詳細情報
  errorOnDeprecated: false,

  // テスト実行前のクリア
  clearMocks: true,
  restoreMocks: true,

  // テスト環境設定
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // 並列実行設定
  maxWorkers: '50%',

  // キャッシュディレクトリ（pnpm対応）
  cacheDirectory: '<rootDir>/node_modules/.cache/jest-auth',

  // モジュール境界の設定
  haste: {
    enableSymlinks: false,
  },

  // テスト結果のフォーマット（シンプル版）
  reporters: [
    'default'
  ],

  // テスト前後のスクリプト
  globalSetup: undefined,
  globalTeardown: undefined,

  // スナップショット設定
  snapshotSerializers: [],

  // モック設定
  automock: false,
  unmockedModulePathPatterns: [],

  // 依存関係の設定
  dependencyExtractor: undefined,

  // プロジェクト設定
  projects: undefined,
  runner: 'jest-runner',

  // ファイル変更検知の設定
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
  ],

  // エラーハンドリング
  bail: 0,
  collectCoverage: false, // 初回は無効化
  forceExit: false,
  detectOpenHandles: true,

  // デバッグ設定
  silent: false,
}; 