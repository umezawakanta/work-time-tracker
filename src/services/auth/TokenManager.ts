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
    // 本番環境またはStaging環境でTokenManagerを有効化
    const isProduction =
      process.env.NODE_ENV === 'production' || window.location.hostname.includes('vercel.app');

    if (!isProduction) {
      console.log('🚫 Development: TokenManager disabled');
      return;
    }

    console.log('✅ Production: TokenManager enabled');

    // API可用性を確認してからトークン管理を開始
    this.initializeWithHealthCheck();
  }

  /**
   * 🏥 API健全性チェック付き初期化
   */
  private async initializeWithHealthCheck(): Promise<void> {
    try {
      // まずAPI健全性をチェック
      const response = await fetch(window.location.origin + '/api/auth/tokens', {
        method: 'HEAD', // HEADリクエストでエンドポイントの存在を確認
        signal: AbortSignal.timeout(5000), // 5秒タイムアウト
      });

      if (response.ok || response.status === 404) {
        // 404は正常（まだトークンが保存されていない）
        console.log('✅ API endpoint available, initializing TokenManager');
        this.loadFromStorage();
        this.setupAxiosInterceptors();
      } else {
        console.warn('⚠️ API endpoint returned unexpected status:', response.status);
        this.handleApiUnavailable();
      }
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
    // 本番環境でのみ有効化
    const isProduction =
      process.env.NODE_ENV === 'production' || window.location.hostname.includes('vercel.app');
    if (!isProduction) {
      console.log('🚫 Development: Token loading disabled');
      return;
    }

    try {
      const response = await api.get<TokenPair>('/auth/tokens');
      const parsed = response.data;
      this.accessToken = parsed.accessToken;
      this.refreshToken = parsed.refreshToken;
      this.expiresAt = parsed.expiresAt;
      this.refreshExpiresAt = parsed.refreshExpiresAt;

      // 有効期限チェック
      const now = Date.now();
      if (this.refreshExpiresAt <= now) {
        // リフレッシュトークンも期限切れ
        this.clearTokens();
      } else if (this.expiresAt <= now) {
        // アクセストークンのみ期限切れ - 自動更新を試行
        this.scheduleTokenRefresh();
      } else {
        // 両方有効 - リフレッシュスケジュール設定
        this.scheduleTokenRefresh();
      }
    } catch (error: any) {
      console.error('Failed to load tokens from DB:', error);

      // Axiosエラーの場合
      if (error.response) {
        const status = error.response.status;
        const responseText =
          typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data);

        if (status === 404) {
          console.log('📝 No existing tokens found (404) - treating as new user session');
          this.clearTokens();
          return;
        }

        if (responseText.includes('<!doctype') || responseText.includes('<html')) {
          console.error('🚨 API endpoint returned HTML instead of JSON - possible routing issue');
          console.log('💡 Hint: Check if /api/auth/tokens endpoint is properly deployed');
          console.log('📄 Response:', responseText.substring(0, 200) + '...');
        }
      } else if (error.request) {
        console.error('🌐 Network error - no response received');
        console.log('💡 Hint: Check network connectivity and API server status');
      } else {
        console.error('⚙️ Request setup error:', error.message);
      }

      // ErrorRecoveryServiceを使用して回復を試行
      const recovered = await ErrorRecoveryService.handleAuthenticationError(error, 'tokens_load');
      if (!recovered) {
        this.clearTokens();
      }
    }
  }

  /**
   * ストレージにトークンを保存
   */
  private async saveToStorage(): Promise<void> {
    // 開発環境では無効化
    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 Development: Token saving disabled');
      return;
    }

    try {
      const tokenData: TokenPair = {
        accessToken: this.accessToken!,
        refreshToken: this.refreshToken!,
        expiresAt: this.expiresAt,
        refreshExpiresAt: this.refreshExpiresAt,
      };
      await api.post('/auth/tokens', tokenData);
      console.log('✅ Tokens saved successfully');
    } catch (error: any) {
      console.error('Failed to save tokens to DB:', error);

      // 詳細なエラー情報を出力
      if (error.response) {
        console.error(`📄 Response status: ${error.response.status}`);
        if (
          error.response.data &&
          typeof error.response.data === 'string' &&
          error.response.data.includes('<html')
        ) {
          console.error('🚨 Received HTML response instead of JSON - API routing issue');
        }
      }

      // トークン保存に失敗してもアプリケーションの動作は継続
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
    // 開発環境では無効化
    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 Development: Token refresh disabled');
      return null;
    }

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      this.clearTokens();
      return null;
    }

    const now = Date.now();
    if (this.refreshExpiresAt <= now) {
      this.clearTokens();
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newAccessToken = await this.refreshPromise;
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
    // 開発環境では無効化
    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 Development: Token refresh request disabled');
      return null;
    }

    try {
      const response = await api.post<RefreshResponse>('/auth/refresh', {
        refreshToken: this.refreshToken,
      });

      const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = response.data;

      this.setTokens(accessToken, refreshToken, expiresIn, refreshExpiresIn);

      console.log('Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();

      // トークン更新失敗時は再ログインが必要
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
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
    this.refreshExpiresAt = 0;

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // 開発環境ではAPI呼び出しを無効化
    if (process.env.NODE_ENV !== 'development') {
      try {
        await api.delete('/auth/tokens');
        console.log('✅ Tokens deleted successfully');
      } catch (error: any) {
        console.error('Failed to delete tokens from DB:', error);

        // 詳細なエラー情報を出力
        if (error.response) {
          console.error(`📄 Response status: ${error.response.status}`);
          // 404は既に削除済みとみなして正常とする
          if (error.response.status === 404) {
            console.log('📝 Tokens were already deleted or never existed');
            return;
          }
        }

        // トークン削除に失敗してもログアウト処理は継続
      }
    } else {
      console.log('🚫 Development: Token deletion API call disabled');
    }

    delete api.defaults.headers.common['Authorization'];
  }

  /**
   * Axiosインターセプターの設定
   */
  private setupAxiosInterceptors(): void {
    // 開発環境では無効化
    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 Development: Axios interceptors for TokenManager disabled');
      return;
    }

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
