// Enhanced Jest setup for comprehensive Vite compatibility and environment setup

// ========================================
// Environment Variables Setup
// ========================================

// Comprehensive import.meta.env mock with all possible Vite variables
const importMetaEnv = {
  // Basic Vite environment variables
  DEV: process.env.NODE_ENV === 'development',
  PROD: process.env.NODE_ENV === 'production',
  MODE: process.env.NODE_ENV || 'test',

  // API Configuration
  VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3001/api',

  // Firebase Configuration
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'test.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'test.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || 'test-app-id',

  // Application Configuration
  VITE_USE_MOCK_DATA: process.env.VITE_USE_MOCK_DATA || 'true',
  VITE_ENABLE_ANALYTICS: process.env.VITE_ENABLE_ANALYTICS || 'false',
  VITE_DEBUG: process.env.VITE_DEBUG || 'false',

  // Additional environment variables
  VITE_APP_VERSION: process.env.VITE_APP_VERSION || '1.0.0-test',
  VITE_BUILD_TIME: process.env.VITE_BUILD_TIME || new Date().toISOString(),
};

// Enhanced import.meta mock with proper property descriptors
const importMeta = {
  env: new Proxy(importMetaEnv, {
    get(target, prop) {
      return target[prop] !== undefined ? target[prop] : undefined;
    },
    has(target, prop) {
      return prop in target;
    },
  }),
  url: 'file:///test-file.js',
  resolve: jest.fn((specifier) => `file:///resolved/${specifier}`),
};

// Define import.meta globally with proper descriptors
Object.defineProperty(global, 'import', {
  value: {
    meta: importMeta
  },
  writable: true,
  configurable: true
});

// Also set it directly on globalThis for better compatibility
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: importMeta
  },
  writable: true,
  configurable: true
});

// ========================================
// Process Environment Variables
// ========================================

// Set process.env variables for comprehensive compatibility
Object.assign(process.env, {
  NODE_ENV: process.env.NODE_ENV || 'test',
  VITE_USE_MOCK_DATA: 'true',
  VITE_API_BASE_URL: 'http://localhost:3001/api',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_DEBUG: 'false',
});

// ========================================
// Browser API Mocks
// ========================================

// Enhanced matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Enhanced ResizeObserver mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Enhanced IntersectionObserver mock
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  root: null,
  rootMargin: '',
  thresholds: [],
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
}));

// MutationObserver mock
global.MutationObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
}));

// ========================================
// Crypto API Mock
// ========================================

// Enhanced crypto mock with more methods
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-1234-5678-9012-123456789abc'),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      digest: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
    },
  },
  configurable: true,
});

// ========================================
// Storage API Mocks
// ========================================

// Enhanced localStorage mock with event simulation
const createStorageMock = () => {
  const store = new Map();

  return {
    getItem: jest.fn((key) => store.get(key) || null),
    setItem: jest.fn((key, value) => {
      store.set(key, String(value));
      // Simulate storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: String(value),
        storageArea: localStorage,
      }));
    }),
    removeItem: jest.fn((key) => {
      const oldValue = store.get(key);
      store.delete(key);
      // Simulate storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        oldValue,
        newValue: null,
        storageArea: localStorage,
      }));
    }),
    clear: jest.fn(() => {
      store.clear();
      // Simulate storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: null,
        oldValue: null,
        newValue: null,
        storageArea: localStorage,
      }));
    }),
    get length() {
      return store.size;
    },
    key: jest.fn((index) => {
      const keys = Array.from(store.keys());
      return keys[index] || null;
    }),
  };
};

global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();

// ========================================
// URL and Location Mocks
// ========================================

// URL mock
global.URL = jest.fn().mockImplementation((url, base) => ({
  href: url,
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  searchParams: new URLSearchParams(),
  toString: () => url,
}));

global.URLSearchParams = global.URLSearchParams || class URLSearchParams { };

// ========================================
// Fetch and Network Mocks
// ========================================

// Enhanced fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    url: 'http://localhost:3000',
    clone: jest.fn(),
  })
);

// Request and Response constructors
global.Request = global.Request || class Request { };
global.Response = global.Response || class Response { };
global.Headers = global.Headers || class Headers { };

// ========================================
// Canvas and WebGL Mocks
// ========================================

// Canvas context mock
const mockCanvasContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
};

// Canvas element mock
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return mockCanvasContext;
  }
  return null;
});

HTMLCanvasElement.prototype.toDataURL = jest.fn(() => '');
HTMLCanvasElement.prototype.toBlob = jest.fn();

// ========================================
// Additional DOM API Mocks
// ========================================

// ScrollIntoView mock
Element.prototype.scrollIntoView = jest.fn();

// getBoundingClientRect mock
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: jest.fn(),
}));

// requestAnimationFrame mock
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Performance API mock
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
};

// Console methods enhancement for testing
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  // Suppress console.log in tests unless explicitly needed
  log: process.env.VERBOSE_TESTS ? originalConsole.log : jest.fn(),
  debug: process.env.VERBOSE_TESTS ? originalConsole.debug : jest.fn(),
  info: process.env.VERBOSE_TESTS ? originalConsole.info : jest.fn(),
  warn: originalConsole.warn, // Keep warnings
  error: originalConsole.error, // Keep errors
};

// ========================================
// Test Utilities
// ========================================

// Global test utilities
global.testUtils = {
  // Simulate async delay
  delay: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock async function that resolves
  mockResolve: (value) => jest.fn(() => Promise.resolve(value)),

  // Mock async function that rejects
  mockReject: (error) => jest.fn(() => Promise.reject(error)),

  // Create mock user object
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  }),

  // Create mock todo item
  createMockTodo: (overrides = {}) => ({
    id: 'test-todo-id',
    name: 'Test Todo',
    completed: false,
    priority: 1,
    category: 'test',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
};