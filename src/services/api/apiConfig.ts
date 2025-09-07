import axios from 'axios';
import { ErrorHandler } from '@/lib/errorHandler';
import { logger } from '../../utils/logger';
import { fetchTokenFromDB } from './tokenService';
import { getEnv, getBooleanEnv, isDev, isProd } from '../../utils/env';

// Extend Window interface for custom properties
declare global {
  interface Window {
    __VITE_USE_MOCK_DATA__?: string;
    __API_CONNECTION_FAILED__?: boolean;
    __API_AUTH_HEADER__?: string;
  }
}

// Only allow mock mode when explicitly requested via env
const explicitUseMockRaw = getEnv('VITE_USE_MOCK_DATA');
export const USE_MOCK_DATA = explicitUseMockRaw === 'true' || explicitUseMockRaw === '1';

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

if (hostname === 'work-time-tracker-five.vercel.app') {
  baseURL = 'https://work-time-tracker-five.vercel.app/api';
  console.log('🚀 Production: Using production API server:', baseURL);
} else if (hostname.match(/^work-time-tracker-five-.*\.vercel\.app$/)) {
  baseURL = 'https://work-time-tracker-five.vercel.app/api';
  console.log('🔧 Preview: Using production API server:', baseURL);
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // ローカル開発環境: Viteのプロキシを活用して同一オリジンで呼び出す
  const viteApiUrl = getEnv('VITE_API_BASE_URL');
  if (viteApiUrl?.includes('vercel.app') || viteApiUrl?.includes('railway.app')) {
    baseURL = viteApiUrl;
    console.log('🛰️ Development: Using remote API server:', baseURL);
  } else {
    baseURL = '/api';
    console.log('🛠️ Development: Using Vite proxy at /api → http://127.0.0.1:3001');
  }
} else {
  // 例: LANアクセス (http://192.168.x.x:3000) なども同一オリジン /api を利用
  baseURL = '/api';
  console.log('🔧 Fallback: Using same-origin /api');
}

console.log('🔗 Final API Base URL:', baseURL);

