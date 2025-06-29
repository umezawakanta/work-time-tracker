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
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
};

// 認証テスト用のモックユーザーデータ
export const mockAuthUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  metadata: {
    creationTime: '2023-01-01T00:00:00.000Z',
    lastSignInTime: '2023-01-01T00:00:00.000Z',
  },
};

export const mockUserDocument = {
  exists: () => true,
  data: () => ({
    isPremium: false,
    subscriptionStatus: 'free',
    createdAt: { toDate: () => new Date('2023-01-01') },
    lastLoginAt: { toDate: () => new Date('2023-01-01') },
    preferences: {
      theme: 'system',
      language: 'ja',
      timezone: 'Asia/Tokyo',
      notifications: {
        email: true,
        push: true,
        daily: true,
        weekly: true,
      },
    },
  }),
};

// API レスポンスのモック
export const mockLoginResponse = {
  accessToken: 'mock-access-token-123',
  refreshToken: 'mock-refresh-token-456',
  user: {
    id: 'user-123',
    _id: 'user-123',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
    avatar: '',
  },
  message: 'ログイン成功',
  expiresIn: 3600,
  refreshExpiresIn: 604800,
};

// 環境変数のモック設定
export const setupTestEnvironment = (env: 'development' | 'production' = 'production') => {
  const originalEnv = process.env.NODE_ENV;
  const originalLocation = window.location;

  process.env.NODE_ENV = env;

  if (env === 'production') {
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      hostname: 'myapp.vercel.app',
      origin: 'https://myapp.vercel.app',
    } as Location;
  } else {
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      hostname: 'localhost',
      origin: 'http://localhost:3000',
    } as Location;
  }

  return () => {
    process.env.NODE_ENV = originalEnv;
    window.location = originalLocation;
  };
};

// トークンマネージャー用のモック設定
export const mockTokenManagerApi = {
  get: jest.fn(),
  post: jest.fn(),
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

// Fetch API のモック
export const setupFetchMock = () => {
  global.fetch = jest.fn();

  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });

  return global.fetch as jest.Mock;
};

// Web API のモック設定
export const setupWebApiMocks = () => {
  // Crypto API
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: jest.fn(() => 'test-uuid-1234-5678-9012'),
      getRandomValues: jest.fn((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
    },
    writable: true,
  });

  // Local Storage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
    writable: true,
  });

  return { localStorage: localStorageMock, sessionStorage: localStorageMock };
};

// タイマーのモック設定
export const setupTimerMocks = () => {
  jest.useFakeTimers();

  return {
    advanceTimers: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    cleanup: () => jest.useRealTimers(),
  };
};

// 認証エラーのモックデータ
export const mockAuthErrors = {
  emailExists: { code: 'auth/email-already-in-use' },
  userNotFound: { code: 'auth/user-not-found' },
  wrongPassword: { code: 'auth/wrong-password' },
  weakPassword: { code: 'auth/weak-password' },
  invalidEmail: { code: 'auth/invalid-email' },
  tooManyRequests: { code: 'auth/too-many-requests' },
  userDisabled: { code: 'auth/user-disabled' },
  operationNotAllowed: { code: 'auth/operation-not-allowed' },
  popupClosed: { code: 'auth/popup-closed-by-user' },
  unknown: { code: 'auth/unknown-error', message: 'Unknown error occurred' },
};

// ネットワークエラーのモック
export const mockNetworkErrors = {
  timeout: new Error('Request timeout'),
  networkError: new Error('Network Error'),
  serverError: {
    response: {
      status: 500,
      data: { message: 'Internal Server Error' },
    },
  },
  unauthorized: {
    response: {
      status: 401,
      data: { message: 'Unauthorized' },
    },
  },
  rateLimited: {
    response: {
      status: 429,
      data: { message: 'Too Many Requests' },
    },
  },
};

// テスト用のユーティリティ関数
export const createMockPromise = <T>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
};

// テスト後のクリーンアップ
export const cleanup = () => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();

  // イベントリスナーのクリーンアップ
  try {
    window.removeEventListener('auth:token-expired', () => {});
    window.removeEventListener('beforeunload', () => {});
  } catch (e) {
    // エラーを無視
  }
};

// デフォルトのセットアップ実行
beforeEach(() => {
  setupWebApiMocks();
  setupFetchMock();
});

afterEach(() => {
  cleanup();
});

// テスト環境の検証（安全バージョン）
export const validateTestEnvironment = () => {
  const checks = [
    { name: 'TextEncoder', value: global.TextEncoder },
    { name: 'fetch', value: global.fetch },
    { name: 'localStorage', value: window.localStorage },
  ];

  const missing = checks.filter((check) => !check.value);

  if (missing.length > 0) {
    console.warn(
      '⚠️ Missing test environment features:',
      missing.map((m) => m.name)
    );
  } else {
    console.log('✅ Test environment validation passed');
  }
};

// 初期化時に検証を実行（エラーを投げない）
try {
  validateTestEnvironment();
} catch (error) {
  console.warn('⚠️ Test environment validation failed:', error);
}
