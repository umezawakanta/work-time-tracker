/**
 * ログユーティリティ
 * デバッグモードと通常モードで異なるログ形式を提供
 */

/**
 * 構造化ログデータを作成
 * @param {string} level - ログレベル (info, warn, error, debug)
 * @param {string} component - コンポーネント名
 * @param {string} message - メッセージ
 * @param {Object} metadata - 追加のメタデータ
 * @returns {Object} 構造化されたログデータ
 */
const createLogData = (level, component, message, metadata = {}) => {
  return {
    level,
    component,
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  };
};

/**
 * ログを出力する
 * @param {string} level - ログレベル
 * @param {string} component - コンポーネント名
 * @param {string} message - メッセージ
 * @param {Object} metadata - 追加のメタデータ
 */
const log = (level, component, message, metadata = {}) => {
  const isDebugMode = process.env.DEBUG === 'true';
  
  if (isDebugMode) {
    // デバッグモード: 構造化ログ
    const logData = createLogData(level, component, message, metadata);
    console[level](JSON.stringify(logData));
  } else {
    // 通常モード: 簡易ログ
    const metadataStr = Object.keys(metadata).length > 0 
      ? ` (${Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join(', ')})`
      : '';
    console[level](`[${component}] ${message}${metadataStr}`);
  }
};

/**
 * 情報ログ
 * @param {string} component - コンポーネント名
 * @param {string} message - メッセージ
 * @param {Object} metadata - 追加のメタデータ
 */
const info = (component, message, metadata = {}) => {
  log('info', component, message, metadata);
};

/**
 * 警告ログ
 * @param {string} component - コンポーネント名
 * @param {string} message - メッセージ
 * @param {Object} metadata - 追加のメタデータ
 */
const warn = (component, message, metadata = {}) => {
  log('warn', component, message, metadata);
};

/**
 * エラーログ
 * @param {string} component - コンポーネント名
 * @param {string} message - メッセージ
 * @param {Object} metadata - 追加のメタデータ
 */
const error = (component, message, metadata = {}) => {
  log('error', component, message, metadata);
};

/**
 * デバッグログ
 * @param {string} component - コンポーネント名
 * @param {string} message - メッセージ
 * @param {Object} metadata - 追加のメタデータ
 */
const debug = (component, message, metadata = {}) => {
  log('debug', component, message, metadata);
};

module.exports = {
  createLogData,
  log,
  info,
  warn,
  error,
  debug
};
