/**
 * 🔐 統一認証・セキュリティフック
 * 統一認証、エラーハンドリング、セキュリティ機能を簡単に使用するためのインターフェース
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import {
  unifiedAuthManager,
  type UnifiedUser,
  type AuthState,
  type AuthProvider,
} from '@/services/auth/UnifiedAuthManager';
import { unifiedErrorHandler, type UnifiedError } from '@/services/error/UnifiedErrorHandler';
import {
  unifiedSecurityMiddleware,
  type SecurityLevel,
  type SecurityResult,
} from '@/services/security/UnifiedSecurityMiddleware';

export interface UseUnifiedAuthOptions {
  autoRedirect?: boolean;
  loginPath?: string;
  redirectAfterLogin?: string;
  enableSecurityChecks?: boolean;
  requiredSecurityLevel?: SecurityLevel;
  onAuthChange?: (user: UnifiedUser | null) => void;
  onError?: (error: UnifiedError) => void;
  onSecurityViolation?: (result: SecurityResult) => void;
}

export interface UseUnifiedAuthReturn {
  // 認証状態
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UnifiedUser | null;
  provider: AuthProvider | null;

  // 認証アクション
  login: (credentials: {
    email?: string;
    password?: string;
    provider?: AuthProvider;
    rememberMe?: boolean;
    token?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: (reason?: string) => Promise<void>;
  refreshAuth: () => Promise<boolean>;

  // セキュリティ機能
  checkSecurity: (action: string, data?: any) => Promise<SecurityResult>;
  generateCSRFToken: () => string;

  // エラーハンドリング
  handleError: (error: any, context?: string) => Promise<UnifiedError>;
  clearErrors: () => void;

  // 権限チェック
  hasPermission: (level: SecurityLevel) => boolean;
  requiresAuth: () => boolean;

  // 統計・状態
  authStatistics: ReturnType<typeof unifiedAuthManager.getStatistics>;
  securityStatistics: ReturnType<typeof unifiedSecurityMiddleware.getStatistics>;
  errors: UnifiedError[];

  // ユーティリティ
  isReady: boolean;
  sessionTimeLeft: number | null;
  securityLevel: SecurityLevel;
}

/**
 * 🔐 統一認証・セキュリティフック
 */
