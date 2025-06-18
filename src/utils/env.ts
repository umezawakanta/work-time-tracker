// 環境変数アクセスのヘルパー関数
export const getEnv = (key: string): string | undefined => {
  // テスト環境またはNode.js環境
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  // ブラウザ環境でViteのimport.metaが利用可能
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }

  return undefined;
};

export const getBooleanEnv = (key: string, defaultValue = false): boolean => {
  const value = getEnv(key);
  return value === 'true' || value === '1' || defaultValue;
};

export const isDev = (): boolean => {
  // テスト環境
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return true;
  }

  // Node.js環境
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return true;
  }

  // ブラウザ環境
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return true;
  }

  return false;
};

export const isProd = (): boolean => {
  // Node.js環境
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return true;
  }

  // ブラウザ環境
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) {
    return true;
  }

  return false;
};
