module.exports = {
  // テスト環境
  testEnvironment: 'jsdom',
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // モジュールの解決
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // ファイル拡張子
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 変換設定
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // カバレッジ設定
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  
  // カバレッジ閾値
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // テストタイムアウト
  testTimeout: 10000,
  
  // 並列実行
  maxWorkers: '50%',
  
  // 詳細な出力
  verbose: true,
  
  // クリーンアップ
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
