import axios from 'axios';
import { logger } from '../../utils/logger';

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// デプロイ先でのAPI URL自動判定
const getApiBaseUrl = () => {
  // 環境変数が設定されている場合はそれを使用
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 本番環境では現在のドメインのAPIエンドポイントを使用
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'work-time-tracker-5d9q.vercel.app') {
      return 'https://work-time-tracker-5d9q.vercel.app/api';
    }
    if (window.location.hostname !== 'localhost') {
      return `${window.location.protocol}//${window.location.hostname}/api`;
    }
  }

  // 開発環境のデフォルト
  return 'http://localhost:3001/api';
};

const baseURL = getApiBaseUrl();
console.log('🔗 API Base URL:', baseURL);

export const api = axios.create({
  baseURL,
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
    logger.error('API', `${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);
