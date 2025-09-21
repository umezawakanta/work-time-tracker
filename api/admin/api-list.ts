import { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '../utils/validation';
import { ensureDatabaseConnectionAdmin } from '../utils/database';

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

// モックデータ生成（実際の実装では、ログやメトリクスから取得）
const generateMockApiData = () => {
  return API_ENDPOINTS.map((endpoint, index) => {
    // ランダムなステータス生成（実際の実装では、実際のヘルスチェック結果を使用）
    const statuses = ['healthy', 'warning', 'error', 'unknown'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // ランダムなエラー数生成
    const errorCount = Math.floor(Math.random() * 10);
    
    // 成功率計算
    const successRate = Math.max(0, 100 - (errorCount * 10) - Math.floor(Math.random() * 20));
    
    // 応答時間生成
    const responseTime = Math.floor(Math.random() * 500) + 50;
    
    return {
      id: `api-${index + 1}`,
      path: endpoint.path,
      method: endpoint.method,
      description: endpoint.description,
      status: randomStatus,
      lastChecked: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(), // 過去1時間以内
      responseTime: responseTime,
      errorCount: errorCount,
      successRate: successRate,
      lastError: errorCount > 0 ? `エラー例: ${endpoint.path}で${Math.floor(Math.random() * 5) + 1}件のエラーが発生` : undefined
    };
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    // API一覧データを生成
    const apiEndpoints = generateMockApiData();

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

    res.status(200).json({
      success: true,
      endpoints: apiEndpoints,
      stats: stats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in API list endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
