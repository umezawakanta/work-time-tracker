// VercelRequest, VercelResponse types are not needed in CommonJS
const { ensureDatabaseConnection, verifyJWT, handleError } = require('../utils/database');
const { determineHealthStatus, createHealthCheckController, clearHealthCheckTimeout } = require('../utils/healthCheckUtils');
const { API_ENDPOINTS, getCheckableEndpoints } = require('../config/api-endpoints.js');

// 時間関連の定数
const ONE_HOUR_MS = 60 * 60 * 1000; // 1時間のミリ秒
const HEALTH_CHECK_TIMEOUT_MS = 5000; // ヘルスチェックのタイムアウト（5秒）

// 実際のAPIエンドポイントのヘルスチェック
const checkApiHealth = async (endpoint, method) => {
  const startTime = Date.now();
  
  // AbortControllerを使用してタイムアウトを設定
  const { controller, timeoutId } = createHealthCheckController();
  
  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearHealthCheckTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const status = determineHealthStatus(response.status, responseTime);

    return {
      endpoint,
      method,
      status,
      responseTime,
      statusCode: response.status,
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
    clearHealthCheckTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    return {
      endpoint,
      method,
      status: 'error',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString()
    };
  }
};

// 並列実行制限用のヘルパー関数
const limitConcurrency = async (tasks, limit = 5) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
};

// 実際のメトリクスデータを取得
const getRealApiMetrics = async () => {
  try {
    // 設定ファイルからチェック可能なエンドポイントを取得
    const checkableEndpoints = getCheckableEndpoints();

    // 並列実行数を制限してヘルスチェックを実行（最大5個まで同時実行）
    const healthCheckTasks = checkableEndpoints.map(({ path, method }) => 
      checkApiHealth(path, method).catch(error => ({
        endpoint: path,
        method: method,
        status: 'error',
        responseTime: 0,
        error: error.message,
        lastChecked: new Date().toISOString()
      }))
    );

    const results = await limitConcurrency(healthCheckTasks, 5);

    // チェック結果をマップに変換（効率的な検索のため）
    const healthResultsMap = new Map();
    results.forEach(result => {
      const key = `${result.endpoint}:${result.method}`;
      healthResultsMap.set(key, result);
    });

    // 結果をAPI一覧形式に変換
    return API_ENDPOINTS.map((endpoint, index) => {
      const key = `${endpoint.path}:${endpoint.method}`;
      const healthResult = healthResultsMap.get(key);
      
      if (healthResult) {
        return {
          id: `api-${index + 1}`,
          path: endpoint.path,
          method: endpoint.method,
          description: endpoint.description,
          status: healthResult.status,
          lastChecked: healthResult.lastChecked,
          responseTime: healthResult.responseTime,
          errorCount: healthResult.status === 'error' ? 1 : 0,
          successRate: healthResult.status === 'healthy' ? 100 : healthResult.status === 'warning' ? 80 : 0,
          lastError: healthResult.error || undefined
        };
      } else {
        // チェックできなかったエンドポイントはunknownとして扱う
        return {
          id: `api-${index + 1}`,
          path: endpoint.path,
          method: endpoint.method,
          description: endpoint.description,
          status: 'unknown',
          lastChecked: new Date().toISOString(),
          responseTime: 0,
          errorCount: 0,
          successRate: 0,
          lastError: undefined
        };
      }
    });
  } catch (error) {
    console.error('[admin/api-list] Failed to get real API metrics:', error);
    // エラーが発生した場合は空の配列を返す
    return [];
  }
};

/**
 * API list response object structure:
 * @typedef {Object} ApiListResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Array<Object>} [endpoints]
 * @property {string} endpoints[].id
 * @property {string} endpoints[].path
 * @property {string} endpoints[].method
 * @property {string} endpoints[].description
 * @property {string} endpoints[].status
 * @property {string} endpoints[].lastChecked
 * @property {number} endpoints[].responseTime
 * @property {number} endpoints[].errorCount
 * @property {number} endpoints[].successRate
 * @property {string} [endpoints[].lastError]
 * @property {Object} [stats]
 * @property {number} stats.total
 * @property {number} stats.healthy
 * @property {number} stats.warning
 * @property {number} stats.error
 * @property {number} stats.unknown
 * @property {number} stats.averageResponseTime
 * @property {number} stats.totalErrors
 * @property {number} stats.averageSuccessRate
 * @property {string} [lastUpdated]
 * @property {string} [error]
 */

// CORS設定
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
};

module.exports = async (req, res) => {
  const { origin } = req.headers;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return handleError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
  }

  try {
    // データベース接続
    await ensureDatabaseConnection();

    // JWT認証
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return handleError(res, { statusCode: 401, message: '認証が必要です' });
    }

    // 管理者権限の確認
    if (userInfo.role !== 'admin' || !userInfo.isAdmin) {
      return handleError(res, { statusCode: 403, message: '管理者権限が必要です' });
    }

    // 実際のメトリクスデータを取得
    const apiEndpoints = await getRealApiMetrics();

    // 統計情報を計算
    const stats = {
      total: apiEndpoints.length,
      healthy: apiEndpoints.filter(api => api.status === 'healthy').length,
      warning: apiEndpoints.filter(api => api.status === 'warning').length,
      error: apiEndpoints.filter(api => api.status === 'error').length,
      unknown: apiEndpoints.filter(api => api.status === 'unknown').length,
      averageResponseTime: Math.round(
        apiEndpoints.reduce((sum, api) => sum + (api.responseTime || 0), 0) / apiEndpoints.length
      ),
      totalErrors: apiEndpoints.reduce((sum, api) => sum + api.errorCount, 0),
      averageSuccessRate: Math.round(
        apiEndpoints.reduce((sum, api) => sum + api.successRate, 0) / apiEndpoints.length
      )
    };

    const response = {
      success: true,
      message: 'API一覧を取得しました',
      endpoints: apiEndpoints,
      stats: stats,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ API list error:', error);
    return handleError(res, error, 'API一覧取得中にエラーが発生しました');
  }
};