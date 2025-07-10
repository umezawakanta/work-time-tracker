module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // Enhanced module name mapping for comprehensive file type support
  moduleNameMapper: {
    // CSS and style files FIRST - before path aliases to catch them early
    '^@/styles/.*\\.(css|scss|sass|less|styl)$': '<rootDir>/src/__mocks__/cssMock.js',
    '\\.(css|scss|sass|less|styl)$': '<rootDir>/src/__mocks__/cssMock.js',
    '\\.module\\.(css|scss|sass|less|styl)$': 'identity-obj-proxy',

    // Path aliases AFTER CSS handling
    '^@/(.*)$': '<rootDir>/src/$1',

    // Static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',

    // Handle .js imports from .ts files (common in some packages)
    '^(.+)\\.js$': '$1',
  },

  // Enhanced transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        target: 'es2020',
        lib: ['es2020', 'dom', 'dom.iterable', 'es6'],
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
        // Additional TypeScript options for better compatibility
        downlevelIteration: true,
        importHelpers: true,
      },
      useESM: false,
    }],
    // Handle JavaScript files that might not be pre-transpiled
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ]
    }],
  },

  // Setup files for global configurations
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Enhanced transform ignore patterns for modern packages
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@radix-ui|lucide-react|recharts|date-fns))',
  ],

  // File extensions Jest should handle
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx,js,jsx}'
  ],

  // Paths to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '\\.d\\.ts$',
  ],

  // Module directories for resolution
  moduleDirectories: ['node_modules', 'src'],

  // Allow tests to pass even if no tests are found
  passWithNoTests: true,

  // Global variables
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/setupTests.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.stories.{ts,tsx,js,jsx}',
    '!src/**/*.config.{ts,tsx,js,jsx}',
    '!src/**/index.{ts,tsx,js,jsx}',
  ],

  // Coverage output
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Coverage thresholds (optional)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Test timeout for async operations
  testTimeout: 15000,

  // Error handling
  errorOnDeprecated: false,
  verbose: false,

  // Additional Jest options for better error reporting
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Handle ES modules properly
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};