// VercelRequest, VercelResponse types are not needed in CommonJS
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { determineHealthStatus, createHealthCheckController, clearHealthCheckTimeout } = require('../utils/healthCheckUtils');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[admin/api-list] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[admin/api-list] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// APIエンドポイントの定義
const API_ENDPOINTS = [
  // 認証関連
  { path: '/api/auth/login', method: 'POST', description: 'ユーザーログイン' },
  { path: '/api/auth/register', method: 'POST', description: 'ユーザー登録' },
  { path: '/api/auth/verify', method: 'POST', description: 'トークン検証' },
  
  // 時間管理
  { path: '/api/time/start', method: 'POST', description: '作業開始' },
  { path: '/api/time/stop', method: 'POST', description: '作業停止' },
  { path: '/api/time/entries', method: 'GET', description: '時間記録取得' },
  
  // プロジェクト管理
  { path: '/api/projects/create', method: 'POST', description: 'プロジェクト作成' },
  { path: '/api/projects/list', method: 'GET', description: 'プロジェクト一覧' },
  
  // メモ機能
  { path: '/api/memos', method: 'GET', description: 'メモ一覧取得' },
  { path: '/api/memos', method: 'POST', description: 'メモ作成' },
  { path: '/api/memos/[id]', method: 'GET', description: 'メモ詳細取得' },
  { path: '/api/memos/[id]', method: 'PUT', description: 'メモ更新' },
  { path: '/api/memos/[id]', method: 'DELETE', description: 'メモ削除' },
  { path: '/api/memos/public', method: 'GET', description: '公開メモ一覧' },
  { path: '/api/memos/count', method: 'GET', description: 'メモ数取得' },
  { path: '/api/memos/reply', method: 'POST', description: 'メモ返信' },
  { path: '/api/memos/reply/[id]', method: 'GET', description: '返信取得' },
  
  // お仕事記録
  { path: '/api/work-records/diary', method: 'GET', description: '日記一覧取得' },
  { path: '/api/work-records/diary', method: 'POST', description: '日記作成' },
  { path: '/api/work-records/diary/[id]', method: 'GET', description: '日記詳細取得' },
  { path: '/api/work-records/diary/[id]', method: 'PUT', description: '日記更新' },
  { path: '/api/work-records/diary/[id]', method: 'DELETE', description: '日記削除' },
  { path: '/api/work-records/salary', method: 'GET', description: '給与記録取得' },
  { path: '/api/work-records/salary', method: 'POST', description: '給与記録作成' },
  { path: '/api/work-records/salary/[id]', method: 'GET', description: '給与記録詳細取得' },
  { path: '/api/work-records/salary/[id]', method: 'PUT', description: '給与記録更新' },
  { path: '/api/work-records/salary/[id]', method: 'DELETE', description: '給与記録削除' },
  
  // 本棚機能
  { path: '/api/books', method: 'GET', description: '本一覧取得' },
  { path: '/api/books', method: 'POST', description: '本登録' },
  { path: '/api/books/[id]', method: 'GET', description: '本詳細取得' },
  { path: '/api/books/[id]', method: 'PUT', description: '本更新' },
  { path: '/api/books/[id]', method: 'DELETE', description: '本削除' },
  
  // レポート機能
  { path: '/api/reports/summary', method: 'GET', description: 'レポートサマリー' },
  
  // 通知機能
  { path: '/api/notifications', method: 'GET', description: '通知一覧取得' },
  { path: '/api/notifications/read', method: 'POST', description: '通知既読' },
  
  // 管理者機能
  { path: '/api/admin/users', method: 'GET', description: 'ユーザー一覧取得' },
  { path: '/api/admin/user-edit', method: 'PUT', description: 'ユーザー編集' },
  { path: '/api/admin/user-delete', method: 'DELETE', description: 'ユーザー削除' },
  { path: '/api/admin/error-reports', method: 'GET', description: 'エラー報告一覧' },
  { path: '/api/admin/linter-errors', method: 'GET', description: 'リンターエラー一覧' },
  { path: '/api/admin/test-results', method: 'GET', description: 'テスト結果取得' },
  { path: '/api/admin/announcements', method: 'POST', description: 'お知らせ送信' },
  { path: '/api/admin/notifications', method: 'POST', description: '通知送信' },
  
  // ソースコード
  { path: '/api/source-code/[path]', method: 'GET', description: 'ソースコード取得' },
  
  // バージョン
  { path: '/api/version/check', method: 'GET', description: 'バージョンチェック' },
  
  // ユーザー設定
  { path: '/api/user-settings', method: 'GET', description: 'ユーザー設定取得' },
  { path: '/api/user-settings', method: 'PUT', description: 'ユーザー設定更新' }
];

// 時間関連の定数
const ONE_HOUR_MS = 60 * 60 * 1000; // 1時間のミリ秒
const HEALTH_CHECK_TIMEOUT_MS = 5000; // ヘルスチェックのタイムアウト（5秒）

// 実際のAPIエンドポイントのヘルスチェック
const checkApiHealth = async (endpoint, method) => {
  const startTime = Date.now();
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL environment variable is required but not set.");
  }
  
  // AbortControllerを使用してタイムアウトを設定
  const { controller, timeoutId } = createHealthCheckController();
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
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

// 実際のメトリクスデータを取得
const getRealApiMetrics = async () => {
  try {
    // 主要なAPIエンドポイントのみをチェック（認証が必要なエンドポイントは除外）
    const checkableEndpoints = API_ENDPOINTS.filter(endpoint => {
      // 管理者専用エンドポイントは除外
      if (endpoint.path.includes('/admin/')) {
        return false;
      }
      
      // 認証が必要なエンドポイントは除外
      if (endpoint.path.includes('/auth/')) {
        return false;
      }
      
      // チェック可能なエンドポイントを明示的に指定
      const checkablePaths = [
        '/api/time/entries',
        '/api/projects/list',
        '/api/memos',
        '/api/memos/public',
        '/api/memos/count',
        '/api/work-records/diary',
        '/api/work-records/salary',
        '/api/books',
        '/api/reports/summary',
        '/api/notifications',
        '/api/version/check',
        '/api/user-settings'
      ];
      
      return checkablePaths.includes(endpoint.path);
    });

    // 並列でヘルスチェックを実行
    const healthCheckPromises = checkableEndpoints.map(({ path, method }) => 
      checkApiHealth(path, method).catch(error => ({
        endpoint: path,
        method: method,
        status: 'error',
        responseTime: 0,
        error: error.message,
        lastChecked: new Date().toISOString()
      }))
    );

    const results = await Promise.all(healthCheckPromises);

  // 結果をAPI一覧形式に変換
  return API_ENDPOINTS.map((endpoint, index) => {
    const healthResult = results.find(r => r.endpoint === endpoint.path && r.method === endpoint.method);
    
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

module.exports = async function handler(req, res) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    // データベース接続
    await ensureDatabaseConnection();

    // 管理者認証
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      });
    }

    // JWTトークンを検証してユーザー情報を取得
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    let userInfo;
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, jwtSecret);
      userInfo = decoded;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '無効な認証トークンです',
        error: 'Invalid authentication token',
      });
    }

    // 管理者権限の確認
    if (userInfo.role !== 'admin' || !userInfo.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '管理者権限が必要です',
        error: 'Admin privileges required',
      });
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

    res.status(500).json({
      success: false,
      message: 'API一覧取得中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    });
  }
};