// 本番環境での健全性チェック
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'work-time-tracker-five.vercel.app' ||
    window.location.hostname.match(/^work-time-tracker-five-.*\.vercel\.app$/))
) {
  const envType =
    window.location.hostname === 'work-time-tracker-five.vercel.app'
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
    // 開発環境では、トークンが無い場合に dev ヘッダを自動付与
    if (isDev()) {
      const hasAuth = Boolean((config.headers as any)?.Authorization);
      if (!hasAuth) {
        // ローカルに保存されたトークンがあれば Authorization を付与
        try {
          const localToken =
            (typeof window !== 'undefined' &&
              (localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken') ||
                localStorage.getItem('access_token') ||
                sessionStorage.getItem('access_token'))) ||
            null;
          if (localToken) {
            (config.headers as any).Authorization = `Bearer ${localToken}`;
            try {
              const masked = `Bearer ${String(localToken).slice(0, 12)}...`;
              if (typeof window !== 'undefined') window.__API_AUTH_HEADER__ = masked;
              console.log('🔒 (dev) Authorization set (masked):', masked);
            } catch {}
          }
        } catch {}

        // まだ Authorization が無い場合のみ開発者用ヘッダを付与
        const stillNoAuth = !(config.headers as any)?.Authorization;
        if (stillNoAuth) {
          // 任意の開発用ユーザーID（必要に応じて書き換え）
          const devUserId = localStorage.getItem('dev_user_id') || 'dev-user';
          const devRole = localStorage.getItem('dev_user_role') || 'user';
          (config.headers as any)['X-User-Id'] = devUserId;
          (config.headers as any)['X-User-Role'] = devRole;
          // 任意の開発用メール（管理者判定に使用）。例: kanta13jp@gmail.com
          const devEmail = localStorage.getItem('dev_user_email');
          if (devEmail) {
            (config.headers as any)['X-User-Email'] = devEmail;
          }
        }
      }
      return config;
    }

    // /auth/token エンドポイントへのリクエストではトークンを追加しない（無限ループ防止）
    if (config.url?.includes('/auth/token')) {
      return config;
    }

    // ここまで来るのは本番・プレビューのみ

    // まずはフロントのログインで保存されたトークンを優先（localStorage / sessionStorage / TokenManagerキー）
    if (!tokenCache && typeof window !== 'undefined') {
      const localToken =
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');
      if (localToken) {
        tokenCache = localToken;
      }
    }

    // トークンが未取得ならバックエンド由来のトークン取得を試行（重複リクエスト防止）
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

    // トークンがあればヘッダーに追加（本番・プレビュー・開発問わず）
    if (tokenCache) {
      config.headers.Authorization = `Bearer ${tokenCache}`;
      try {
        if (typeof window !== 'undefined') {
          const masked = `Bearer ${String(tokenCache).slice(0, 12)}...`;
          window.__API_AUTH_HEADER__ = masked;
          console.log('🔒 Authorization set (masked):', masked);
        }
      } catch {}
    }

    // 管理者APIの場合は特別なヘッダーを追加
    if (config.url?.includes('/admin/')) {
      (config.headers as any)['X-Admin-Request'] = 'true';
    }

    // 重複API呼び出しのログを抑制
    const suppressLog = config.url?.includes('/auth/') || config.url?.includes('/notifications/');

    if (!suppressLog) {
      logger.debug('API', `${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    // Auto-report request setup errors
    try {
      const eh = ErrorHandler.getInstance();
      eh.handleApiError(error, String(error.config?.url || ''));
    } catch {}
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
    // Auto-report API errors (axios)
    try {
      const eh = ErrorHandler.getInstance();
      eh.handleApiError(error, String(error.config?.url || ''));
    } catch {}
    // 認証エラーの場合はトークンキャッシュをクリア（ただし認証系エンドポイントではリダイレクトしない）
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Authentication error detected, clearing token cache');
      tokenCache = null;
      tokenFetchPromise = null;

      // 認証ルートに対する401はそのまま返す（/auth/login, /auth/check, /auth/whoami, /auth/refresh 等）
      const url = String(error.config?.url || '');
      const isAuthEndpoint = /\/auth\//.test(url);
      if (!isAuthEndpoint) {
        // 開発環境・本番環境両方での確実なリダイレクト処理
        try {
          if (typeof window !== 'undefined') {
            const path = window.location.pathname + window.location.search;
            const onLoginPage = window.location.pathname.startsWith('/login');
            const isProduction = window.location.hostname === 'work-time-tracker-five.vercel.app';

            if (!onLoginPage) {
              try {
                sessionStorage.setItem('post_login_redirect', path);
                // セッション期限切れイベントを発火
                window.dispatchEvent(new CustomEvent('auth:token-expired'));
              } catch {}

              // 開発環境・本番環境両方で即座にリダイレクト
              console.log('🚨 Redirecting to login due to auth error', { isProduction, url });
              window.location.replace('/login');
            }
          }
        } catch (redirectError) {
          console.error('Failed to redirect to login:', redirectError);
        }
      }
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
        window.location.hostname === 'work-time-tracker-five.vercel.app'
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

    // Track 404 on admin as analytics event (dev)
    try {
      if (
        process.env.NODE_ENV !== 'production' &&
        error.response?.status === 404 &&
        typeof window !== 'undefined' &&
        /\/admin\//.test(String(error.config?.url || ''))
      ) {
        const path = window.location.pathname + window.location.search;
        console.log('[Analytics] Event: not_found_admin', {
          url: String(error.config?.url || ''),
          path,
          referrer: document.referrer || '',
        });
      }
    } catch {}
    return Promise.reject(error);
  }
);

// トークンキャッシュをリセットする関数をエクスポート
export const clearTokenCache = () => {
  tokenCache = null;
  tokenFetchPromise = null;
  console.log('Token cache cleared');
};
