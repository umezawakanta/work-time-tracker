import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

// Web API polyfills for Node.js environment
Object.assign(global, {
  TextEncoder,
  TextDecoder,
  Request: global.Request || class Request {},
  Response: global.Response || class Response {},
  Headers: global.Headers || class Headers {},
});

// テスト環境用の環境変数設定
process.env.NODE_ENV = 'test';
process.env.VITE_API_BASE_URL = 'http://localhost:3001/api';
process.env.VITE_USE_MOCK_DATA = 'true';

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

// Location mockの追加
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    protocol: 'http:',
    href: 'http://localhost:3000',
  },
  writable: true,
});
