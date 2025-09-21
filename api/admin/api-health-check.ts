import { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '../utils/validation';
import { ensureDatabaseConnectionAdmin } from '../utils/database';

interface HealthCheckResult {
  endpoint: string;
  method: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number;
  statusCode?: number;
  error?: string;
  lastChecked: string;
}

// 実際のAPIエンドポイントのヘルスチェック
const checkApiHealth = async (endpoint: string, method: string): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        // 認証が必要なエンドポイントの場合は適切なヘッダーを追加
      },
      // タイムアウト設定
      signal: AbortSignal.timeout(5000)
    });

    const responseTime = Date.now() - startTime;
    
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    
    if (response.status >= 500) {
      status = 'error';
    } else if (response.status >= 400) {
      status = 'warning';
    } else if (responseTime > 2000) {
      status = 'warning';
    }

    return {
      endpoint,
      method,
      status,
      responseTime,
      statusCode: response.status,
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // データベース接続
    await ensureDatabaseConnectionAdmin();

    // 管理者認証
    const user = await verifyJWT(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
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

    res.status(200).json({
      success: true,
      results,
      stats
    });

  } catch (error) {
    console.error('Error in API health check:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
