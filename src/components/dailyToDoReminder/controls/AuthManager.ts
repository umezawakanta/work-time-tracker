/**
 * 認証管理クラス
 * トークン管理と認証状態を担当
 */

export interface AuthStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  role?: string;
  permissions?: string[];
  [key: string]: unknown;
}

export interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  role?: string;
  permissions?: string[];
  expiresAt?: number;
}

class AuthManager {
  private static instance: AuthManager;
  private storage: AuthStorage;
  private tokenKey: string;
  private refreshTokenKey: string;
  private authStateListeners: Array<(state: AuthState) => void>;
  private refreshPromise: Promise<boolean> | null;
  private authState: AuthState;

  private constructor() {
    this.tokenKey = 'auth_token';
    this.refreshTokenKey = 'refresh_token';
    this.authStateListeners = [];
    this.refreshPromise = null;
    this.authState = { isAuthenticated: false };

    // ブラウザ環境ではローカルストレージを使用、それ以外ではメモリストレージを使用
    this.storage = this.createStorage();

    // 初期化時に認証状態を確認
    this.checkAuthState();
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * 適切なストレージを作成
   */
  private createStorage(): AuthStorage {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }

    // メモリストレージ（サーバーサイドや localStorage 非対応環境用）
    const memoryStorage: Record<string, string> = {};

    return {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete memoryStorage[key];
      },
    };
  }

  /**
   * 認証状態の確認
   */
  private checkAuthState(): void {
    const token = this.getToken();

    if (token) {
      try {
        const payload = this.parseToken(token);
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp > now) {
          // トークンが有効
          this.authState = {
            isAuthenticated: true,
            userId: payload.sub,
            role: payload.role,
            permissions: payload.permissions,
            expiresAt: payload.exp,
          };

          // 有効期限の90%経過時に自動リフレッシュを設定
          this.setupTokenRefresh(payload.exp);
        } else {
          // トークンの有効期限切れ
          this.refreshToken();
        }
      } catch (error) {
        // トークンの解析エラー
        console.error('トークンの解析に失敗しました:', error);
        this.clearAuth();
      }
    } else {
      this.clearAuth();
    }

    // リスナーに通知
    this.notifyListeners();
  }

  /**
   * JWTトークンの解析
   */
  private parseToken(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  /**
   * トークンリフレッシュのタイマー設定
   */
  private setupTokenRefresh(expiresAt: number): void {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    const refreshTime = timeUntilExpiry * 0.9; // 有効期限の90%経過時にリフレッシュ

    setTimeout(() => {
      this.refreshToken();
    }, refreshTime * 1000);
  }

  /**
   * 認証トークン取得
   */
  public getToken(): string | null {
    return this.storage.getItem(this.tokenKey);
  }

  /**
   * リフレッシュトークン取得
   */
  public getRefreshToken(): string | null {
    return this.storage.getItem(this.refreshTokenKey);
  }

  /**
   * 認証設定
   */
  public setAuth(token: string, refreshToken?: string): void {
    this.storage.setItem(this.tokenKey, token);

    if (refreshToken) {
      this.storage.setItem(this.refreshTokenKey, refreshToken);
    }

    this.checkAuthState();
  }

  /**
   * 認証クリア
   */
  public clearAuth(): void {
    this.storage.removeItem(this.tokenKey);
    this.storage.removeItem(this.refreshTokenKey);

    this.authState = { isAuthenticated: false };
    this.notifyListeners();
  }

  /**
   * 認証状態取得
   */
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * 認証状態リスナー追加
   */
  public addAuthStateListener(listener: (state: AuthState) => void): () => void {
    this.authStateListeners.push(listener);

    // 現在の状態を即座に通知
    listener({ ...this.authState });

    // リスナー削除用の関数を返す
    return () => {
      this.authStateListeners = this.authStateListeners.filter((l) => l !== listener);
    };
  }

  /**
   * 認証状態変更をリスナーに通知
   */
  private notifyListeners(): void {
    const state = { ...this.authState };
    this.authStateListeners.forEach((listener) => listener(state));
  }

  /**
   * トークンリフレッシュ
   */
  public async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearAuth();
      return false;
    }

    // 既に実行中のリフレッシュがある場合はそれを返す
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // リフレッシュ処理（async Promise executor を修正）
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    return this.refreshPromise;
  }

  /**
   * 実際のトークンリフレッシュ処理
   */
  private async performTokenRefresh(refreshToken: string): Promise<boolean> {
    try {
      // ここで実際のAPIコールを行う
      // 本番環境では、実際のAPIエンドポイントを呼び出す
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      if (data.token) {
        this.setAuth(data.token, data.refreshToken || refreshToken);
        return true;
      } else {
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error('トークンのリフレッシュに失敗しました:', error);
      this.clearAuth();
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * ユーザーが特定の権限を持っているか確認
   */
  public hasPermission(permission: string): boolean {
    return this.authState.permissions?.includes(permission) || false;
  }

  /**
   * ユーザーが特定のロールを持っているか確認
   */
  public hasRole(role: string): boolean {
    return this.authState.role === role;
  }
}

export default AuthManager;
