// APIエンドポイントの設定ファイル
// このファイルでAPIエンドポイントを一元管理し、自動発見や動的更新に対応

export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  requiresAuth?: boolean;
  isAdminOnly?: boolean;
  isCheckable?: boolean; // ヘルスチェック対象かどうか
}

// APIエンドポイントの定義
export const API_ENDPOINTS: ApiEndpoint[] = [
  // 認証関連
  { path: '/api/auth/login', method: 'POST', description: 'ユーザーログイン', requiresAuth: false, isCheckable: false },
  { path: '/api/auth/register', method: 'POST', description: 'ユーザー登録', requiresAuth: false, isCheckable: false },
  { path: '/api/auth/verify', method: 'POST', description: 'トークン検証', requiresAuth: false, isCheckable: false },
  
  // 時間管理
  { path: '/api/time/start', method: 'POST', description: '作業開始', requiresAuth: true, isCheckable: false },
  { path: '/api/time/stop', method: 'POST', description: '作業停止', requiresAuth: true, isCheckable: false },
  { path: '/api/time/entries', method: 'GET', description: '時間記録取得', requiresAuth: true, isCheckable: true },
  
  // プロジェクト管理
  { path: '/api/projects/create', method: 'POST', description: 'プロジェクト作成', requiresAuth: true, isCheckable: false },
  { path: '/api/projects/list', method: 'GET', description: 'プロジェクト一覧', requiresAuth: true, isCheckable: true },
  
  // メモ機能
  { path: '/api/memos', method: 'GET', description: 'メモ一覧取得', requiresAuth: true, isCheckable: true },
  { path: '/api/memos', method: 'POST', description: 'メモ作成', requiresAuth: true, isCheckable: false },
  { path: '/api/memos/[id]', method: 'GET', description: 'メモ詳細取得', requiresAuth: true, isCheckable: false },
  { path: '/api/memos/[id]', method: 'PUT', description: 'メモ更新', requiresAuth: true, isCheckable: false },
  { path: '/api/memos/[id]', method: 'DELETE', description: 'メモ削除', requiresAuth: true, isCheckable: false },
  { path: '/api/memos/public', method: 'GET', description: '公開メモ一覧', requiresAuth: false, isCheckable: true },
  { path: '/api/memos/count', method: 'GET', description: 'メモ数取得', requiresAuth: true, isCheckable: true },
  { path: '/api/memos/reply', method: 'POST', description: 'メモ返信', requiresAuth: true, isCheckable: false },
  { path: '/api/memos/reply/[id]', method: 'GET', description: '返信取得', requiresAuth: true, isCheckable: false },
  
  // お仕事記録
  { path: '/api/work-records/diary', method: 'GET', description: '日記一覧取得', requiresAuth: true, isCheckable: true },
  { path: '/api/work-records/diary', method: 'POST', description: '日記作成', requiresAuth: true, isCheckable: false },
  { path: '/api/work-records/diary/[id]', method: 'GET', description: '日記詳細取得', requiresAuth: true, isCheckable: false },
  { path: '/api/work-records/diary/[id]', method: 'PUT', description: '日記更新', requiresAuth: true, isCheckable: false },
  { path: '/api/work-records/diary/[id]', method: 'DELETE', description: '日記削除', requiresAuth: true, isCheckable: false },
  { path: '/api/work-records/salary', method: 'GET', description: '給与記録取得', requiresAuth: true, isCheckable: true },
  { path: '/api/work-records/salary', method: 'POST', description: '給与記録作成', requiresAuth: true, isCheckable: false },
  { path: '/api/work-records/salary/[id]', method: 'GET', description: '給与記録詳細取得', requiresAuth: true, isCheckable: false },
  { path: '/api/work-records/salary/[id]', method: 'PUT', description: '給与記録更新', requiresAuth: true, isCheckable: false },
  { path: '/api/work-records/salary/[id]', method: 'DELETE', description: '給与記録削除', requiresAuth: true, isCheckable: false },
  
  // 本棚機能
  { path: '/api/books', method: 'GET', description: '本一覧取得', requiresAuth: true, isCheckable: true },
  { path: '/api/books', method: 'POST', description: '本登録', requiresAuth: true, isCheckable: false },
  { path: '/api/books/[id]', method: 'GET', description: '本詳細取得', requiresAuth: true, isCheckable: false },
  { path: '/api/books/[id]', method: 'PUT', description: '本更新', requiresAuth: true, isCheckable: false },
  { path: '/api/books/[id]', method: 'DELETE', description: '本削除', requiresAuth: true, isCheckable: false },
  
  // レポート機能
  { path: '/api/reports/summary', method: 'GET', description: 'レポートサマリー', requiresAuth: true, isCheckable: true },
  
  // 通知機能
  { path: '/api/notifications', method: 'GET', description: '通知一覧取得', requiresAuth: true, isCheckable: true },
  { path: '/api/notifications/read', method: 'POST', description: '通知既読', requiresAuth: true, isCheckable: false },
  
  // 管理者機能
  { path: '/api/admin/users', method: 'GET', description: 'ユーザー一覧取得', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/user-edit', method: 'PUT', description: 'ユーザー編集', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/user-delete', method: 'DELETE', description: 'ユーザー削除', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/error-reports', method: 'GET', description: 'エラー報告一覧', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/linter-errors', method: 'GET', description: 'リンターエラー一覧', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/test-results', method: 'GET', description: 'テスト結果取得', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/announcements', method: 'POST', description: 'お知らせ送信', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/notifications', method: 'POST', description: '通知送信', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/api-list', method: 'GET', description: 'API一覧取得', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  { path: '/api/admin/api-health-check', method: 'POST', description: 'APIヘルスチェック', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  
  // ソースコード
  { path: '/api/source-code/[path]', method: 'GET', description: 'ソースコード取得', requiresAuth: true, isAdminOnly: true, isCheckable: false },
  
  // バージョン
  { path: '/api/version/check', method: 'GET', description: 'バージョンチェック', requiresAuth: false, isCheckable: true },
  
  // ユーザー設定
  { path: '/api/user-settings', method: 'GET', description: 'ユーザー設定取得', requiresAuth: true, isCheckable: true },
  { path: '/api/user-settings', method: 'PUT', description: 'ユーザー設定更新', requiresAuth: true, isCheckable: false }
];

// ヘルスチェック対象のエンドポイントを取得
export const getCheckableEndpoints = (): ApiEndpoint[] => {
  return API_ENDPOINTS.filter(endpoint => endpoint.isCheckable);
};

// 管理者専用エンドポイントを取得
export const getAdminEndpoints = (): ApiEndpoint[] => {
  return API_ENDPOINTS.filter(endpoint => endpoint.isAdminOnly);
};

// 認証が必要なエンドポイントを取得
export const getAuthRequiredEndpoints = (): ApiEndpoint[] => {
  return API_ENDPOINTS.filter(endpoint => endpoint.requiresAuth);
};
