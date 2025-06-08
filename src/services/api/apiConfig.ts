import axios from 'axios';
import { logger } from '../../utils/logger';

// Extend Window interface for custom properties
declare global {
  interface Window {
    __VITE_USE_MOCK_DATA__?: string;
    __API_CONNECTION_FAILED__?: boolean;
  }
}

export const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  (typeof window !== 'undefined' && window.__VITE_USE_MOCK_DATA__ === 'true') ||
  // 本番環境でAPIが存在しない場合は自動的にモックモードを有効化
  (typeof window !== 'undefined' &&
    window.location.hostname === 'work-time-tracker-5d9q.vercel.app' &&
    !import.meta.env.VITE_API_BASE_URL?.includes('herokuapp') &&
    !import.meta.env.VITE_API_BASE_URL?.includes('railway') &&
    !import.meta.env.VITE_API_BASE_URL?.includes('render'));

// デプロイ先でのAPI URL自動判定
const getApiBaseUrl = () => {
  // 環境変数が設定されている場合はそれを使用
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 本番環境では実際のAPIサーバーに接続を試行
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'work-time-tracker-5d9q.vercel.app') {
      // 本番環境のAPIエンドポイント
      console.log('🌐 本番環境: APIサーバーに接続を試行します');
      return 'https://work-time-tracker-5d9q.vercel.app/api';
    }
    if (window.location.hostname !== 'localhost') {
      return `${window.location.protocol}//${window.location.hostname}/api`;
    }
  }

  // 開発環境のデフォルト
  return 'http://localhost:3002/api';
};

const baseURL = getApiBaseUrl();
console.log('🔗 API Base URL:', baseURL);

// 本番環境での健全性チェック
if (
  typeof window !== 'undefined' &&
  window.location.hostname === 'work-time-tracker-5d9q.vercel.app'
) {
  console.log('🏥 本番環境健全性チェック開始...');
  fetch(baseURL + '/health', { method: 'GET' })
    .then((response) => {
      if (response.ok) {
        console.log('✅ 本番API正常動作確認');
      } else {
        console.warn('⚠️ 本番APIレスポンス異常:', response.status);
      }
    })
    .catch((error) => {
      console.error('❌ 本番API接続失敗:', error.message);
    });
}

export const api = axios.create({
  baseURL,
  timeout: 30000, // 30秒タイムアウト（本番環境対応）
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 管理者APIの場合は特別なヘッダーを追加
    if (config.url?.includes('/admin/')) {
      config.headers['X-Admin-Request'] = 'true';
    }

    // 重複API呼び出しのログを抑制
    const suppressLog = config.url?.includes('/auth/') || config.url?.includes('/notifications/');

    if (!suppressLog) {
      logger.debug('API', `${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    logger.error('API', 'Request error', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    const suppressLog =
      response.config.url?.includes('/auth/') || response.config.url?.includes('/notifications/');

    if (!suppressLog) {
      logger.debug('API', `${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // サーバー接続エラーの詳細情報をログに出力
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || !error.response) {
      console.warn('⚠️ Server connection failed:', {
        baseURL,
        code: error.code,
        message: error.message,
        url: error.config?.url,
      });

      // 本番環境でAPIサーバーに接続できない場合の案内
      if (window.location.hostname === 'work-time-tracker-5d9q.vercel.app') {
        console.warn(
          '💡 本番環境: APIサーバーに接続できません。デモモードの利用を検討してください。'
        );
        // グローバルフラグを設定してフロントエンドでモック利用可能にする
        window.__API_CONNECTION_FAILED__ = true;
      }

      // 開発環境でのサーバー未起動を通知
      if (baseURL.includes('localhost:3002') && import.meta.env.DEV) {
        console.warn(
          '💡 Hint: Make sure your development server is running on http://localhost:3002'
        );
      }
    } else {
      logger.error('API', `${error.response?.status} ${error.config?.url}`, error.response?.data);
    }
    return Promise.reject(error);
  }
);
