import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { auth, isFirebaseEnabled } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { AuthUser, AuthError as _AuthError } from '@/types/auth';
import { logger } from '@/utils/logger';

interface FirebaseAuthContextType {
  // 基本認証状態
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  loading: boolean; // Keep for backward compatibility
  isFirebaseEnabled: boolean;
  error: string | null;

  // 認証アクション - Test expected names
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: { displayName?: string; photoURL?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // 認証アクション - Original names for backward compatibility
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  // セッション管理
  refreshAuth: () => Promise<void>;
  sessionExpired: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const navigate = useNavigate();

  // 基本状態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Test environment detection
  const isTestEnvironment =
    process.env.NODE_ENV === 'test' ||
    (typeof process !== 'undefined' && process.env.JEST_WORKER_ID !== undefined);

  // Use ref to ensure stable navigation function
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Helper function to convert Firebase user to AuthUser
  const convertFirebaseUser = useCallback((firebaseUser: FirebaseUser | null): AuthUser | null => {
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      // Additional properties for compatibility
      isPremium: false,
      createdAt: new Date().toISOString(),
      _id: firebaseUser.uid,
      id: firebaseUser.uid,
      name: firebaseUser.displayName || '',
      username: firebaseUser.email?.split('@')[0] || '',
      isAdmin: false,
      permissions: ['read'],
      roles: ['user'],
      lastActivityAt: new Date(),
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
  }, []);

  // Firebase有効性チェック
  useEffect(() => {
    // 本番環境では必ずFirebaseを使用
    if (!isFirebaseEnabled && !isTestEnvironment) {
      console.error(
        '🚨 Firebase is required in production environment. Please configure Firebase properly.'
      );
      setError('Firebase configuration is missing. Authentication unavailable.');
      setLoading(false);
      return;
    }

    // テスト環境のみ例外を許可
    const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;

    if (!shouldUseFirebase) {
      console.warn('🧪 Test environment: Firebase mocked for testing');
      setLoading(false);
      return;
    }

    // Firebase認証状態のリスナー設定（Firebase有効時のみ）
    if (!auth) {
      console.error('🚨 Firebase auth not available - please check configuration');
      setError('Firebase authentication service is unavailable');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const authUser = convertFirebaseUser(firebaseUser);
      setUser(authUser);
      setIsAuthenticated(!!authUser);
      setSessionExpired(false);
      setLoading(false);

      console.log('🔐 Firebase auth state changed:', !!authUser);
    });

    return () => {
      unsubscribe();
    };
  }, [convertFirebaseUser, isFirebaseEnabled, isTestEnvironment]);

  // 認証メソッドの実装
  // Clear error helper - use useCallback for stability
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set error helper - preserves Firebase error codes - use useCallback for stability
  const setErrorMessage = useCallback((error: unknown) => {
    let errorMessage = '';
    if (error && typeof error === 'object') {
      // Check for Firebase error code property
      const errorObj = error as any;
      if (errorObj.code) {
        // Firebase error with code
        errorMessage = errorObj.code;
      } else if (error instanceof Error) {
        // Regular error - use the error message directly
        errorMessage = error.message;
      } else {
        // Unknown object error
        errorMessage = String(error);
      }
    } else if (error instanceof Error) {
      // Regular error - use the error message directly
      errorMessage = error.message;
    } else {
      // Unknown error
      errorMessage = String(error);
    }

    setError(errorMessage);
  }, []);

  // Create stable functions using useCallback with proper dependencies
  const signIn = useCallback(
    async (email: string, password: string) => {
      const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
      if (!shouldUseFirebase || !auth) {
        const error = new Error('Firebase認証が設定されていません');
        setErrorMessage(error);
        toast.error(error.message);
        throw error;
      }

      setLoading(true);
      clearError();
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Only clear error on successful completion
        clearError();
        toast.success('ログインしました');
        setLoading(false);
      } catch (error: unknown) {
        console.log('🔥 signIn catch block:', error);
        setErrorMessage(error);
        const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
        toast.error(errorMessage);
        setLoading(false);
        throw error; // Re-throw to maintain expected behavior
      }
    },
    [clearError, setErrorMessage, isTestEnvironment]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
      if (!shouldUseFirebase || !auth) {
        const error = new Error('Firebase認証が設定されていません');
        setErrorMessage(error);
        toast.error(error.message);
        throw error;
      }

