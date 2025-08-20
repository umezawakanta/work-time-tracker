import { api } from '@/services/api/apiConfig';
import { ErrorRecoveryService } from '@/services/ErrorRecoveryService';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;
  private refreshExpiresAt: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;

  // シングルトンパターン
  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private constructor() {
    // 開発環境でもTokenManagerを有効化
    const hostname = window.location.hostname;
    console.log(`✅ TokenManager enabled for ${hostname}`);

    // 即座にlocalStorageからトークンを読み込む
    this.loadFromStorageSync();

    // API可用性を確認してからトークン管理を開始
    this.initializeWithHealthCheck();
  }

  /**
   * 同期的にlocalStorageからトークンを読み込む
   */
  private loadFromStorageSync(): void {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const expiresAt = localStorage.getItem('expiresAt');
      const refreshExpiresAt = localStorage.getItem('refreshExpiresAt');

      if (accessToken && refreshToken && expiresAt && refreshExpiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = parseInt(expiresAt, 10);
        this.refreshExpiresAt = parseInt(refreshExpiresAt, 10);
        console.log('✅ Tokens loaded synchronously from localStorage');
      }
    } catch (error) {
      console.error('❌ Failed to load tokens synchronously:', error);
    }
  }

  /**
   * 🏥 API健全性チェック付き初期化
   */
  private async initializeWithHealthCheck(): Promise<void> {
    try {
      // まずAPI健全性をチェック（複数エンドポイントでフォールバック）
      const checks: Array<{ url: string; method: 'HEAD' | 'GET' }> = [
        { url: '/api/auth/tokens', method: 'HEAD' },
        { url: '/api/auth/check', method: 'GET' },
        { url: '/api/health', method: 'GET' },
      ];

      for (const check of checks) {
        try {
          const response = await fetch(window.location.origin + check.url, {
            method: check.method,
            signal: AbortSignal.timeout(3000),
            headers: check.method === 'GET' ? { Accept: 'application/json' } : undefined,
          });

          if (response.ok || (check.method === 'HEAD' && response.status === 404)) {
            // 200はもちろん、HEAD 404もOK（未保存状態）
            console.log(
              `✅ API health check OK: ${check.method} ${check.url} -> ${response.status}`
            );
            this.loadFromStorage();
            this.setupAxiosInterceptors();
            return;
          }

          console.warn(
            `⚠️ API health check unexpected: ${check.method} ${check.url} -> ${response.status}`
          );
        } catch (e) {
          console.warn(`⚠️ API health check failed: ${check.method} ${check.url}`, e);
        }
      }

      // すべて失敗した場合はフォールバック
      this.handleApiUnavailable();
    } catch (error) {
      console.error('❌ API health check failed:', error);
      this.handleApiUnavailable();
    }
  }

  /**
   * 🚫 API利用不可時のフォールバック処理
   */
  private handleApiUnavailable(): void {
    console.log('🔄 API unavailable, using fallback mode');
    console.log('💡 TokenManager will operate in memory-only mode');

    // メモリ内でのみトークン管理を行う
    // APIへの保存・読み込みは無効化
    this.setupAxiosInterceptors();
  }

  /**
   * ストレージからトークンを読み込み
   */
  private async loadFromStorage(): Promise<void> {
    try {
      console.log('📂 Loading tokens from localStorage...');

      // localStorageから直接読み込む
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const expiresAt = localStorage.getItem('expiresAt');
      const refreshExpiresAt = localStorage.getItem('refreshExpiresAt');

      if (!accessToken || !refreshToken || !expiresAt || !refreshExpiresAt) {
        console.log('📝 No tokens found in localStorage');
        return;
      }

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiresAt = parseInt(expiresAt, 10);
      this.refreshExpiresAt = parseInt(refreshExpiresAt, 10);

      console.log('✅ Tokens loaded successfully from localStorage');

      // 有効期限チェック
      const now = Date.now();
      if (this.refreshExpiresAt <= now) {
        // リフレッシュトークンも期限切れ
        console.log('⏰ Refresh token expired, clearing tokens');
        this.clearTokens();
      } else if (this.expiresAt <= now) {
        // アクセストークンのみ期限切れ - 自動更新を試行
        console.log('⏰ Access token expired, scheduling refresh');
        this.scheduleTokenRefresh();
      } else {
        // 両方有効 - リフレッシュスケジュール設定
        console.log('✅ Tokens are valid, scheduling refresh');
        this.scheduleTokenRefresh();
      }
    } catch (error: any) {
      console.error('❌ Failed to load tokens from localStorage:', error);
      this.clearTokens();
    }
  }

  /**
   * 🌍 本番環境判定を改善
   */
  private isProductionEnvironment(): boolean {
    // 開発環境でもTokenManager機能を有効化
    return true;
  }

  /**
   * ストレージにトークンを保存
   */
  private async saveToStorage(): Promise<void> {
    try {
      // localStorageに直接保存
      if (this.accessToken && this.refreshToken) {
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        localStorage.setItem('expiresAt', this.expiresAt.toString());
        localStorage.setItem('refreshExpiresAt', this.refreshExpiresAt.toString());
        console.log('✅ Tokens saved to localStorage');
      }
    } catch (error: any) {
      console.error('❌ Failed to save tokens to localStorage:', error);
    }
  }

  /**
   * トークンペアを設定
   */
  public async setTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number = 3600, // 1時間
    refreshExpiresIn: number = 604800 // 7日
  ): Promise<void> {
    const now = Date.now();

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = now + expiresIn * 1000;
    this.refreshExpiresAt = now + refreshExpiresIn * 1000;

    await this.saveToStorage();
    this.scheduleTokenRefresh();

    // APIリクエストヘッダーを更新
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  /**
   * アクセストークンを取得
   */
  public async getAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      return null;
    }

    const now = Date.now();

    // アクセストークンが期限切れまたは5分以内に期限切れの場合
    if (this.expiresAt <= now || this.expiresAt - now < 5 * 60 * 1000) {
      return await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  /**
   * リフレッシュトークンを取得
   */
  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * 認証状態を確認
   */
  public isAuthenticated(): boolean {
    const now = Date.now();
    return !!(this.accessToken && this.refreshToken && this.refreshExpiresAt > now);
  }

  /**
   * アクセストークンを更新
   */
  private async refreshAccessToken(): Promise<string | null> {
    // 開発環境でも有効化

    if (this.isRefreshing && this.refreshPromise) {
      console.log('🔄 Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      console.log('❌ No refresh token available');
      this.clearTokens();
      return null;
    }

    const now = Date.now();
    if (this.refreshExpiresAt <= now) {
      console.log('⏰ Refresh token expired');
      this.clearTokens();
      return null;
    }

    console.log('🔄 Starting token refresh...');
    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newAccessToken = await this.refreshPromise;
      console.log('✅ Token refresh completed');
      return newAccessToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * トークン更新の実行
   */
  private async performTokenRefresh(): Promise<string | null> {
    // 本番環境判定を改善
    const isProduction = this.isProductionEnvironment();
    if (!isProduction) {
      console.log('🚫 Development: Token refresh request disabled');
      return null;
    }

    try {
      console.log('📡 Requesting token refresh from API...');
      const response = await api.post<RefreshResponse>('/auth/refresh', {
        refreshToken: this.refreshToken,
      });

      const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = response.data;

      console.log('✅ New tokens received, updating...');
      await this.setTokens(accessToken, refreshToken, expiresIn, refreshExpiresIn);

      console.log('✅ Token refreshed successfully');
      return accessToken;
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);

      if (error.response) {
        console.error(`📄 Refresh response status: ${error.response.status}`);
      }

      this.clearTokens();

      // トークン更新失敗時は再ログインが必要
      console.log('🔔 Dispatching token-expired event');
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
      return null;
    }
  }

  /**
   * トークン更新スケジュールを設定
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const refreshTime = this.expiresAt - 5 * 60 * 1000; // 5分前に更新
    const timeUntilRefresh = Math.max(0, refreshTime - now);

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, timeUntilRefresh);
  }

  /**
   * トークンをクリア
   */
  public async clearTokens(): Promise<void> {
    console.log('🧹 Clearing tokens...');

    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
    this.refreshExpiresAt = 0;

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // localStorageからトークンを削除
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('expiresAt');
      localStorage.removeItem('refreshExpiresAt');
      console.log('✅ Tokens cleared from localStorage');
    } catch (error: any) {
      console.error('❌ Failed to clear tokens from localStorage:', error);
    }

    // Safely remove Authorization header if it exists
    if (api.defaults?.headers?.common) {
      delete api.defaults.headers.common['Authorization'];
    }
    console.log('✅ Token cleanup completed');
  }

  /**
   * Axiosインターセプターの設定
   */
  private setupAxiosInterceptors(): void {
    // 本番環境判定を改善
    const isProduction = this.isProductionEnvironment();
    if (!isProduction) {
      console.log('🚫 Development: Axios interceptors for TokenManager disabled');
      return;
    }

    console.log('🔧 Setting up Axios interceptors for production');

    // リクエストインターセプター
    api.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== '/auth/refresh'
        ) {
          originalRequest._retry = true;

          const newToken = await this.refreshAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * セッション情報を取得
   */
  public getSessionInfo(): {
    isAuthenticated: boolean;
    expiresAt: Date | null;
    refreshExpiresAt: Date | null;
    timeUntilExpiry: number;
    timeUntilRefreshExpiry: number;
  } {
    const now = Date.now();
    return {
      isAuthenticated: this.isAuthenticated(),
      expiresAt: this.expiresAt ? new Date(this.expiresAt) : null,
      refreshExpiresAt: this.refreshExpiresAt ? new Date(this.refreshExpiresAt) : null,
      timeUntilExpiry: Math.max(0, this.expiresAt - now),
      timeUntilRefreshExpiry: Math.max(0, this.refreshExpiresAt - now),
    };
  }

  /**
   * Remember Me設定を適用
   */
  public async setRememberMe(remember: boolean): Promise<void> {
    if (remember) {
      // Remember Meが有効な場合は30日間有効
      const now = Date.now();
      this.refreshExpiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30日
      await this.saveToStorage();
    }
  }

  /**
   * デバッグ情報を取得
   */
  public getDebugInfo(): object {
    return {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      accessTokenExpiry: new Date(this.expiresAt).toISOString(),
      refreshTokenExpiry: new Date(this.refreshExpiresAt).toISOString(),
      isRefreshing: this.isRefreshing,
      timeUntilRefresh: this.expiresAt - Date.now(),
    };
  }
}

// シングルトンインスタンスをエクスポート
export const tokenManager = TokenManager.getInstance();
