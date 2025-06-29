/**
 * ユニークID生成ユーティリティ
 */

/**
 * ランダムな文字列を生成
 */
function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);

  // ブラウザ環境とNode.js環境の両方でランダム値を生成
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomValues);
  } else if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(randomValues);
  } else {
    // フォールバック（セキュリティ的には最適ではありません）
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }

  return result;
}

/**
 * UUIDv4形式の文字列を生成
 */
function generateUUIDv4(): string {
  // ブラウザとNode.js環境の両方に対応
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // フォールバック実装
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * タイムスタンプベースのユニークIDを生成
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomString(8);
  return `${timestamp}-${randomPart}`;
}

/**
 * 短いIDを生成（URLや参照用）
 */
export function generateShortId(): string {
  return randomString(8);
}

/**
 * セキュアなUUIDを生成
 */
export function generateSecureId(): string {
  return generateUUIDv4();
}

/**
 * シーケンシャルIDを生成（人間が読みやすい）
 */
let sequentialCounter = 0;
export function generateSequentialId(prefix = 'REQ'): string {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  sequentialCounter = (sequentialCounter + 1) % 10000;
  const counter = sequentialCounter.toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${counter}`;
}
