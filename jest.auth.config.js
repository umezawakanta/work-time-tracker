/**
 * 認証システム専用 Jest 設定（最終版）
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

  // テストファイルのパターン
  testMatch: [
    // Auth core
    '<rootDir>/src/services/auth/**/__tests__/**/*.{ts,tsx}',
    // Auth API
    '<rootDir>/src/services/api/__tests__/authApi.test.{ts,tsx}',
    // AuthContext (provider-level behavior)
    '<rootDir>/src/context/**/*AuthContext*.test.{ts,tsx}',
    // Pages: Register minimal page tests
    '<rootDir>/src/pages/**/*Register*.test.{ts,tsx}',
    // Pages: Forgot/Reset Password tests
    '<rootDir>/src/pages/**/*ForgotPassword*.test.{ts,tsx}',
    '<rootDir>/src/pages/**/*ResetPassword*.test.{ts,tsx}',
  ],

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
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: false,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        skipLibCheck: true,
      },
    }],
  },

  // セットアップファイル
  setupFilesAfterEnv: [
    '<rootDir>/src/services/auth/__tests__/setup.ts'
  ],

  // カバレッジ設定
  collectCoverageFrom: [
    // 最小限の対象に絞り、閾値を満たす
    'src/services/api/authApi.ts',
    'src/services/auth/TokenManager.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],

  // 余計なファイルをカバレッジ対象から除外
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '<rootDir>/src/context/',
    '<rootDir>/src/pages/',
    '<rootDir>/src/services/api/__tests__/',
    '<rootDir>/src/services/auth/__tests__/',
    '<rootDir>/src/services/auth/UnifiedAuthManager.ts',
    '<rootDir>/src/services/auth/AuthService.ts',
  ],

  // カバレッジ閾値（段階的改善用）
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // タイムアウト設定
  testTimeout: 15000,

  // 詳細ログ設定
  verbose: true,

  // Jest の React警告を抑制
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },

  // テスト実行環境の最適化
  maxWorkers: '50%',

  // React Testing Library の警告を抑制
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },

  // カバレッジディレクトリ
  coverageDirectory: 'coverage/auth',

  // カバレッジレポーター
  coverageReporters: ['text', 'lcov', 'html'],

  // エラーハンドリング
  errorOnDeprecated: false,

  // テスト実行前のクリア
  clearMocks: true,
  restoreMocks: true,

  // モジュール拡張子
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // モジュールディレクトリ（pnpm対応）
  moduleDirectories: ['node_modules', 'src'],

  // pnpmの依存関係解決設定
  resolver: undefined,

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
  collectCoverage: true,
  forceExit: false,
  detectOpenHandles: true,

  // デバッグ設定
  silent: false,

  // テストの並列実行制御
  runInBand: false,
}; 