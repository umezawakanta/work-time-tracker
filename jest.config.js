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
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  moduleDirectories: ['node_modules', 'src'],
  passWithNoTests: true,
  globals: {
    'import.meta': {
      env: {
        VITE_API_BASE_URL: 'http://localhost:3001/api',
        VITE_USE_MOCK_DATA: 'true',
        MODE: 'test',
        DEV: true,
        PROD: false,
        SSR: false,
        VITE_ADMIN_EMAILS: 'admin@test.com',
        VITE_SKIP_AUTH: 'true',
      },
    },
  },
};