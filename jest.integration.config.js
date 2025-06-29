module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: true,
    }],
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Integration test specific patterns
  testMatch: [
    '<rootDir>/src/**/*.integration.{test,spec}.{ts,tsx}',
    '<rootDir>/src/**/integration/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/services/integration/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/services/testing/**/*.{test,spec}.{ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/', // Exclude unit tests
  ],
  moduleDirectories: ['node_modules', 'src'],
  passWithNoTests: true,
  // Extended timeout for integration tests
  testTimeout: 30000,
  // Integration test specific globals
  globals: {
    'import.meta': {
      env: {
        VITE_API_BASE_URL: 'http://localhost:3001/api',
        VITE_USE_MOCK_DATA: 'false', // Integration tests may use real services
        MODE: 'integration-test',
        DEV: true,
        PROD: false,
        SSR: false,
        VITE_ADMIN_EMAILS: 'admin@test.com',
        VITE_SKIP_AUTH: 'true',
        VITE_ENABLE_INTEGRATION_TESTS: 'true',
      },
    },
  },
  // Collect coverage from integration test files
  collectCoverageFrom: [
    'src/services/integration/**/*.{ts,tsx}',
    'src/services/testing/**/*.{ts,tsx}',
    'src/services/ai/**/*.{ts,tsx}',
    'src/services/security/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
}; 