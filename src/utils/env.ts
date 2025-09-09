// src/utils/env.ts
/**
 * 環境変数へのユニバーサルアクセス
 * テスト環境とブラウザ環境の両方で動作します
 */

interface ViteImportMeta {
  env: Record<string, any>;
}

declare global {
  interface Window {
    __VITE_ENV__?: Record<string, any>;
  }
}

/**
 * 環境変数を安全に取得
 */
export function getEnv(key: string): string | undefined {
  // 1) Vite runtime (browser) – safely try to read import.meta.env without parsing it in Jest
  try {
    // Use indirect eval to avoid static parsing of `import.meta` in CommonJS/Jest
    const viteEnv = (0, eval)('import.meta').env as Record<string, any> | undefined;
    if (viteEnv && typeof viteEnv[key] !== 'undefined') {
      return viteEnv[key];
    }
  } catch {
    // ignore (e.g., non-Vite or test environment)
  }

  // 2) Optional window-injected env (if your app sets it)
  if (typeof window !== 'undefined' && (window as any).__VITE_ENV__) {
    const viteEnv = (window as any).__VITE_ENV__ as Record<string, any>;
    if (typeof viteEnv[key] !== 'undefined') return viteEnv[key];
  }

  // 3) Node.js / test env – use process.env
  if (typeof process !== 'undefined' && process.env && typeof process.env[key] !== 'undefined') {
    return process.env[key];
  }

  return undefined;
}

/**
 * ブール値の環境変数を取得
 */
export function getBooleanEnv(key: string): boolean {
  const value = getEnv(key);
  return value === 'true' || value === '1';
}

/**
 * 開発環境かどうかを判定
 */
export function isDev(): boolean {
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV === 'development';
  }

  try {
    const devFlag = (0, eval)('import.meta').env?.DEV;
    return devFlag === true;
  } catch {
    // 無視
  }

  return false;
}

/**
 * テスト環境かどうかを判定
 */
export function isTest(): boolean {
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV === 'test' || Boolean(process.env.JEST_WORKER_ID);
  }

  return false;
}

/**
 * 本番環境かどうかを判定
 */
export function isProd(): boolean {
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV === 'production';
  }

  try {
    const prodFlag = (0, eval)('import.meta').env?.PROD;
    return prodFlag === true;
  } catch {
    // 無視
  }

  return false;
}

/**
 * よく使用される環境変数のヘルパー
 */
export const ENV = {
  // API Keys
  GEMINI_API_KEY: () => getEnv('VITE_GEMINI_API_KEY'),
  OPENAI_API_KEY: () => getEnv('VITE_OPENAI_API_KEY'),
  CLAUDE_API_KEY: () => getEnv('VITE_CLAUDE_API_KEY'),
  ANTHROPIC_API_KEY: () => getEnv('VITE_ANTHROPIC_API_KEY'),

  // Firebase
  FIREBASE_API_KEY: () => getEnv('VITE_FIREBASE_API_KEY'),
  FIREBASE_AUTH_DOMAIN: () => getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  FIREBASE_PROJECT_ID: () => getEnv('VITE_FIREBASE_PROJECT_ID'),
  FIREBASE_STORAGE_BUCKET: () => getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  FIREBASE_MESSAGING_SENDER_ID: () => getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  FIREBASE_APP_ID: () => getEnv('VITE_FIREBASE_APP_ID'),

  // API URLs
  API_BASE_URL: () => getEnv('VITE_API_BASE_URL'),
  APP_URL: () => getEnv('VITE_APP_URL'),

  // Stripe
  STRIPE_PUBLISHABLE_KEY: () => getEnv('VITE_STRIPE_PUBLISHABLE_KEY'),

  // GitHub
  GITHUB_TOKEN: () => getEnv('VITE_GITHUB_TOKEN'),

  // Web Push
  VAPID_PUBLIC_KEY: () => getEnv('VITE_VAPID_PUBLIC_KEY'),
  VAPID_PRIVATE_KEY: () => getEnv('VITE_VAPID_PRIVATE_KEY'),

  // Flags
  USE_MOCK_DATA: () => getEnv('VITE_USE_MOCK_DATA') === 'true',
  ENABLE_ANALYTICS: () => getEnv('VITE_ENABLE_ANALYTICS') === 'true',
  DEBUG: () => getEnv('VITE_DEBUG') === 'true',
  DOPAMINE_GUARD: () => getEnv('VITE_DOPAMINE_GUARD') === 'true',

  // Environment checks
  isDev,
  isTest,
  isProd,
};

export default ENV;
