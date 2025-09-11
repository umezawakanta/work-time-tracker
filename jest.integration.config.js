export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': 'identity-obj-proxy',
  },
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
    '<rootDir>/tests/integration/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/e2e/**/*.{test,spec}.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Exclude unit tests from integration runs
    '/__tests__/.*(?<!integration)\\.(test|spec)\\.(ts|tsx)$',
  ],
  moduleDirectories: ['node_modules', 'src'],
  passWithNoTests: true,
  globals: {},
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/setupTests.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000, // Longer timeout for integration tests
  // Integration-specific environment variables
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
}; 