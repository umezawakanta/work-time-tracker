/**
 * 🔐 統一認証プロバイダー
 * アプリケーション全体で統一認証システムを使用するためのプロバイダー
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { useUnifiedAuth, type UseUnifiedAuthReturn } from '@/hooks/useUnifiedAuth';
import { unifiedAuthManager, type UnifiedUser } from '@/services/auth/UnifiedAuthManager';
import { unifiedErrorHandler } from '@/services/error/UnifiedErrorHandler';
import { unifiedSecurityMiddleware } from '@/services/security/UnifiedSecurityMiddleware';

// 統一認証コンテキストの型定義
export interface UnifiedAuthContextType extends UseUnifiedAuthReturn {
  // 追加のヘルパーメソッド（デモ/匿名ログインは削除）
  switchProvider: (provider: string) => Promise<void>;
  getSecurityStatus: () => string;
  isSecure: boolean;
}

// コンテキストの作成
const UnifiedAuthContext = createContext<UnifiedAuthContextType | null>(null);

// プロバイダーのプロパティ
export interface UnifiedAuthProviderProps {
  children: React.ReactNode;
  enableSecurityMonitoring?: boolean;
  debugMode?: boolean;
  autoInitialize?: boolean;
  fallbackRedirect?: string;
}

/**
 * 🔐 統一認証プロバイダーコンポーネント
 */
export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({
  children,
  enableSecurityMonitoring = true,
  debugMode = false,
  autoInitialize = true,
  fallbackRedirect = '/dashboard',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'warning' | 'critical'>('secure');

  // 統一認証フックの使用
  const authHook = useUnifiedAuth({
    autoRedirect: true,
    enableSecurityChecks: enableSecurityMonitoring,
    onAuthChange: (user) => {
      if (debugMode) {
        console.log('🔐 Auth state changed:', user ? `User: ${user.name}` : 'Logged out');
      }

      // 認証状態変更時の追加処理
      if (user) {
        // セキュリティ監視の開始
        if (enableSecurityMonitoring) {
          unifiedSecurityMiddleware.createSession(user.uid);
        }

        // ユーザー固有の設定の読み込み
        loadUserPreferences(user);
      }
    },
    onError: (error) => {
      if (debugMode) {
        console.error('🚨 Auth error:', error);
      }

      // エラーレベルに応じた処理
      if (error.severity === 'critical') {
        toast.error('重大なセキュリティエラーが発生しました');
        // 強制ログアウト
        authHook.logout('security_error');
      }
    },
    onSecurityViolation: (result) => {
      if (debugMode) {
        console.warn('🛡️ Security violation:', result);
      }

      setSecurityStatus('warning');

      if (result.blocked) {
        toast.error('セキュリティ違反が検出されました');
      }
    },
  });

  // デモ/匿名ログインは提供しない

  /**
   * 🔄 プロバイダー切り替え
   */
  const switchProvider = async (provider: string): Promise<void> => {
    try {
      // 現在のセッションを終了
      await authHook.logout('provider_switch');

      // 新しいプロバイダーでログイン画面へ
      navigate('/login', {
        state: {
          provider,
          from: location,
        },
      });

      toast(`${provider}での認証に切り替えています...`);
    } catch (error) {
      await authHook.handleError(error, 'provider_switch');
    }
  };

  /**
   * 🛡️ セキュリティ状態の取得
   */
  const getSecurityStatus = (): string => {
    const stats = authHook.securityStatistics;

    if (stats.blockedRequests > 0 || stats.suspiciousActivities > 0) {
      return 'セキュリティ警告';
    }

    if (stats.rateLimitedRequests > 0) {
      return 'レート制限中';
    }

    if (authHook.isAuthenticated) {
      return '安全';
    }

    return '未認証';
  };

  /**
   * 🔒 セキュリティ状態の判定
   */
  const isSecure = (): boolean => {
    if (!enableSecurityMonitoring) return true;

    const stats = authHook.securityStatistics;
    return (
      stats.blockedRequests === 0 && stats.suspiciousActivities === 0 && securityStatus === 'secure'
    );
  };

  /**
   * 👤 ユーザー設定の読み込み
   */
  const loadUserPreferences = async (user: UnifiedUser): Promise<void> => {
    try {
      // ユーザー固有の設定を読み込み
      const preferences = localStorage.getItem(`user_preferences_${user.uid}`);

      if (preferences) {
        const parsed = JSON.parse(preferences);

        // テーマの適用
        if (parsed.theme) {
          document.documentElement.setAttribute('data-theme', parsed.theme);
        }

        // 言語設定の適用
        if (parsed.language) {
          // 言語設定の処理（実装に応じて）
        }

        if (debugMode) {
          console.log('👤 User preferences loaded:', parsed);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load user preferences:', error);
    }
  };

  /**
   * 📊 セキュリティ監視
   */
  const monitorSecurity = (): (() => void) => {
    if (!enableSecurityMonitoring) return () => {};

    const interval = setInterval(async () => {
      try {
        const stats = unifiedSecurityMiddleware.getStatistics();

        // セキュリティ状態の評価
        let newStatus: 'secure' | 'warning' | 'critical' = 'secure';

        if (stats.suspiciousActivities > 5) {
          newStatus = 'critical';
        } else if (stats.blockedRequests > 10 || stats.rateLimitedRequests > 20) {
          newStatus = 'warning';
        }

        if (newStatus !== securityStatus) {
          setSecurityStatus(newStatus);

          if (newStatus === 'critical') {
            toast.error('重大なセキュリティ問題が検出されました', {
              duration: 10000,
            });
          } else if (newStatus === 'warning') {
            toast('セキュリティ警告が発生しています');
          }
        }
      } catch (error) {
        console.error('❌ Security monitoring failed:', error);
      }
    }, 30000); // 30秒ごと

    // クリーンアップ
    return () => clearInterval(interval);
  };

  /**
   * 🚀 初期化処理
   */
  useEffect(() => {
    if (!autoInitialize) return;

    const initialize = async () => {
      try {
        if (debugMode) {
          console.log('🚀 Initializing Unified Auth Provider...');
        }

        // セキュリティ監視の開始
        if (enableSecurityMonitoring) {
          const cleanup = monitorSecurity();

          // コンポーネントアンマウント時のクリーンアップ
          return cleanup;
        }

        setIsInitialized(true);

        if (debugMode) {
          console.log('✅ Unified Auth Provider initialized');
        }
      } catch (error) {
        console.error('❌ Unified Auth Provider initialization failed:', error);
        await unifiedErrorHandler.handleError(error, {
          component: 'UnifiedAuthProvider',
          action: 'initialization',
        });
      }
    };

    initialize();
  }, [autoInitialize, debugMode, enableSecurityMonitoring]);

  /**
   * 🔍 デバッグ情報の表示
   */
  useEffect(() => {
    if (!debugMode) return;

    const interval = setInterval(() => {
      console.group('🔐 Unified Auth Debug Info');
      console.log('Auth State:', {
        isAuthenticated: authHook.isAuthenticated,
        user: authHook.user?.name,
        provider: authHook.provider,
        securityLevel: authHook.securityLevel,
        isReady: authHook.isReady,
      });
      console.log('Security:', {
        status: securityStatus,
        isSecure: isSecure(),
        statistics: authHook.securityStatistics,
      });
      console.log('Errors:', authHook.errors.length);
      console.groupEnd();
    }, 60000); // 1分ごと

    return () => clearInterval(interval);
  }, [debugMode, authHook, securityStatus]);

  // コンテキスト値の構築
  const contextValue: UnifiedAuthContextType = {
    ...authHook,
    switchProvider,
    getSecurityStatus,
    isSecure: isSecure(),
  };

  // 初期化中の表示
  if (autoInitialize && !isInitialized && !authHook.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">認証システムを初期化中...</h2>
          <p className="text-gray-600">セキュリティチェックを実行しています</p>
        </div>
      </div>
    );
  }

  return <UnifiedAuthContext.Provider value={contextValue}>{children}</UnifiedAuthContext.Provider>;
};

/**
 * 🪝 統一認証コンテキストフック
 */
export const useUnifiedAuthContext = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);

  if (!context) {
    throw new Error('useUnifiedAuthContext must be used within a UnifiedAuthProvider');
  }

  return context;
};

