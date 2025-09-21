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
  console.warn('[admin/api-health-check] Database not connected, attempting to connect...');
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
    console.error('[admin/api-health-check] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

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
        // 認証が必要なエンドポイントの場合は適切なヘッダーを追加
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

// 主要なAPIエンドポイントのリスト
const MAIN_API_ENDPOINTS = [
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/register', method: 'POST' },
  { path: '/api/time/entries', method: 'GET' },
  { path: '/api/projects/list', method: 'GET' },
  { path: '/api/memos', method: 'GET' },
  { path: '/api/work-records/diary', method: 'GET' },
  { path: '/api/work-records/salary', method: 'GET' },
  { path: '/api/books', method: 'GET' },
  { path: '/api/reports/summary', method: 'GET' },
  { path: '/api/notifications', method: 'GET' },
  { path: '/api/version/check', method: 'GET' },
  { path: '/api/user-settings', method: 'GET' }
];

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
  const origin = req.headers.origin;
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

    const { endpoints } = req.body;
    
    // チェック対象のエンドポイントを決定
    const checkEndpoints = endpoints || MAIN_API_ENDPOINTS;

    // 並列でヘルスチェックを実行
    const healthCheckPromises = checkEndpoints.map(({ path, method }) => 
      checkApiHealth(path, method)
    );

    const results = await Promise.all(healthCheckPromises);

    // 統計情報を計算
    const stats = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      warning: results.filter(r => r.status === 'warning').length,
      error: results.filter(r => r.status === 'error').length,
      averageResponseTime: Math.round(
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
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

    res.status(500).json({
      success: false,
      message: 'ヘルスチェック中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    });
  }
};