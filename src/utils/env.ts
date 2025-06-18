// 環境変数アクセスのヘルパー関数
export const getEnv = (key: string): string | undefined => {
  // テスト環境またはNode.js環境
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  // ブラウザ環境でViteのimport.metaが利用可能（Jest環境では無効）
  try {
    if (typeof window !== 'undefined' && 'import' in globalThis) {
      const importMeta = (globalThis as any).import?.meta;
      if (importMeta?.env) {
        return importMeta.env[key];
      }
    }
  } catch (error) {
    // Jest環境などでimport.metaが利用できない場合は無視
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

  // ブラウザ環境（Jest環境でのエラーを回避）
  try {
    if (typeof window !== 'undefined' && 'import' in globalThis) {
      const importMeta = (globalThis as any).import?.meta;
      if (importMeta?.env?.DEV) {
        return true;
      }
    }
  } catch (error) {
    // Jest環境などでimport.metaが利用できない場合は無視
  }

  return false;
};

export const isProd = (): boolean => {
  // Node.js環境
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return true;
  }

  // ブラウザ環境（Jest環境でのエラーを回避）
  try {
    if (typeof window !== 'undefined' && 'import' in globalThis) {
      const importMeta = (globalThis as any).import?.meta;
      if (importMeta?.env?.PROD) {
        return true;
      }
    }
  } catch (error) {
    // Jest環境などでimport.metaが利用できない場合は無視
  }

  return false;
};
