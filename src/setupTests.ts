import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Web API polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Fetch API polyfill (必要に応じて)
if (!global.fetch) {
  global.fetch = require('jest-fetch-mock');
}

// Vite環境変数のモック
const mockImport = {
  env: {
    VITE_API_BASE_URL: 'http://localhost:3001/api',
    VITE_USE_MOCK_DATA: 'true',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false,
  },
};

// import.meta.envのモック
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: mockImport.env,
    },
  },
  writable: true,
  configurable: true,
});

// URL constructorのpolyfill
if (typeof URL === 'undefined') {
  global.URL = require('url').URL;
}

// URLSearchParamsのpolyfill
if (typeof URLSearchParams === 'undefined') {
  global.URLSearchParams = require('url').URLSearchParams;
}

// Additional DOM/Web API mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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

// IntersectionObserver mock
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};
