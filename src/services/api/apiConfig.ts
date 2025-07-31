import axios from 'axios';
import { logger } from '../../utils/logger';
import { fetchTokenFromDB } from './tokenService';
import { getEnv, getBooleanEnv, isDev, isProd } from '../../utils/env';

// Extend Window interface for custom properties
declare global {
  interface Window {
    __VITE_USE_MOCK_DATA__?: string;
    __API_CONNECTION_FAILED__?: boolean;
  }
}

export const USE_MOCK_DATA =
  getBooleanEnv('VITE_USE_MOCK_DATA') ||
  (typeof window !== 'undefined' && window.__VITE_USE_MOCK_DATA__ === 'true') ||
  // Mock data only enabled with explicit flag - allow real API in development
  false;

// デバッグ情報をログ出力
console.log('🔧 Determining API Configuration...');
console.log('📋 Environment:', {
  NODE_ENV: getEnv('NODE_ENV'),
  DEV: isDev(),
  PROD: isProd(),
  VITE_USE_MOCK_DATA: getEnv('VITE_USE_MOCK_DATA'),
  USE_MOCK_DATA: USE_MOCK_DATA,
});

if (USE_MOCK_DATA) {
  console.log(
    '🎭 モックデータモード有効: APIサーバーへの接続は行わず、ローカルのモックデータを使用します'
  );
  console.log('✅ 401エラーは発生しません');
} else {
  console.log('🌐 API接続モード有効: 実際のAPIサーバーに接続します');
}

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
console.log('🌐 Current hostname:', hostname);

let baseURL: string;

if (hostname === 'work-time-tracker-5d9q.vercel.app') {
  baseURL = 'https://work-time-tracker-5d9q.vercel.app/api';
  console.log('🚀 Production: Using production API server:', baseURL);
} else if (hostname.match(/^work-time-tracker-5d9q-.*\.vercel\.app$/)) {
  baseURL = 'https://work-time-tracker-5d9q.vercel.app/api';
  console.log('🔧 Preview: Using production API server:', baseURL);
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // ローカル開発環境
  const viteApiUrl = getEnv('VITE_API_BASE_URL');
  if (viteApiUrl?.includes('vercel.app') || viteApiUrl?.includes('railway.app')) {
    baseURL = viteApiUrl;
    console.log('🛰️ Development: Using remote API server:', baseURL);
  } else {
    baseURL = 'http://localhost:3001/api';
    if (isDev()) {
      console.log('🛠️ Development: Using local dev server');
      if (viteApiUrl) {
        console.log('💡 Note: Ignoring VITE_API_BASE_URL for localhost development');
      }
    }
  }
} else {
  baseURL = `${window.location.protocol}//${window.location.hostname}/api`;
  console.log('🔧 Fallback: Dynamic API URL:', baseURL);
}

console.log('🔗 Final API Base URL:', baseURL);

// 本番環境での健全性チェック
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'work-time-tracker-5d9q.vercel.app' ||
    window.location.hostname.match(/^work-time-tracker-5d9q-.*\.vercel\.app$/))
) {
  const envType =
    window.location.hostname === 'work-time-tracker-5d9q.vercel.app'
      ? '本番環境'
      : 'プレビュー環境';
  console.log(`🏥 ${envType}健全性チェック開始...`);

  // 健全性チェックを遅延実行（DOM読み込み後）
  setTimeout(() => {
    fetch(baseURL + '/health', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            console.log(`✅ ${envType}API正常動作確認:`, data);
          });
        } else {
          console.warn(`⚠️ ${envType}APIレスポンス異常:`, response.status);
        }
      })
      .catch((error) => {
        console.error(`❌ ${envType}API接続失敗:`, error.message);
        console.log('💡 API Routes が正常に設定されているか確認してください');
      });
  }, 1000);
}

export const api = axios.create({
  baseURL,
  timeout: 30000, // 30秒タイムアウト（本番環境対応）
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenCache: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

api.interceptors.request.use(
  async (config) => {
    // 開発環境では本番でのトークン機能を無効化
    if (getEnv('NODE_ENV') === 'development' || getEnv('NODE_ENV') === 'test') {
      console.log('🚫 Development/Test: Token authentication disabled');
      return config;
    }

    // /auth/token エンドポイントへのリクエストではトークンを追加しない（無限ループ防止）
    if (config.url?.includes('/auth/token')) {
      return config;
    }

    // 開発モードではトークン取得をスキップ
    if (process.env.NODE_ENV === 'development') {
      // 開発モードではトークンなしで続行
      return config;
    }

    // トークンがキャッシュされていなければAPIから取得（重複リクエスト防止）
    if (!tokenCache && !tokenFetchPromise) {
      tokenFetchPromise = fetchTokenFromDB().finally(() => {
        tokenFetchPromise = null;
      });

      try {
        tokenCache = await tokenFetchPromise;
      } catch (error) {
        console.warn('Token fetch failed in interceptor:', error);
        // トークン取得に失敗してもリクエストを続行
      }
    } else if (tokenFetchPromise) {
      // 既にトークン取得中の場合は待機
      try {
        tokenCache = await tokenFetchPromise;
      } catch (error) {
        console.warn('Token fetch failed while waiting:', error);
      }
    }

    // トークンがあればヘッダーに追加
    if (tokenCache) {
      config.headers.Authorization = `Bearer ${tokenCache}`;
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
    // 本番環境でのデータ形式統一
    if (response.config.url?.includes('/books') && response.config.method === 'get') {
      // レスポンスが配列でない場合の対応
      if (response.data && !Array.isArray(response.data)) {
        if (response.data.books) {
          response.data = response.data.books;
        } else if (response.data.data) {
          response.data = response.data.data;
        }
      }
    }
    const suppressLog =
      response.config.url?.includes('/auth/') || response.config.url?.includes('/notifications/');

    if (!suppressLog) {
      logger.debug('API', `${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // 認証エラーの場合はトークンキャッシュをクリア
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Authentication error detected, clearing token cache');
      tokenCache = null;
      tokenFetchPromise = null;
    }

    // サーバー接続エラーの詳細情報をログに出力
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || !error.response) {
      console.warn('⚠️ Server connection failed:', {
        baseURL,
        code: error.code,
        message: error.message,
        url: error.config?.url,
      });

      // 本番環境でAPIサーバーに接続できない場合の案内
      if (
        typeof window !== 'undefined' &&
        window.location.hostname === 'work-time-tracker-5d9q.vercel.app'
      ) {
        console.warn(
          '💡 本番環境: APIサーバーに接続できません。デモモードの利用を検討してください。'
        );
        // グローバルフラグを設定してフロントエンドでモック利用可能にする
        window.__API_CONNECTION_FAILED__ = true;
      }

      // 開発環境でのサーバー未起動を通知
      if (baseURL.includes('localhost:3001') && isDev()) {
        console.warn(
          '💡 Hint: Make sure your development server is running on http://localhost:3001'
        );
      }
    } else {
      logger.error('API', `${error.response?.status} ${error.config?.url}`, error.response?.data);
    }
    return Promise.reject(error);
  }
);

// トークンキャッシュをリセットする関数をエクスポート
export const clearTokenCache = () => {
  tokenCache = null;
  tokenFetchPromise = null;
  console.log('Token cache cleared');
};
