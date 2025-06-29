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
    'ts-jest': {
      useESM: true,
    },
    // Mock import.meta for all tests
    'import.meta': {
      env: {
        DEV: false,
        PROD: true,
        MODE: 'test',
        VITE_API_URL: 'http://localhost:3000',
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
        VITE_FIREBASE_APP_ID: 'test-app-id',
      }
    }
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
};