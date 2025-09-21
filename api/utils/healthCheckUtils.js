// ヘルスチェック関連の定数とユーティリティ関数

// レスポンス時間の閾値（ミリ秒）
const RESPONSE_TIME_WARNING_THRESHOLD = 2000; // 2秒
const RESPONSE_TIME_ERROR_THRESHOLD = 5000; // 5秒

// ヘルスチェックのタイムアウト（ミリ秒）
const HEALTH_CHECK_TIMEOUT_MS = 5000; // 5秒

/**
 * レスポンスステータスとレスポンス時間に基づいてヘルスステータスを判定
 * @param {number} statusCode - HTTPステータスコード
 * @param {number} responseTime - レスポンス時間（ミリ秒）
 * @returns {string} 'healthy' | 'warning' | 'error'
 */
const determineHealthStatus = (statusCode, responseTime) => {
  // サーバーエラー（5xx）
  if (statusCode >= 500) {
    return 'error';
  }
  
  // クライアントエラー（4xx）
  if (statusCode >= 400) {
    return 'warning';
  }
  
  // レスポンス時間が非常に長い場合（エラー）
  if (responseTime > RESPONSE_TIME_ERROR_THRESHOLD) {
    return 'error';
  }
  
  // レスポンス時間が長い場合（警告）
  if (responseTime > RESPONSE_TIME_WARNING_THRESHOLD) {
    return 'warning';
  }
  
  // 正常
  return 'healthy';
};

/**
 * ヘルスチェック用のAbortControllerを作成
 * @returns {Object} { controller, timeoutId }
 */
const createHealthCheckController = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);
  
  return { controller, timeoutId };
};

/**
 * ヘルスチェックのタイムアウトをクリア
 * @param {number} timeoutId - タイムアウトID
 */
const clearHealthCheckTimeout = (timeoutId) => {
  clearTimeout(timeoutId);
};

module.exports = {
  RESPONSE_TIME_WARNING_THRESHOLD,
  RESPONSE_TIME_ERROR_THRESHOLD,
  HEALTH_CHECK_TIMEOUT_MS,
  determineHealthStatus,
  createHealthCheckController,
  clearHealthCheckTimeout
};
