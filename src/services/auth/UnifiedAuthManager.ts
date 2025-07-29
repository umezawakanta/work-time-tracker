/**
 * 🔐 統一認証管理システム
 * 全ての認証方式を統合し、シンプルで安全な認証フローを提供
 */

import { EventEmitter } from '@/lib/BrowserEventEmitter';
import { store } from '@/store';
import { unifiedDataService, type SystemHealthCheck } from '@/services/unified/UnifiedDataService';
import { addSystemEvent, addNotification, updateConnectionStatus } from '@/store/unifiedDataSlice';

// 認証プロバイダーの種類
export type AuthProvider = 'jwt' | 'firebase' | 'supabase' | 'demo' | 'anonymous';

// ユーザー情報の統一インターフェース
export interface UnifiedUser {
  uid: string;
  id: string;
  email?: string;
  name?: string;
  displayName?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'guest';
  provider: AuthProvider;
  isVerified: boolean;
  lastLoginAt: string;
  createdAt: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ja' | 'en';
    notifications: boolean;
  };
  subscription: {
    plan: 'free' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'expired';
    expiresAt?: string;
  };
}

// 認証状態
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UnifiedUser | null;
  provider: AuthProvider | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  lastValidated: number | null;
  sessionId: string | null;
}

// 認証設定
export interface AuthConfig {
  defaultProvider: AuthProvider;
  enableRememberMe: boolean;
  sessionTimeout: number; // ミリ秒
  tokenRefreshThreshold: number; // ミリ秒
  maxRetryAttempts: number;
  enableBiometric: boolean;
  enableMultiFactor: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'strict';
}

// 認証イベント
export interface AuthEvents {
  'auth:login': { user: UnifiedUser; provider: AuthProvider };
  'auth:logout': { reason: string };
  'auth:tokenRefresh': { newToken: string };
  'auth:sessionExpired': { user: UnifiedUser };
  'auth:error': { error: string; code: string };
  'auth:securityAlert': { alert: string; severity: 'low' | 'medium' | 'high' | 'critical' };
  'auth:providerSwitch': { from: AuthProvider; to: AuthProvider };
}

class UnifiedAuthManager extends EventEmitter {
  private static instance: UnifiedAuthManager;
  private config: AuthConfig;
  private state: AuthState;
  private refreshTimer: NodeJS.Timeout | null = null;
  private validationTimer: NodeJS.Timeout | null = null;
  private securityCheckTimer: NodeJS.Timeout | null = null;

  private constructor(config?: Partial<AuthConfig>) {
    super();

    this.config = {
      defaultProvider: 'jwt',
      enableRememberMe: true,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24時間
      tokenRefreshThreshold: 5 * 60 * 1000, // 5分前にリフレッシュ
      maxRetryAttempts: 3,
      enableBiometric: false,
      enableMultiFactor: false,
      securityLevel: 'medium',
      ...config,
    };

    this.state = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      provider: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      lastValidated: null,
      sessionId: null,
    };

