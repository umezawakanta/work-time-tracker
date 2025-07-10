import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';
import React from 'react';

// ========================================
// CSS and Asset Mocks
// ========================================

// Mock CSS imports
jest.mock('@/styles/chart.css', () => ({}));
jest.mock('@/styles/globals.css', () => ({}));

// Mock any CSS file imports
jest.mock('*.css', () => ({}), { virtual: true });
jest.mock('*.scss', () => ({}), { virtual: true });
jest.mock('*.sass', () => ({}), { virtual: true });

// Mock image and asset imports
jest.mock('*.png', () => 'test-file-stub', { virtual: true });
jest.mock('*.jpg', () => 'test-file-stub', { virtual: true });
jest.mock('*.jpeg', () => 'test-file-stub', { virtual: true });
jest.mock('*.gif', () => 'test-file-stub', { virtual: true });
jest.mock('*.svg', () => 'test-file-stub', { virtual: true });

// ========================================
// Hook Mocks
// ========================================

// Mock useInternationalization hook globally
jest.mock('./hooks/useInternationalization', () => ({
  InternationalizationProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', {}, children),
  useInternationalization: () => ({
    locale: 'ja' as const,
    setLocale: jest.fn(),
    t: (key: string) => key,
    formatDate: (date: Date) => date.toLocaleDateString(),
    formatTime: (date: Date) => date.toLocaleTimeString(),
    formatNumber: (number: number) => number.toString(),
    formatCurrency: (amount: number) => `¥${amount}`,
    getLocaleConfig: () => ({
      code: 'ja' as const,
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      direction: 'ltr' as const,
      dateFormat: 'YYYY年MM月DD日',
      timeFormat: 'HH:mm',
      currency: 'JPY',
      numberFormat: { decimal: '.', thousands: ',' },
    }),
    isRTL: false,
  }),
  SUPPORTED_LOCALES: {
    ja: {
      code: 'ja' as const,
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      direction: 'ltr' as const,
      dateFormat: 'YYYY年MM月DD日',
      timeFormat: 'HH:mm',
      currency: 'JPY',
      numberFormat: { decimal: '.', thousands: ',' },
    },
    en: {
      code: 'en' as const,
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr' as const,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'hh:mm A',
      currency: 'USD',
      numberFormat: { decimal: '.', thousands: ',' },
    },
  },
}));

// ========================================
// TypeScript Global Type Declarations
// ========================================

declare global {
  // Extend global namespace for test utilities only
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      testUtils: {
        delay: (ms?: number) => Promise<void>;
        mockResolve: <T>(value: T) => jest.MockedFunction<() => Promise<T>>;
        mockReject: (error: any) => jest.MockedFunction<() => Promise<never>>;
        createMockUser: (overrides?: any) => any;
        createMockTodo: (overrides?: any) => any;
        createMockEvent: (type: string, properties?: any) => Event;
      };
    }
  }

  var testUtils: {
    delay: (ms?: number) => Promise<void>;
    mockResolve: <T>(value: T) => jest.MockedFunction<() => Promise<T>>;
    mockReject: (error: any) => jest.MockedFunction<() => Promise<never>>;
    createMockUser: (overrides?: any) => any;
    createMockTodo: (overrides?: any) => any;
    createMockEvent: (type: string, properties?: any) => Event;
  };
}

// ========================================
// Web API Polyfills
// ========================================

// Web API polyfills for Node.js environment
Object.assign(global, {
  TextEncoder,
  TextDecoder,
  Request: global.Request || class Request {},
  Response: global.Response || class Response {},
  Headers: global.Headers || class Headers {},
});

// ========================================
// Environment Variables
// ========================================

// テスト環境用の環境変数設定
process.env.NODE_ENV = 'test';
process.env.VITE_API_BASE_URL = 'http://localhost:3001/api';
process.env.VITE_USE_MOCK_DATA = 'true';
process.env.VITE_ENABLE_ANALYTICS = 'false';
process.env.VITE_DEBUG = 'false';

// Enhanced import.meta.env for Vite compatibility
const viteEnv = {
  DEV: false,
  PROD: false,
  MODE: 'test',
  BASE_URL: '/',
  VITE_API_BASE_URL: 'http://localhost:3001/api',
  VITE_USE_MOCK_DATA: 'true',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_DEBUG: 'false',
};

// Define import.meta for Vite compatibility with proper typing
const importMeta = {
  env: viteEnv,
  url: 'file:///test-file.js',
  hot: undefined,
  glob: jest.fn(),
};

// Set on global with type assertion to avoid 'import' reserved word issues
Object.defineProperty(global, 'import', {
  value: { meta: importMeta },
  writable: true,
  configurable: true,
});

// Also define on globalThis for broader compatibility
Object.defineProperty(globalThis, 'import', {
  value: { meta: importMeta },
  writable: true,
  configurable: true,
});

// ========================================
// Browser API Mocks
// ========================================

// matchMedia mock for responsive components
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

// IntersectionObserver mock with comprehensive implementation
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    private callback: IntersectionObserverCallback,
    private options?: IntersectionObserverInit
  ) {
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '';
    this.thresholds = options?.threshold
      ? Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold]
      : [];
  }

  observe(_target: Element) {
    // Simulate intersection with default entry
    const mockEntry: IntersectionObserverEntry = {
      target: _target,
      boundingClientRect: _target.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: _target.getBoundingClientRect(),
      isIntersecting: true,
      rootBounds: null,
      time: Date.now(),
    };

    // Call callback asynchronously to simulate real behavior
    setTimeout(() => this.callback([mockEntry], this), 0);
  }

  unobserve(_target: Element) {}
  disconnect() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// ResizeObserver mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// MutationObserver mock
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
}));

