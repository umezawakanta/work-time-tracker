// VercelRequest, VercelResponse types are not needed in CommonJS
const { ensureDatabaseConnection: dbConnectHealth, verifyJWT: authVerifyHealth, handleError: errorHandlerHealth } = require('../utils/database');
const { determineHealthStatus: healthStatus, createHealthCheckController: createController, clearHealthCheckTimeout: clearHealthTimeout } = require('../utils/healthCheckUtils');
const { getCheckableEndpoints: getEndpoints } = require('../config/api-endpoints.js');

// 実際のAPIエンドポイントのヘルスチェック
const performHealthCheck = async (endpoint, method) => {
  const startTime = Date.now();
  
  // AbortControllerを使用してタイムアウトを設定
  const { controller, timeoutId } = createController();
  
  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        // 認証が必要なエンドポイントの場合は適切なヘッダーを追加
      },
      signal: controller.signal
    });

    clearHealthTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const status = healthStatus(response.status, responseTime);

    return {
      endpoint,
      method,
      status,
      responseTime,
      statusCode: response.status,
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
    clearHealthTimeout(timeoutId);
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
const limitConcurrencyHealth = async (tasks, limit = 5) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
};

// 主要なAPIエンドポイントのリストは設定ファイルから取得

/**
 * Health check response object structure:
 * @typedef {Object} HealthCheckResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Array<Object>} [results]
 * @property {string} results[].endpoint
 * @property {string} results[].method
 * @property {string} results[].status
 * @property {number} results[].responseTime
 * @property {number} [results[].statusCode]
 * @property {string} [results[].error]
 * @property {string} results[].lastChecked
 * @property {Object} [stats]
 * @property {number} stats.total
 * @property {number} stats.healthy
 * @property {number} stats.warning
 * @property {number} stats.error
 * @property {number} stats.averageResponseTime
 * @property {string} stats.lastChecked
 * @property {string} [error]
 */

module.exports = async function handler(req, res) {
  // CORS設定
  const { origin } = req.headers;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    // データベース接続
    await dbConnectHealth();

    // JWT認証
    const userInfo = await authVerifyHealth(req);
    if (!userInfo) {
      return errorHandlerHealth(res, { statusCode: 401, message: '認証が必要です' });
    }

    // 管理者権限の確認
    if (userInfo.role !== 'admin' || !userInfo.isAdmin) {
      return errorHandlerHealth(res, { statusCode: 403, message: '管理者権限が必要です' });
    }

    const { endpoints } = req.body;
    
    // チェック対象のエンドポイントを決定
    const checkEndpoints = endpoints || getEndpoints();

    // 並列実行数を制限してヘルスチェックを実行（最大5個まで同時実行）
    const healthCheckTasks = checkEndpoints.map(({ path, method }) => 
      performHealthCheck(path, method)
    );

    const results = await limitConcurrencyHealth(healthCheckTasks, 5);

    // 統計情報を計算
    const stats = {
      total: results.length,
      healthy: results.filter((r: any) => r.status === 'healthy').length,
      warning: results.filter((r: any) => r.status === 'warning').length,
      error: results.filter((r: any) => r.status === 'error').length,
      averageResponseTime: Math.round(
        results.reduce((sum: number, r: any) => sum + r.responseTime, 0) / results.length
      ),
      lastChecked: new Date().toISOString()
    };

    const response = {
      success: true,
      message: 'ヘルスチェックが完了しました',
      results,
      stats
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ API health check error:', error);
    return errorHandlerHealth(res, error, 'ヘルスチェック中にエラーが発生しました');
  }
};