    this.initialize();
  }

  /**
   * 🎯 シングルトンインスタンスの取得
   */
  public static getInstance(config?: Partial<AuthConfig>): UnifiedAuthManager {
    if (!UnifiedAuthManager.instance) {
      UnifiedAuthManager.instance = new UnifiedAuthManager(config);
    }
    return UnifiedAuthManager.instance;
  }

  /**
   * 🚀 認証システムの初期化
   */
  private async initialize(): Promise<void> {
    try {
      console.log('🔐 Initializing Unified Auth Manager...');

      // 既存セッションの復元を試行
      await this.restoreSession();

      // セキュリティ監視の開始
      this.startSecurityMonitoring();

      // イベントリスナーの設定
      this.setupEventListeners();

      console.log('✅ Unified Auth Manager initialized successfully');

      this.addSystemEvent({
        type: 'success',
        message: 'Unified Auth Manager initialized',
        component: 'UnifiedAuthManager',
      });
    } catch (error) {
      console.error('❌ Failed to initialize Unified Auth Manager:', error);

      this.addSystemEvent({
        type: 'error',
        message: `Auth initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'UnifiedAuthManager',
      });
    }
  }

  /**
   * 🔑 ログイン処理
   */
  public async login(credentials: {
    email?: string;
    password?: string;
    provider?: AuthProvider;
    rememberMe?: boolean;
    token?: string;
  }): Promise<{ success: boolean; user?: UnifiedUser; error?: string }> {
    try {
      this.state.isLoading = true;
      this.emit('auth:loading', true);

      const provider = credentials.provider || this.config.defaultProvider;
      console.log(`🔐 Starting login with provider: ${provider}`);

      let authResult;

      switch (provider) {
        case 'jwt':
          authResult = await this.loginWithJWT(credentials);
          break;
        case 'firebase':
          authResult = await this.loginWithFirebase(credentials);
          break;
        case 'demo':
          authResult = await this.loginWithDemo(credentials);
          break;
        case 'anonymous':
          authResult = await this.loginAnonymous();
          break;
        default:
          throw new Error(`Unsupported auth provider: ${provider}`);
      }

      if (!authResult.success) {
        throw new Error(authResult.error || 'Login failed');
      }

      // セッション情報の保存
      await this.establishSession(authResult.user!, provider, {
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        expiresAt: authResult.expiresAt,
        rememberMe: credentials.rememberMe,
      });

      // 自動リフレッシュの開始
      this.startTokenRefresh();

      // ログイン成功イベント
      this.emit('auth:login', { user: authResult.user!, provider });

      this.addSystemEvent({
        type: 'success',
        message: `User logged in successfully with ${provider}`,
        component: 'UnifiedAuthManager',
      });

      console.log('✅ Login successful');
      return { success: true, user: authResult.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown login error';
      console.error('❌ Login failed:', errorMessage);

      this.emit('auth:error', { error: errorMessage, code: 'LOGIN_FAILED' });

      this.addSystemEvent({
        type: 'error',
        message: `Login failed: ${errorMessage}`,
        component: 'UnifiedAuthManager',
      });

      return { success: false, error: errorMessage };
    } finally {
      this.state.isLoading = false;
      this.emit('auth:loading', false);
    }
  }

  /**
   * 🚪 ログアウト処理
   */
  public async logout(reason: string = 'user_request'): Promise<void> {
    try {
      console.log(`🚪 Starting logout, reason: ${reason}`);

      // リフレッシュタイマーの停止
      this.stopTokenRefresh();

      // セッションの無効化
      await this.invalidateSession();

      // 状態のクリア
      this.clearAuthState();

      // ログアウトイベント
      this.emit('auth:logout', { reason });

      this.addSystemEvent({
        type: 'info',
        message: `User logged out: ${reason}`,
        component: 'UnifiedAuthManager',
      });

      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);

      // エラーが発生してもセッションはクリアする
      this.clearAuthState();
    }
  }

  /**
   * 🔄 トークンリフレッシュ
   */
  public async refreshToken(): Promise<boolean> {
    try {
      if (!this.state.refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing authentication token...');

      const response = await this.callAuthAPI('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.state.refreshToken }),
      });

      if (!response.success) {
        throw new Error(response.error || 'Token refresh failed');
      }

      // 新しいトークンで状態を更新
      this.state.accessToken = response.accessToken;
      this.state.expiresAt = response.expiresAt;
      this.state.lastValidated = Date.now();

      // セキュアストレージに保存
      this.saveTokens({
        accessToken: response.accessToken,
        refreshToken: this.state.refreshToken,
        expiresAt: response.expiresAt,
      });

      this.emit('auth:tokenRefresh', { newToken: response.accessToken });

      console.log('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);

      // リフレッシュに失敗した場合はログアウト
      await this.logout('token_refresh_failed');
      return false;
    }
  }

  /**
   * ✅ 認証状態の検証
   */
  public async validateSession(): Promise<boolean> {
    try {
      if (!this.state.isAuthenticated || !this.state.accessToken) {
        return false;
      }

      // トークンの期限をチェック
      if (this.state.expiresAt && Date.now() >= this.state.expiresAt) {
        console.log('🕒 Token expired, attempting refresh...');
        return await this.refreshToken();
      }

      // 最後の検証から一定時間経過している場合はサーバー検証
      const needsServerValidation =
        !this.state.lastValidated || Date.now() - this.state.lastValidated > 5 * 60 * 1000; // 5分

      if (needsServerValidation) {
        console.log('🔍 Validating session with server...');

        const response = await this.callAuthAPI('/api/auth/validate', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.state.accessToken}`,
          },
        });

        if (!response.success) {
          console.log('❌ Server validation failed');
          await this.logout('session_invalid');
          return false;
        }

        this.state.lastValidated = Date.now();
      }

      return true;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      await this.logout('validation_error');
      return false;
    }
  }

  /**
   * 🔐 JWT認証の実装
   */
  private async loginWithJWT(credentials: any): Promise<any> {
    const response = await this.callAuthAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'JWT login failed');
    }

    return {
      success: true,
      user: this.normalizeUser(response.user, 'jwt'),
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    };
  }

  /**
   * 🔥 Firebase認証の実装
   */
  private async loginWithFirebase(credentials: any): Promise<any> {
    try {
      // Firebase Authのimport
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('@/config/firebase');

      console.log('🔥 Firebase authentication starting...');

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Firebase ユーザー情報を統一フォーマットに変換
      const unifiedUser = {
        id: user.uid,
        _id: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
        username: user.email?.split('@')[0] || 'user',
        isAdmin: false, // 管理者権限は別途設定
        avatar: user.photoURL || '',
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime,
        lastLoginAt: user.metadata.lastSignInTime,
        provider: 'firebase',
        roles: ['user'],
        permissions: ['read', 'write'],
        subscriptionStatus: 'free' as const,
        preferences: {
          theme: 'light' as const,
          language: 'ja' as const,
          timezone: 'Asia/Tokyo',
          notifications: {
            email: true,
            push: true,
            daily: true,
            weekly: true,
          },
        },
      };

      console.log('✅ Firebase authentication successful:', user.email);

      return {
        success: true,
        user: unifiedUser,
        accessToken: idToken,
        refreshToken: user.refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1時間
        provider: 'firebase',
      };
    } catch (error: any) {
      console.error('❌ Firebase authentication failed:', error.message);

      // Firebase エラーを統一フォーマットに変換
      let errorMessage = 'ログインに失敗しました';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'ユーザーが見つかりません';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが正しくありません';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'このアカウントは無効化されています';
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code,
      };
    }
  }

  /**
   * 🎭 デモ認証の実装
   */
  private async loginWithDemo(credentials: any): Promise<any> {
    // デモ用認証
    console.log('🎭 Demo authentication');

    return {
      success: true,
      user: this.createMockUser('demo'),
      accessToken: 'demo_token_' + Date.now(),
      refreshToken: 'demo_refresh_' + Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24時間
    };
  }

  /**
   * 👻 匿名認証の実装
   */
  private async loginAnonymous(): Promise<any> {
    console.log('👻 Anonymous authentication');

    return {
      success: true,
      user: this.createMockUser('anonymous'),
      accessToken: 'anon_token_' + Date.now(),
      refreshToken: null,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1時間
    };
  }

  /**
   * 🏢 セッション確立
   */
  private async establishSession(
    user: UnifiedUser,
    provider: AuthProvider,
    tokens: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      rememberMe?: boolean;
    }
  ): Promise<void> {
    this.state = {
      isAuthenticated: true,
      isLoading: false,
      user,
      provider,
      accessToken: tokens.accessToken || null,
      refreshToken: tokens.refreshToken || null,
      expiresAt: tokens.expiresAt || null,
      lastValidated: Date.now(),
      sessionId: this.generateSessionId(),
    };

    // トークンの保存
    if (tokens.accessToken) {
      this.saveTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        rememberMe: tokens.rememberMe,
      });
    }

    // ユーザー情報の保存
    this.saveUserInfo(user);
  }

  /**
   * 🧹 認証状態のクリア
   */
  private clearAuthState(): void {
    this.state = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      provider: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      lastValidated: null,
      sessionId: null,
    };

    this.clearStoredData();
  }

  /**
   * 💾 トークンの保存
   */
  private saveTokens(tokens: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    rememberMe?: boolean;
  }): void {
    const storage = tokens.rememberMe ? localStorage : sessionStorage;

    if (tokens.accessToken) {
      storage.setItem('unified_access_token', tokens.accessToken);
    }
    if (tokens.refreshToken) {
      storage.setItem('unified_refresh_token', tokens.refreshToken);
    }
    if (tokens.expiresAt) {
      storage.setItem('unified_token_expires', tokens.expiresAt.toString());
    }
  }

  /**
   * 👤 ユーザー情報の保存
   */
  private saveUserInfo(user: UnifiedUser): void {
    localStorage.setItem('unified_user', JSON.stringify(user));
  }

  /**
   * 🗑️ 保存データのクリア
   */
  private clearStoredData(): void {
    const items = [
      'unified_access_token',
      'unified_refresh_token',
      'unified_token_expires',
      'unified_user',
    ];

    items.forEach((item) => {
      localStorage.removeItem(item);
      sessionStorage.removeItem(item);
    });
  }

  /**
   * 🔄 セッション復元
   */
  private async restoreSession(): Promise<void> {
    try {
      const accessToken =
        localStorage.getItem('unified_access_token') ||
        sessionStorage.getItem('unified_access_token');
      const refreshToken =
        localStorage.getItem('unified_refresh_token') ||
        sessionStorage.getItem('unified_refresh_token');
      const expiresAt =
        localStorage.getItem('unified_token_expires') ||
        sessionStorage.getItem('unified_token_expires');
      const userJson = localStorage.getItem('unified_user');

      if (!accessToken || !userJson) {
        console.log('🔍 No stored session found');
        return;
      }

      const user = JSON.parse(userJson) as UnifiedUser;
      const expiry = expiresAt ? parseInt(expiresAt) : null;

      // トークンの期限チェック
      if (expiry && Date.now() >= expiry) {
        console.log('🕒 Stored token expired');
        this.clearStoredData();
        return;
      }

      // セッションの復元
      this.state = {
        isAuthenticated: true,
        isLoading: false,
        user,
        provider: user.provider,
        accessToken,
        refreshToken,
        expiresAt: expiry,
        lastValidated: Date.now(),
        sessionId: this.generateSessionId(),
      };

      // セッションの検証
      const isValid = await this.validateSession();
      if (!isValid) {
        this.clearAuthState();
        return;
      }

      console.log('✅ Session restored successfully');
      this.startTokenRefresh();
    } catch (error) {
      console.error('❌ Session restoration failed:', error);
      this.clearStoredData();
    }
  }

  /**
   * ⏰ トークンリフレッシュタイマーの開始
   */
  private startTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    const interval = 60 * 1000; // 1分間隔でチェック
    this.refreshTimer = setInterval(async () => {
      if (
        this.state.expiresAt &&
        this.state.expiresAt - Date.now() < this.config.tokenRefreshThreshold
      ) {
        await this.refreshToken();
      }
    }, interval);
  }

  /**
   * 🛑 トークンリフレッシュタイマーの停止
   */
  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * 🔒 セキュリティ監視の開始
   */
  private startSecurityMonitoring(): void {
    if (this.securityCheckTimer) {
      clearInterval(this.securityCheckTimer);
    }

    const interval = 30 * 1000; // 30秒間隔
    this.securityCheckTimer = setInterval(async () => {
      await this.performSecurityCheck();
    }, interval);
  }

  /**
   * 🛡️ セキュリティチェック
   */
  private async performSecurityCheck(): Promise<void> {
    try {
      // 基本的なセキュリティチェック
      const checks = {
        sessionValidity: this.state.isAuthenticated && (await this.validateSession()),
        tokenSecurity: this.checkTokenSecurity(),
        browserSecurity: this.checkBrowserSecurity(),
        networkSecurity: this.checkNetworkSecurity(),
      };

      const failedChecks = Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([check]) => check);

      if (failedChecks.length > 0) {
        this.emit('auth:securityAlert', {
          alert: `Security checks failed: ${failedChecks.join(', ')}`,
          severity: failedChecks.length > 2 ? 'high' : 'medium',
        });
      }
    } catch (error) {
      console.error('❌ Security check failed:', error);
    }
  }

  /**
   * 🔐 トークンセキュリティチェック
   */
  private checkTokenSecurity(): boolean {
    if (!this.state.accessToken) return true; // 認証していない場合はOK

    // トークンの基本的な検証
    try {
      const parts = this.state.accessToken.split('.');
      if (parts.length !== 3) return false; // JWT形式チェック

      // ペイロードのデコード（簡易版）
      const payload = JSON.parse(atob(parts[1]));

      // 期限チェック
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 🌐 ブラウザセキュリティチェック
   */
  private checkBrowserSecurity(): boolean {
    // HTTPSチェック
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      return false;
    }

    // セキュアコンテキストチェック
    if (!window.isSecureContext) {
      return false;
    }

    return true;
  }

  /**
   * 📡 ネットワークセキュリティチェック
   */
  private checkNetworkSecurity(): boolean {
    // 基本的なネットワークチェック
    return navigator.onLine;
  }

  /**
   * 📞 認証APIコール
   */
  private async callAuthAPI(endpoint: string, options: RequestInit): Promise<any> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ Auth API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * 👤 ユーザー情報の正規化
   */
  private normalizeUser(userData: any, provider: AuthProvider): UnifiedUser {
    return {
      uid: userData.uid || userData.id || userData.email || 'unknown',
      id: userData.id || userData.uid || userData.email || 'unknown',
      email: userData.email,
      name: userData.name || userData.displayName || userData.email,
      displayName: userData.displayName || userData.name || userData.email,
      avatar: userData.avatar || userData.photoURL,
      role: userData.role || 'user',
      provider,
      isVerified: userData.emailVerified || false,
      lastLoginAt: new Date().toISOString(),
      createdAt: userData.createdAt || new Date().toISOString(),
      preferences: {
        theme: userData.preferences?.theme || 'auto',
        language: userData.preferences?.language || 'ja',
        notifications: userData.preferences?.notifications !== false,
      },
      subscription: {
        plan: userData.subscription?.plan || 'free',
        status: userData.subscription?.status || 'active',
        expiresAt: userData.subscription?.expiresAt,
      },
    };
  }

  /**
   * 🎭 モックユーザーの作成
   */
  private createMockUser(provider: AuthProvider): UnifiedUser {
    return {
      uid: `${provider}_user_${Date.now()}`,
      id: `${provider}_user_${Date.now()}`,
      email: `demo@${provider}.example.com`,
      name: `Demo User (${provider})`,
      displayName: `Demo User (${provider})`,
      avatar: undefined,
      role: provider === 'anonymous' ? 'guest' : 'user',
      provider,
      isVerified: provider !== 'anonymous',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      preferences: {
        theme: 'auto',
        language: 'ja',
        notifications: true,
      },
      subscription: {
        plan: 'free',
        status: 'active',
      },
    };
  }

  /**
   * 🆔 セッションIDの生成
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 📝 イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // ページ可視性の変更
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.state.isAuthenticated) {
        this.validateSession();
      }
    });

    // オンライン/オフライン状態
    window.addEventListener('online', () => {
      if (this.state.isAuthenticated) {
        this.validateSession();
      }
    });
  }

  /**
   * 💾 セッション無効化
   */
  private async invalidateSession(): Promise<void> {
    try {
      if (this.state.accessToken) {
        await this.callAuthAPI('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.state.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.warn('❌ Failed to invalidate session on server:', error);
    }
  }

  /**
   * 📊 システムイベントの追加
   */
  private addSystemEvent(event: {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    component: string;
  }): void {
    store.dispatch(
      addSystemEvent({
        id: `auth_${Date.now()}`,
        type: event.type,
        message: event.message,
        timestamp: new Date().toISOString(),
        component: event.component,
      })
    );
  }

  /**
   * 📱 パブリックAPI
   */
  public getState(): AuthState {
    return { ...this.state };
  }

  public getUser(): UnifiedUser | null {
    return this.state.user;
  }

  public isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  public isLoading(): boolean {
    return this.state.isLoading;
  }

  public getProvider(): AuthProvider | null {
    return this.state.provider;
  }

  public updateConfig(newConfig: Partial<AuthConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getStatistics() {
    return {
      isAuthenticated: this.state.isAuthenticated,
      provider: this.state.provider,
      sessionId: this.state.sessionId,
      lastValidated: this.state.lastValidated,
      tokenExpiresAt: this.state.expiresAt,
      securityLevel: this.config.securityLevel,
    };
  }

  /**
   * 🚮 リソースのクリーンアップ
   */
  public destroy(): void {
    this.stopTokenRefresh();

    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }

    if (this.securityCheckTimer) {
      clearInterval(this.securityCheckTimer);
    }

    this.removeAllListeners();
    console.log('🚮 Unified Auth Manager destroyed');
  }
}

// シングルトンインスタンスをエクスポート
export const unifiedAuthManager = UnifiedAuthManager.getInstance();

// デフォルトエクスポート
export default unifiedAuthManager;
