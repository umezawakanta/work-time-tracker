module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
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
    '<rootDir>/src/**/*.(test|spec).{ts,tsx}',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false, // Keep this false to preserve our manual mocks
};