/**
 * 🔒 保護されたルートコンポーネント
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredLevel?: 'authenticated' | 'verified' | 'admin';
  fallbackPath?: string;
  showLoading?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredLevel = 'authenticated',
  fallbackPath = '/login',
  showLoading = true,
}) => {
  const { isAuthenticated, isLoading, hasPermission, isReady } = useUnifiedAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isReady || isLoading) return;

    if (!isAuthenticated) {
      navigate(fallbackPath, {
        state: { from: location },
        replace: true,
      });
      return;
    }

    if (!hasPermission(requiredLevel)) {
      toast.error('このページにアクセスする権限がありません');
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    isReady,
    hasPermission,
    requiredLevel,
    navigate,
    location,
    fallbackPath,
  ]);

  // ローディング中
  if (!isReady || isLoading) {
    if (showLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">認証状態を確認しています...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  // 認証されていない
  if (!isAuthenticated) {
    return null;
  }

  // 権限が不足
  if (!hasPermission(requiredLevel)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス拒否</h1>
          <p className="text-gray-600 mb-4">このページにアクセスする権限がありません</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * 🎭 デモ用ログインボタン
 */
export const DemoLoginButton: React.FC<{ className?: string }> = () => null;

/**
 * 👻 匿名ログインボタン
 */
export const AnonymousLoginButton: React.FC<{ className?: string }> = () => null;

/**
 * 🛡️ セキュリティステータス表示
 */
export const SecurityStatusIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { getSecurityStatus, isSecure, securityStatistics } = useUnifiedAuthContext();

  const statusColor = isSecure ? 'text-green-600' : 'text-yellow-600';
  const statusIcon = isSecure ? '🛡️' : '⚠️';

  return (
    <div className={`inline-flex items-center text-sm ${statusColor} ${className}`}>
      <span className="mr-1">{statusIcon}</span>
      <span>{getSecurityStatus()}</span>
      {securityStatistics.totalRequests > 0 && (
        <span className="ml-2 text-xs text-gray-500">
          ({securityStatistics.totalRequests} リクエスト)
        </span>
      )}
    </div>
  );
};

export default UnifiedAuthProvider;
