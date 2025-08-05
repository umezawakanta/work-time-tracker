// CRITICAL: Import and set React globally FIRST
import React, { type ReactElement } from 'react';

// Make React available globally immediately
global.React = React;
(global as any).React = React;
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

// Now import other dependencies
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

// Global axios mock - MUST be first to ensure it's applied before any module imports
jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
    defaults: {
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    request: jest.fn(),
  };

  const mockedAxios = {
    create: jest.fn(() => mockAxiosInstance),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    request: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
    defaults: {
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };

  console.log('🔧 Global axios mock created');
  return {
    default: mockedAxios,
    __esModule: true,
    ...mockedAxios,
  };
});

// ========================================
// CSS and Asset Mocks
// ========================================

// CSS imports are handled by moduleNameMapper in jest.config.js
// No need to mock CSS files here since they're already handled by the pattern matcher

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
process.env.JEST_WORKER_ID = '1';
process.env.VITE_API_BASE_URL = 'http://localhost:3001/api';
process.env.VITE_USE_MOCK_DATA = 'true';
process.env.VITE_ENABLE_ANALYTICS = 'false';
process.env.VITE_DEBUG = 'false';

// Firebase test configuration
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.VITE_FIREBASE_APP_ID = '1:123456789:web:test123456';
process.env.VITE_GEMINI_API_KEY = 'test-gemini-key';

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
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  VITE_FIREBASE_APP_ID: '1:123456789:web:test123456',
  VITE_GEMINI_API_KEY: 'test-gemini-key',
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

// ========================================
// Radix UI Component Mocks
// ========================================

// Mock Radix UI components that cause issues in Jest
jest.mock('@radix-ui/react-tabs', () => {
  const React = require('react');
  return {
  Root: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'tabs-root', ...props }, children),
  List: ({ children, ...props }: any) =>
    React.createElement(
      'div',
      {
        'data-testid': 'tabs-list',
        role: 'tablist',
        'aria-orientation': 'horizontal',
        ...props,
      },
      children
    ),
  Trigger: ({ children, ...props }: any) =>
    React.createElement(
      'button',
      {
        'data-testid': 'tabs-trigger',
        role: 'tab',
        'aria-selected': props.value === props.defaultValue ? 'true' : 'false',
        tabIndex: props.value === props.defaultValue ? 0 : -1,
        ...props,
      },
      children
    ),
  Content: ({ children, ...props }: any) =>
    React.createElement(
      'div',
      {
        'data-testid': 'tabs-content',
        role: 'tabpanel',
        tabIndex: 0,
        ...props,
      },
      children
    ),
  };
});

jest.mock('@radix-ui/react-roving-focus', () => {
  const React = require('react');
  return {
  createRovingFocusGroupScope: () => () => ({}),
  RovingFocusGroup: ({ children, ...props }: any) => React.createElement('div', props, children),
  RovingFocusGroupItem: ({ children, ...props }: any) =>
    React.createElement('div', props, children),
  useRovingFocus: () => ({ tabStopId: undefined, focusableId: undefined }),
  };
});

// Mock Radix UI Popper to prevent infinite loops
jest.mock('@radix-ui/react-popper', () => ({
  createPopperScope: () => () => ({}),
  Root: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'popper-root', ...props }, children),
  Anchor: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'popper-anchor', ...props }, children),
  Content: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'popper-content', ...props }, children),
  Arrow: ({ ...props }: any) =>
    React.createElement('div', { 'data-testid': 'popper-arrow', ...props }),
}));

// Mock other problematic Radix UI components
jest.mock('@radix-ui/react-select', () => {
  const React = require('react');
  const mockComponent = (displayName: string, element = 'div') => {
    const Component = React.forwardRef(({ children, ...props }: any, ref: any) => {
      let roleProps: any = {};

      if (displayName === 'SelectTrigger') {
        roleProps = {
          role: 'combobox',
          'aria-expanded': 'false', // Keep simple for tests
        };
      } else if (displayName === 'SelectContent') {
        roleProps = {
          role: 'listbox',
        };
      } else if (displayName === 'SelectItem') {
        roleProps = {
          role: 'option',
        };
      }

      return React.createElement(
        element,
        {
          ref,
          'data-testid': displayName.toLowerCase(),
          ...roleProps,
          ...props,
        },
        children
      );
    });
    Component.displayName = displayName;
    return Component;
  };

  return {
    Root: mockComponent('SelectRoot'),
    Group: mockComponent('SelectGroup'),
    Value: mockComponent('SelectValue', 'span'),
    Trigger: mockComponent('SelectTrigger', 'button'),
    Content: mockComponent('SelectContent'),
    Portal: ({ children }: any) => children, // Portal just renders children
    Viewport: mockComponent('SelectViewport'),
    Item: mockComponent('SelectItem'),
    ItemText: mockComponent('SelectItemText', 'span'),
    ItemIndicator: mockComponent('SelectItemIndicator', 'span'),
    Label: mockComponent('SelectLabel'),
    Separator: mockComponent('SelectSeparator', 'hr'),
    ScrollUpButton: mockComponent('SelectScrollUpButton', 'button'),
    ScrollDownButton: mockComponent('SelectScrollDownButton', 'button'),
    Icon: mockComponent('SelectIcon', 'span'),
  };
});