      setLoading(true);
      clearError();
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user && name) {
          await updateFirebaseProfile(userCredential.user, { displayName: name });
        }
        clearError();
        toast.success('アカウントを作成しました。確認メールを送信しました。');
      } catch (error: unknown) {
        setErrorMessage(error);
        const errorMessage =
          error instanceof Error ? error.message : 'アカウント作成に失敗しました';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setErrorMessage, isTestEnvironment]
  );

  const signInWithGoogle = useCallback(async () => {
    const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
    if (!shouldUseFirebase || !auth) {
      const error = new Error('Firebase認証が設定されていません');
      setErrorMessage(error);
      toast.error(error.message);
      throw error;
    }

    setLoading(true);
    clearError();
    try {
      // For now, just throw an error as Google sign-in requires additional setup
      throw new Error('Google認証は実装中です');
    } catch (error: unknown) {
      setErrorMessage(error);
      const errorMessage = error instanceof Error ? error.message : 'Googleログインに失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearError, setErrorMessage, isTestEnvironment]);

  const signOut = useCallback(async () => {
    const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
    if (!shouldUseFirebase || !auth) {
      setIsAuthenticated(false);
      setUser(null);
      clearError();
      toast.success('ログアウトしました');
      navigateRef.current('/firebase-login');
      return;
    }

    setLoading(true);
    clearError();
    try {
      await firebaseSignOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      clearError();
      toast.success('ログアウトしました');
      navigateRef.current('/firebase-login');
    } catch (error: unknown) {
      setErrorMessage(error);
      const errorMessage = error instanceof Error ? error.message : 'ログアウトに失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearError, setErrorMessage, isTestEnvironment]);

  const updateProfile = useCallback(
    async (profileData: { displayName?: string; photoURL?: string }) => {
      const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
      if (!shouldUseFirebase || !auth || !auth.currentUser) {
        const error = new Error('User not authenticated');
        setErrorMessage(error);
        throw error;
      }

      setLoading(true);
      clearError();
      try {
        await updateFirebaseProfile(auth.currentUser, profileData);
        clearError();
        toast.success('プロフィールを更新しました');
      } catch (error: unknown) {
        setErrorMessage(error);
        const errorMessage =
          error instanceof Error ? error.message : 'プロフィール更新に失敗しました';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setErrorMessage, isTestEnvironment]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
      if (!shouldUseFirebase || !auth) {
        const error = new Error('Firebase認証が設定されていません');
        setErrorMessage(error);
        toast.error(error.message);
        throw error;
      }

      setLoading(true);
      clearError();
      try {
        await sendPasswordResetEmail(auth, email);
        clearError();
        toast.success('パスワードリセットメールを送信しました');
      } catch (error: unknown) {
        setErrorMessage(error);
        const errorMessage =
          error instanceof Error ? error.message : 'パスワードリセットに失敗しました';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setErrorMessage, isTestEnvironment]
  );

  const refreshAuth = useCallback(async () => {
    const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
    if (!shouldUseFirebase) {
      return;
    }
    // 実装...
  }, [isTestEnvironment]);

  // Test-expected method names - create stable aliases
  const login = useMemo(() => signIn, [signIn]);
  const register = useMemo(
    () => (email: string, password: string, displayName: string) => {
      return signUp(displayName, email, password);
    },
    [signUp]
  );
  const logout = useMemo(() => signOut, [signOut]);

  // Create stable context value
  const contextValue = useMemo(
    () => ({
      // 基本認証状態
      isAuthenticated,
      user,
      isLoading: loading,
      loading, // Keep for backward compatibility
      isFirebaseEnabled,
      error,

      // 認証アクション - Test expected names
      login,
      register,
      logout,
      updateProfile,
      resetPassword,

      // 認証アクション - Original names for backward compatibility
      signIn,
      signUp,
      signInWithGoogle,
      signOut,

      // セッション管理
      refreshAuth,
      sessionExpired,
    }),
    [
      isAuthenticated,
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      resetPassword,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshAuth,
      sessionExpired,
    ]
  );

  return (
    <FirebaseAuthContext.Provider value={contextValue}>{children}</FirebaseAuthContext.Provider>
  );
}

export const useFirebaseAuth = () => {
  const context = React.useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export { FirebaseAuthContext };
