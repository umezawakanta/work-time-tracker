/**
 * 認証システムテスト専用セットアップファイル（修正版）
 *
 * このファイルは認証関連テストの共通設定を提供します。
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

// グローバルポリフィル
Object.assign(global, {
  TextEncoder,
  TextDecoder,
});

// Firebase モックの共通設定
export const mockFirebaseAuth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

export const mockFirestore = {
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
};

// API モックの共通設定
export const mockApiConfig = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

// ローカルストレージのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// セッションストレージのモック
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// location のモック（型安全な方法）
const mockLocation = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// ヘルパー関数: location を本番環境用に設定
export const setProductionLocation = () => {
  Object.defineProperty(window, 'location', {
    value: {
      ...mockLocation,
      href: 'https://example.com',
      origin: 'https://example.com',
      protocol: 'https:',
      host: 'example.com',
      hostname: 'example.com',
      port: '',
    },
    writable: true,
  });
};

// ヘルパー関数: location を開発環境用に設定
export const setDevelopmentLocation = () => {
  Object.defineProperty(window, 'location', {
    value: {
      ...mockLocation,
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
    },
    writable: true,
  });
};

// ヘルパー関数: location をリセット
export const resetLocation = () => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });
};

// 環境変数のモック
export const mockEnvironmentVariables = {
  setDevelopment: () => {
    process.env.NODE_ENV = 'development';
  },
  setProduction: () => {
    process.env.NODE_ENV = 'production';
  },
  setTest: () => {
    process.env.NODE_ENV = 'test';
  },
  reset: () => {
    process.env.NODE_ENV = 'test';
  },
};

// カスタムイベントのモック
export const mockCustomEvents = {
  dispatchTokenExpired: () => {
    window.dispatchEvent(new CustomEvent('auth:token-expired'));
  },
  dispatchAuthSuccess: () => {
    window.dispatchEvent(new CustomEvent('auth:success'));
  },
  dispatchAuthFailure: () => {
    window.dispatchEvent(new CustomEvent('auth:failure'));
  },
};

// フェッチAPIのモック
global.fetch = jest.fn();

// Intersection Observer のモック
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// ResizeObserver のモック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// テスト実行前の共通セットアップ
export const setupAuthTest = () => {
  // localStorage をクリア
  localStorageMock.clear();
  sessionStorageMock.clear();

  // モックをリセット
  jest.clearAllMocks();

  // 環境変数をテスト用に設定
  mockEnvironmentVariables.setTest();

  // location をデフォルトに設定
  resetLocation();
};

// テスト実行後のクリーンアップ
export const cleanupAuthTest = () => {
  // 全てのモックをクリア
  jest.clearAllMocks();

  // タイマーをクリア
  jest.clearAllTimers();

  // 環境変数をリセット
  mockEnvironmentVariables.reset();

  // location をリセット
  resetLocation();
};

// Jest の beforeEach/afterEach で使用するヘルパー
export const authTestHelpers = {
  beforeEach: setupAuthTest,
  afterEach: cleanupAuthTest,
};

// TypeScript 型定義の拡張
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAuthenticated(): R;
      toHaveValidToken(): R;
    }
  }
}

// カスタムマッチャーの追加
expect.extend({
  toBeAuthenticated(received) {
    const pass = received && typeof received === 'object' && received.isAuthenticated === true;
    if (pass) {
      return {
        message: () => `expected ${received} not to be authenticated`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be authenticated`,
        pass: false,
      };
    }
  },

  toHaveValidToken(received) {
    const pass = received && typeof received === 'string' && received.length > 0;
    if (pass) {
      return {
        message: () => `expected ${received} not to have a valid token`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have a valid token`,
        pass: false,
      };
    }
  },
});

// デバッグ用ヘルパー
export const debugAuthState = (component: any) => {
  console.log('🐛 Current Auth State:', {
    isAuthenticated: component.isAuthenticated,
    user: component.user,
    loading: component.loading,
    token: localStorage.getItem('accessToken') ? 'present' : 'missing',
  });
};

// テストデータファクトリー
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  _id: 'test-user-id',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  isAdmin: false,
  avatar: '',
  ...overrides,
});

export const createMockToken = (overrides = {}) => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 3600000, // 1時間後
  ...overrides,
});

export const createMockSessionInfo = (overrides = {}) => ({
  isAuthenticated: true,
  expiresAt: new Date(Date.now() + 3600000),
  refreshExpiresAt: new Date(Date.now() + 604800000),
  timeUntilExpiry: 3600,
  timeUntilRefreshExpiry: 604800,
  ...overrides,
});

// Add a test to satisfy Jest requirement
describe('Auth Test Setup', () => {
  it('should provide test utilities', () => {
    expect(mockFirebaseAuth).toBeDefined();
    expect(mockFirestore).toBeDefined();
    expect(mockApiConfig).toBeDefined();
    expect(createMockUser).toBeDefined();
    expect(createMockToken).toBeDefined();
    expect(createMockSessionInfo).toBeDefined();
  });
});