// Mock Radix UI Popover
jest.mock('@radix-ui/react-popover', () => ({
  Root: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'popover-root', ...props }, children),
  Trigger: ({ children, ...props }: any) =>
    React.createElement('button', { 'data-testid': 'popover-trigger', ...props }, children),
  Content: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'popover-content', ...props }, children),
  Anchor: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'popover-anchor', ...props }, children),
}));

// Mock Radix UI Dropdown Menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-root', ...props }, children),
  Trigger: ({ children, ...props }: any) =>
    React.createElement('button', { 'data-testid': 'dropdown-trigger', ...props }, children),
  Content: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-content', ...props }, children),
  Portal: ({ children }: any) => children,
  Item: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-item', ...props }, children),
  CheckboxItem: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-checkbox-item', ...props }, children),
  RadioItem: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-radio-item', ...props }, children),
  Label: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-label', ...props }, children),
  Separator: ({ ...props }: any) =>
    React.createElement('hr', { 'data-testid': 'dropdown-separator', ...props }),
  Group: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-group', ...props }, children),
  Sub: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-sub', ...props }, children),
  SubTrigger: ({ children, ...props }: any) =>
    React.createElement('button', { 'data-testid': 'dropdown-sub-trigger', ...props }, children),
  SubContent: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'dropdown-sub-content', ...props }, children),
}));

// ========================================
// Radix UI Specific Mocks and Setup
// ========================================

// Mock Radix UI Portal for better test reliability
jest.mock('@radix-ui/react-portal', () => {
  return {
    Portal: ({ children }: { children: React.ReactNode }) => children,
    Root: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Enhance Radix UI testing utilities
const mockRadixUIBehavior = () => {
  // Mock createPortal to render in place instead of in document.body
  const ReactDOM = jest.requireActual('react-dom');
  const originalCreatePortal = ReactDOM.createPortal;
  ReactDOM.createPortal = jest.fn(
    (element: React.ReactNode, _container: Element | DocumentFragment) => element
  );

  // Restore function for cleanup
  return () => {
    ReactDOM.createPortal = originalCreatePortal;
  };
};

// Apply Radix UI behavior mock globally
const restoreRadixUI = mockRadixUIBehavior();

// Add to global cleanup
if (typeof global.afterEach === 'function') {
  global.afterEach(() => {
    // Reset any DOM state that might affect subsequent tests
    document.body.innerHTML = '';
  });
}

// ========================================
// Enhanced Test Utilities for Async Components
// ========================================

// Add async testing utilities specifically for UI components
const asyncTestUtilities = {
  ...testUtilities,

  // Wait for Radix UI state changes
  waitForRadixUI: async (timeout = 1000) => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 50); // Allow for Radix UI internal state updates
    });

    // Wait for any pending microtasks
    await new Promise((resolve) => setTimeout(resolve, 0));
  },

  // Wait for form validation to complete
  waitForFormValidation: async (timeout = 1000) => {
    // Allow react-hook-form validation to complete
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });

    // Wait for DOM updates
    await new Promise((resolve) => setTimeout(resolve, 0));
  },

  // Trigger focus events properly for tests
  focusElement: async (element: HTMLElement) => {
    element.focus();
    element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await asyncTestUtilities.waitForRadixUI();
  },

  // Trigger blur events properly for tests
  blurElement: async (element: HTMLElement) => {
    element.blur();
    element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    await asyncTestUtilities.waitForRadixUI();
  },

  // Click with proper async handling
  clickElement: async (element: Element) => {
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await asyncTestUtilities.waitForRadixUI();
  },

  // Keyboard interaction with proper async handling
  keyboardInteraction: async (element: Element, key: string, options: KeyboardEventInit = {}) => {
    const keyboardOptions = { bubbles: true, cancelable: true, key, ...options };
    element.dispatchEvent(new KeyboardEvent('keydown', keyboardOptions));
    element.dispatchEvent(new KeyboardEvent('keyup', keyboardOptions));
    await asyncTestUtilities.waitForRadixUI();
  },
};