// ========================================
// Location and Navigation Mocks
// ========================================

// Enhanced Location mock
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    protocol: 'http:',
    port: '3000',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    toString: () => 'http://localhost:3000',
  },
  writable: true,
  configurable: true,
});

// Navigator mock
Object.defineProperty(window, 'navigator', {
  value: {
    ...window.navigator,
    userAgent: 'Mozilla/5.0 (Test Environment)',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true,
    clipboard: {
      writeText: jest.fn(() => Promise.resolve()),
      readText: jest.fn(() => Promise.resolve('')),
    },
  },
  writable: true,
  configurable: true,
});

// ========================================
// Storage Mocks
// ========================================

// Enhanced storage mock with events
const createStorageMock = (storageType: 'localStorage' | 'sessionStorage') => {
  const store = new Map<string, string>();

  return {
    getItem: jest.fn((key: string) => store.get(key) || null),
    setItem: jest.fn((key: string, value: string) => {
      const oldValue = store.get(key) || null;
      store.set(key, String(value));

      // Dispatch storage event
      const event = new StorageEvent('storage', {
        key,
        oldValue,
        newValue: String(value),
        storageArea: storageType === 'localStorage' ? localStorage : sessionStorage,
        url: window.location.href,
      });
      window.dispatchEvent(event);
    }),
    removeItem: jest.fn((key: string) => {
      const oldValue = store.get(key) || null;
      store.delete(key);

      // Dispatch storage event
      const event = new StorageEvent('storage', {
        key,
        oldValue,
        newValue: null,
        storageArea: storageType === 'localStorage' ? localStorage : sessionStorage,
        url: window.location.href,
      });
      window.dispatchEvent(event);
    }),
    clear: jest.fn(() => {
      store.clear();

      // Dispatch storage event
      const event = new StorageEvent('storage', {
        key: null,
        oldValue: null,
        newValue: null,
        storageArea: storageType === 'localStorage' ? localStorage : sessionStorage,
        url: window.location.href,
      });
      window.dispatchEvent(event);
    }),
    get length() {
      return store.size;
    },
    key: jest.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] || null;
    }),
  };
};

global.localStorage = createStorageMock('localStorage');
global.sessionStorage = createStorageMock('sessionStorage');

// ========================================
// DOM API Enhancements
// ========================================

// Enhanced getBoundingClientRect with more realistic values
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  width: 100,
  height: 100,
  x: 0,
  y: 0,
  toJSON: jest.fn(),
}));

// scrollIntoView mock
Element.prototype.scrollIntoView = jest.fn();

// hasPointerCapture mock (for Radix UI components)
Element.prototype.hasPointerCapture = jest.fn(() => false);
Element.prototype.setPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();

// scrollTo mock
window.scrollTo = jest.fn();

// requestAnimationFrame / cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  return setTimeout(cb, 16); // ~60fps
});
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// ========================================
// Console Enhancements
// ========================================

// Enhance console for better test debugging
const originalConsole = { ...console };

// Only show errors and warnings in tests unless VERBOSE_TESTS is set
global.console = {
  ...originalConsole,
  log: process.env.VERBOSE_TESTS ? originalConsole.log : jest.fn(),
  debug: process.env.VERBOSE_TESTS ? originalConsole.debug : jest.fn(),
  info: process.env.VERBOSE_TESTS ? originalConsole.info : jest.fn(),
  warn: originalConsole.warn,
  error: originalConsole.error,
};

// ========================================
// Test Utilities
// ========================================

// Add useful test utilities to global scope with proper typing
const testUtilities = {
  delay: (ms = 0) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
  mockResolve: <T>(value: T) => jest.fn(() => Promise.resolve(value)),
  mockReject: (error: any) => jest.fn(() => Promise.reject(error)),
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  }),
  createMockTodo: (overrides = {}) => ({
    id: 'test-todo-id',
    name: 'Test Todo',
    completed: false,
    priority: 1,
    category: 'test',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
  createMockEvent: (type: string, properties = {}) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, properties);
    return event;
  },
};

// Assign to global
global.testUtils = testUtilities;

// ========================================
// Error Handling
// ========================================

// Suppress specific warnings that are expected in test environment
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];

  // Suppress known warnings that don't affect test validity
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is deprecated') ||
      message.includes('Warning: componentWillReceiveProps') ||
      message.includes('act(...)') ||
      message.includes('useLayoutEffect does nothing on the server'))
  ) {
    return;
  }

  originalWarn.apply(console, args);
};

// Unhandled promise rejection handler for better test debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ========================================
// EventTarget Implementation Fix
// ========================================

// Properly implement EventTarget if not available with simpler approach
if (typeof EventTarget === 'undefined') {
  // Simple EventTarget implementation that satisfies TypeScript
  const CustomEventTarget = class {
    private listeners: { [key: string]: EventListener[] } = {};

    addEventListener(type: string, listener: EventListener | null): void {
      if (!listener) return;
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    }

    removeEventListener(type: string, listener: EventListener | null): void {
      if (!listener || !this.listeners[type]) return;
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }

    dispatchEvent(event: Event): boolean {
      if (this.listeners[event.type]) {
        this.listeners[event.type].forEach((listener) => {
          listener.call(this, event);
        });
      }
      return true;
    }
  };

  // Assign to global
  (global as any).EventTarget = CustomEventTarget;
}
