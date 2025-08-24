/**
 * APIクライアント設定
 * APIクライアントのデフォルト設定を定義
 */

/**
 * APIクライアントのデフォルト設定
 */
export const ApiClientConfig = {
  /**
   * APIのベースURL
   * すべてのリクエストの前に付加される
   */
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',

  /**
   * デフォルトのリクエストタイムアウト（ミリ秒）
   */
  timeout: 30000,

  /**
   * クロスドメインリクエストでクッキーを送信するかどうか
   */
  withCredentials: false,

  /**
   * レスポンスバリデーションを行うかどうか
   */
  validateResponses: true,

  /**
   * デフォルトのヘッダー
   */
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  /**
   * リトライ設定
   */
  retry: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
    statusCodesToRetry: [408, 429, 500, 502, 503, 504],
  },

  /**
   * キャッシュ設定
   */
  cache: {
    enabled: true,
    defaultTTL: 300, // 5分
    clearOnAuth: true,
  },

  /**
   * モック設定
   */
  mock: {
    enabled: process.env.NEXT_PUBLIC_API_MOCK === 'true',
    delay: 500,
    baseURL: process.env.NEXT_PUBLIC_API_MOCK_BASE_URL || '/mocks',
  },

  /**
   * ロギング設定
   */
  logging: {
    enabled: process.env.NODE_ENV !== 'production',
    logRequests: true,
    logResponses: true,
    logErrors: true,
  },

  /**
   * 圧縮設定
   */
  compression: {
    enabled: true,
    minSize: 1024, // 1KB以上のリクエストを圧縮
  },

  /**
   * セキュリティ設定
   */
  security: {
    csrfToken: {
      enabled: true,
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf_token',
    },
    contentSecurityPolicy: true,
  },

  /**
   * パフォーマンス設定
   */
  performance: {
    trackMetrics: true,
    slowRequestThreshold: 3000, // 3秒以上かかるリクエストは遅いと判断
  },
};