// Update global testUtils
global.testUtils = asyncTestUtilities;

// ========================================
// Form Testing Enhancements
// ========================================

// Mock react-hook-form validation timing - keep original setTimeout behavior
const originalSetTimeout = global.setTimeout;
global.setTimeout = jest.fn().mockImplementation((fn: (...args: any[]) => void, delay = 0) => {
  // For form validation, execute immediately in tests
  if (delay <= 100) {
    return originalSetTimeout(fn, 0);
  }
  return originalSetTimeout(fn, delay);
}) as unknown as typeof setTimeout;

// ========================================
// Additional DOM Event Fixes
// ========================================

// Fix PointerEvent for better Radix UI compatibility
if (!global.PointerEvent) {
  const MockPointerEvent = class extends MouseEvent {
    pointerId: number = 0;
    width: number = 1;
    height: number = 1;
    pressure: number = 0;
    tangentialPressure: number = 0;
    tiltX: number = 0;
    tiltY: number = 0;
    twist: number = 0;
    pointerType: string = 'mouse';
    isPrimary: boolean = false;
    altitudeAngle: number = 0;
    azimuthAngle: number = 0;

    constructor(type: string, eventInitDict: PointerEventInit = {}) {
      super(type, eventInitDict);
      this.pointerId = eventInitDict.pointerId ?? 0;
      this.width = eventInitDict.width ?? 1;
      this.height = eventInitDict.height ?? 1;
      this.pressure = eventInitDict.pressure ?? 0;
      this.tangentialPressure = eventInitDict.tangentialPressure ?? 0;
      this.tiltX = eventInitDict.tiltX ?? 0;
      this.tiltY = eventInitDict.tiltY ?? 0;
      this.twist = eventInitDict.twist ?? 0;
      this.pointerType = eventInitDict.pointerType ?? 'mouse';
      this.isPrimary = eventInitDict.isPrimary ?? false;
    }

    getCoalescedEvents(): PointerEvent[] {
      return [];
    }

    getPredictedEvents(): PointerEvent[] {
      return [];
    }
  } as any;

  (global as any).PointerEvent = MockPointerEvent;
}

// Add better FocusEvent support
const enhanceFocusEvents = () => {
  const originalAddEventListener = Element.prototype.addEventListener;
  Element.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    // Return early if listener is null
    if (!listener) {
      return;
    }

    // Enhance focus events for better test reliability
    if (type === 'focus' || type === 'blur') {
      const enhancedListener = (event: Event) => {
        // Ensure proper event target and bubbling
        Object.defineProperty(event, 'target', { value: this, writable: false });
        if (typeof listener === 'function') {
          listener.call(this, event);
        } else if (typeof listener.handleEvent === 'function') {
          listener.handleEvent(event);
        }
      };
      return originalAddEventListener.call(this, type, enhancedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};

enhanceFocusEvents();

// ========================================
// CSS and Animation Mocks for Radix UI
// ========================================

// Mock CSS transitions and animations for tests
const mockCSSProperties = () => {
  const mockComputedStyle = {
    getPropertyValue: jest.fn(() => ''),
    setProperty: jest.fn(),
    removeProperty: jest.fn(),
    animation: '',
    transition: '',
    transform: '',
    opacity: '1',
    display: 'block',
    visibility: 'visible',
    // Add more CSS properties that might be used
    length: 0,
    parentRule: null,
    cssFloat: '',
    cssText: '',
    item: jest.fn(() => ''),
    getPropertyPriority: jest.fn(() => ''),
  } as Partial<CSSStyleDeclaration>;

  global.getComputedStyle = jest.fn(() => mockComputedStyle as CSSStyleDeclaration);

  // Mock CSSStyleDeclaration properties that Radix UI might use
  Object.defineProperty(HTMLElement.prototype, 'style', {
    get: function () {
      return {
        ...mockComputedStyle,
        setProperty: jest.fn(),
        removeProperty: jest.fn(),
        getPropertyValue: jest.fn(() => ''),
      } as CSSStyleDeclaration;
    },
    configurable: true,
  });
};

mockCSSProperties();

// TokenManager is now mocked via Jest's moduleNameMapper and the manual mock file
// in src/__mocks__/TokenManager.js - no need for global mocking here

// Add global beforeEach to reset all mocks
beforeEach(() => {
  // Reset all mock calls but keep the implementations
  jest.clearAllMocks();

  console.log('🔄 Global beforeEach: Reset all mocks');
});
