module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts', '<rootDir>/src/test-utils/setup.ts'],
  setupFiles: ['<rootDir>/src/jest.polyfills.js'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    // Firebase module mocks
    '^firebase/app$': '<rootDir>/src/__mocks__/firebase.js',
    '^firebase/firestore$': '<rootDir>/src/__mocks__/firebase.js',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase.js',
    '^firebase/storage$': '<rootDir>/src/__mocks__/firebase.js',
    '^firebase/analytics$': '<rootDir>/src/__mocks__/firebase.js',
    '^firebase/database$': '<rootDir>/src/__mocks__/firebase.js',
    '^firebase/functions$': '<rootDir>/src/__mocks__/firebase.js',
    // Specific TokenManager mock MUST come first for Jest to apply it
    '^@/services/auth/TokenManager$': '<rootDir>/src/__mocks__/TokenManager.js',
    // CSS files specific handling
    '^@/styles/(.*)\\.(css|scss|sass|less)$': 'identity-obj-proxy',
    // General path aliases after specific mappings
    '^@/(.*)$': '<rootDir>/src/$1',
    // Asset mocks - all CSS files
    '\\.(css|less|scss|sass|styl)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: false,
      isolatedModules: true,
    }],
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase|@google-cloud|recharts|@grpc|google-gax)/)',
  ],
  globals: {
    'ts-jest': {
      useESM: false,
    },
    'import.meta': {
      env: {
        DEV: false,
        PROD: false,
        MODE: 'test',
        BASE_URL: '/',
        VITE_API_BASE_URL: 'http://localhost:3001/api',
        VITE_USE_MOCK_DATA: 'true',
        VITE_ENABLE_ANALYTICS: 'false',
        VITE_DEBUG: 'false',
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
        VITE_FIREBASE_APP_ID: '1:123456789:web:test123456',
        VITE_GEMINI_API_KEY: 'test-gemini-key',
        VITE_CLAUDE_API_KEY: 'test-claude-key',
        VITE_OPENAI_API_KEY: 'test-openai-key',
        VITE_GITHUB_TOKEN: 'test-github-token',
        VITE_STRIPE_PUBLISHABLE_KEY: 'test-stripe-key',
        GEMINI_API_KEY: 'test-gemini-key',
      },
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false, // Keep this false to preserve our manual mocks
  passWithNoTests: true,
};