export function useUnifiedAuth(options: UseUnifiedAuthOptions = {}): UseUnifiedAuthReturn {
  const {
    autoRedirect = true,
    loginPath = '/login',
    redirectAfterLogin = '/',
    enableSecurityChecks = true,
    requiredSecurityLevel = 'public',
    onAuthChange,
    onError,
    onSecurityViolation,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();

  // 状態管理
  const [authState, setAuthState] = useState<AuthState>(() => unifiedAuthManager.getState());
  const [isReady, setIsReady] = useState(false);
  const [authStatistics, setAuthStatistics] = useState(() => unifiedAuthManager.getStatistics());
  const [securityStatistics, setSecurityStatistics] = useState(() =>
    unifiedSecurityMiddleware.getStatistics()
  );
  const [errors, setErrors] = useState<UnifiedError[]>([]);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);

  // セキュリティレベルの算出
  const securityLevel = useMemo((): SecurityLevel => {
    if (!authState.isAuthenticated) return 'public';
    if (!authState.user) return 'public';

    const user = authState.user;
    if (user.role === 'admin') return 'admin';
    if (user.isVerified) return 'verified';
    return 'authenticated';
  }, [authState.isAuthenticated, authState.user]);

  /**
   * 🔑 ログイン処理
   */
  const login = useCallback(
    async (credentials: {
      email?: string;
      password?: string;
      provider?: AuthProvider;
      rememberMe?: boolean;
      token?: string;
    }) => {
      try {
        console.log('🔐 Starting login process...');

        const result = await unifiedAuthManager.login(credentials);

        if (result.success) {
          setAuthState(unifiedAuthManager.getState());
          setAuthStatistics(unifiedAuthManager.getStatistics());

          toast.success('ログインしました');

          // リダイレクト処理
          if (autoRedirect) {
            const from = (location.state as any)?.from?.pathname || redirectAfterLogin;
            navigate(from, { replace: true });
          }

          // セッション作成
          if (result.user && enableSecurityChecks) {
            unifiedSecurityMiddleware.createSession(result.user.uid);
          }
        }

        return result;
      } catch (error) {
        const unifiedError = await unifiedErrorHandler.handleError(error, {
          component: 'useUnifiedAuth',
          action: 'login',
        });

        setErrors((prev) => [...prev, unifiedError]);

        if (onError) {
          onError(unifiedError);
        }

        return { success: false, error: unifiedError.userMessage };
      }
    },
    [navigate, location, autoRedirect, redirectAfterLogin, enableSecurityChecks, onError]
  );

  /**
   * 🚪 ログアウト処理
   */
  const logout = useCallback(
    async (reason?: string) => {
      try {
        console.log('🚪 Starting logout process...');

        const userId = authState.user?.uid;

        await unifiedAuthManager.logout(reason);
        setAuthState(unifiedAuthManager.getState());
        setAuthStatistics(unifiedAuthManager.getStatistics());

        // セッション破棄
        if (userId && enableSecurityChecks) {
          unifiedSecurityMiddleware.destroySession(userId);
        }

        toast.success('ログアウトしました');

        // リダイレクト処理
        if (autoRedirect && location.pathname !== loginPath) {
          navigate(loginPath, {
            state: { from: location },
            replace: true,
          });
        }
      } catch (error) {
        await unifiedErrorHandler.handleError(error, {
          component: 'useUnifiedAuth',
          action: 'logout',
        });
      }
    },
    [authState.user?.uid, enableSecurityChecks, autoRedirect, location, loginPath, navigate]
  );

  /**
   * 🔄 認証情報の更新
   */
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const success = await unifiedAuthManager.refreshToken();

      if (success) {
        setAuthState(unifiedAuthManager.getState());
        setAuthStatistics(unifiedAuthManager.getStatistics());
      }

      return success;
    } catch (error) {
      await unifiedErrorHandler.handleError(error, {
        component: 'useUnifiedAuth',
        action: 'refresh_auth',
      });
      return false;
    }
  }, []);

  /**
   * 🛡️ セキュリティチェック
   */
  const checkSecurity = useCallback(
    async (action: string, data?: any): Promise<SecurityResult> => {
      if (!enableSecurityChecks) {
        return {
          allowed: true,
          securityLevel: 'public',
          warnings: [],
          blocked: false,
          rateLimited: false,
          requiresAdditionalAuth: false,
          metadata: {
            requestId: 'security_disabled',
            timestamp: new Date().toISOString(),
            processingTime: 0,
            rules: [],
          },
        };
      }

      try {
        const request = {
          url: `${location.pathname}?action=${action}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': navigator.userAgent,
          },
          body: data,
          userId: authState.user?.uid,
          timestamp: Date.now(),
        };

        const result = await unifiedSecurityMiddleware.checkSecurity(
          request,
          requiredSecurityLevel
        );

        // セキュリティ統計の更新
        setSecurityStatistics(unifiedSecurityMiddleware.getStatistics());

        // セキュリティ違反の通知
        if (!result.allowed && onSecurityViolation) {
          onSecurityViolation(result);
        }

        return result;
      } catch (error) {
        await unifiedErrorHandler.handleError(error, {
          component: 'useUnifiedAuth',
          action: 'security_check',
          additionalData: { action, data },
        });

        // エラー時は安全側に倒す
        return {
          allowed: false,
          securityLevel: 'public',
          warnings: [],
          blocked: true,
          rateLimited: false,
          requiresAdditionalAuth: true,
          reason: 'Security check failed',
          metadata: {
            requestId: 'security_error',
            timestamp: new Date().toISOString(),
            processingTime: 0,
            rules: ['error_fallback'],
          },
        };
      }
    },
    [
      enableSecurityChecks,
      location.pathname,
      requiredSecurityLevel,
      authState.user?.uid,
      onSecurityViolation,
    ]
  );

  /**
   * 🔐 CSRFトークンの生成
   */
  const generateCSRFToken = useCallback((): string => {
    return unifiedSecurityMiddleware.generateCSRFToken();
  }, []);

  /**
   * 🚨 エラーハンドリング
   */
  const handleError = useCallback(
    async (error: any, context?: string): Promise<UnifiedError> => {
      const unifiedError = await unifiedErrorHandler.handleError(error, {
        component: 'useUnifiedAuth',
        action: context || 'unknown',
        userId: authState.user?.uid,
      });

      setErrors((prev) => [...prev, unifiedError]);

      if (onError) {
        onError(unifiedError);
      }

      return unifiedError;
    },
    [authState.user?.uid, onError]
  );

  /**
   * 🧹 エラーのクリア
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * 🔒 権限チェック
   */
  const hasPermission = useCallback(
    (level: SecurityLevel): boolean => {
      const levelValues = {
        public: 0,
        authenticated: 1,
        verified: 2,
        admin: 3,
        system: 4,
      };

      return levelValues[securityLevel] >= levelValues[level];
    },
    [securityLevel]
  );

  /**
   * 🔐 認証要求チェック
   */
  const requiresAuth = useCallback((): boolean => {
    return requiredSecurityLevel !== 'public';
  }, [requiredSecurityLevel]);

  // エフェクト：認証状態の監視
  useEffect(() => {
    const handleAuthEvent = (event: string, data: any) => {
      console.log(`🔐 Auth event: ${event}`, data);

      const newState = unifiedAuthManager.getState();
      setAuthState(newState);
      setAuthStatistics(unifiedAuthManager.getStatistics());

      if (onAuthChange) {
        onAuthChange(newState.user);
      }
    };

    // イベントリスナーの登録
    unifiedAuthManager.on('auth:login', () => handleAuthEvent('login', null));
    unifiedAuthManager.on('auth:logout', () => handleAuthEvent('logout', null));
    unifiedAuthManager.on('auth:tokenRefresh', () => handleAuthEvent('tokenRefresh', null));
    unifiedAuthManager.on('auth:sessionExpired', () => handleAuthEvent('sessionExpired', null));
    unifiedAuthManager.on('auth:error', (data) => handleAuthEvent('error', data));

    return () => {
      unifiedAuthManager.removeAllListeners();
    };
  }, [onAuthChange]);

  // エフェクト：初期化
  useEffect(() => {
    const initialize = async () => {
      try {
        // 認証状態の確認
        const currentState = unifiedAuthManager.getState();
        setAuthState(currentState);

        // セッション有効性の確認
        if (currentState.isAuthenticated) {
          const isValid = await unifiedAuthManager.validateSession();
          if (!isValid) {
            await logout('session_invalid');
          }
        }

        setIsReady(true);
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        setIsReady(true);
      }
    };

    initialize();
  }, [logout]);

  // エフェクト：セッションタイマー
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.expiresAt) {
      setSessionTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const timeLeft = authState.expiresAt! - Date.now();
      setSessionTimeLeft(Math.max(0, timeLeft));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.expiresAt]);

  // エフェクト：統計の定期更新
  useEffect(() => {
    const interval = setInterval(() => {
      setAuthStatistics(unifiedAuthManager.getStatistics());
      if (enableSecurityChecks) {
        setSecurityStatistics(unifiedSecurityMiddleware.getStatistics());
      }
    }, 30000); // 30秒ごと

    return () => clearInterval(interval);
  }, [enableSecurityChecks]);

  // エフェクト：自動リダイレクト
  useEffect(() => {
    if (!isReady) return;

    const needsAuth = requiresAuth();
    const hasAuth = authState.isAuthenticated;

    if (autoRedirect && needsAuth && !hasAuth && location.pathname !== loginPath) {
      console.log('🔐 Redirecting to login page...');
      navigate(loginPath, {
        state: { from: location },
        replace: true,
      });
    }
  }, [
    isReady,
    autoRedirect,
    requiresAuth,
    authState.isAuthenticated,
    location,
    loginPath,
    navigate,
  ]);

  return {
    // 認証状態
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
    provider: authState.provider,

    // 認証アクション
    login,
    logout,
    refreshAuth,

    // セキュリティ機能
    checkSecurity,
    generateCSRFToken,

    // エラーハンドリング
    handleError,
    clearErrors,

    // 権限チェック
    hasPermission,
    requiresAuth,

    // 統計・状態
    authStatistics,
    securityStatistics,
    errors,

    // ユーティリティ
    isReady,
    sessionTimeLeft,
    securityLevel,
  };
}

/**
 * 🔒 保護されたルート用フック
 */
export function useProtectedRoute(requiredLevel: SecurityLevel = 'authenticated') {
  const auth = useUnifiedAuth({
    autoRedirect: true,
    requiredSecurityLevel: requiredLevel,
  });

  const isAuthorized = useMemo(() => {
    return auth.isReady && auth.hasPermission(requiredLevel);
  }, [auth.isReady, auth.hasPermission, requiredLevel]);

  return {
    ...auth,
    isAuthorized,
    isLoading: !auth.isReady || auth.isLoading,
  };
}

/**
 * 🛡️ セキュリティチェック専用フック
 */
export function useSecurityCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<SecurityResult | null>(null);

  const performCheck = useCallback(
    async (
      action: string,
      data?: any,
      level: SecurityLevel = 'public'
    ): Promise<SecurityResult> => {
      setIsChecking(true);

      try {
        const request = {
          url: window.location.href,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data,
          timestamp: Date.now(),
        };

        const result = await unifiedSecurityMiddleware.checkSecurity(request, level);
        setLastResult(result);

        return result;
      } catch (error) {
        const fallbackResult: SecurityResult = {
          allowed: false,
          securityLevel: 'public',
          warnings: [],
          blocked: true,
          rateLimited: false,
          requiresAdditionalAuth: true,
          reason: 'Security check failed',
          metadata: {
            requestId: 'error',
            timestamp: new Date().toISOString(),
            processingTime: 0,
            rules: ['error'],
          },
        };

        setLastResult(fallbackResult);
        return fallbackResult;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  return {
    performCheck,
    isChecking,
    lastResult,
    statistics: unifiedSecurityMiddleware.getStatistics(),
  };
}

/**
 * 🚨 エラーハンドリング専用フック
 */
export function useErrorHandler() {
  const [errors, setErrors] = useState<UnifiedError[]>([]);
  const [isHandling, setIsHandling] = useState(false);

  const handleError = useCallback(
    async (
      error: any,
      context?: {
        component?: string;
        action?: string;
        additionalData?: Record<string, any>;
      }
    ): Promise<UnifiedError> => {
      setIsHandling(true);

      try {
        const unifiedError = await unifiedErrorHandler.handleError(error, context);
        setErrors((prev) => [...prev, unifiedError]);
        return unifiedError;
      } finally {
        setIsHandling(false);
      }
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const resolveError = useCallback((errorId: string, resolution: string) => {
    unifiedErrorHandler.resolveError(errorId, resolution);
    setErrors((prev) =>
      prev.map((error) => (error.id === errorId ? { ...error, resolved: true, resolution } : error))
    );
  }, []);

  return {
    errors,
    isHandling,
    handleError,
    clearErrors,
    resolveError,
    statistics: unifiedErrorHandler.getStatistics(),
  };
}
