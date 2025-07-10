import React, { createContext, useState, useEffect, useCallback } from 'react';
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
    // In test environment, always use Firebase (mocked)
    const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;

    if (!shouldUseFirebase) {
      console.warn('🚧 Firebase is not enabled. Using mock authentication for development.');

      // Skip auto dev user creation in test environment
      if (!isTestEnvironment) {
        // 開発環境用のダミーユーザー
        const isDev =
          process.env.NODE_ENV === 'development' ||
          process.env.DEV === 'true' ||
          (typeof window !== 'undefined' && window.location.hostname === 'localhost');

        if (isDev) {
          setUser({
            uid: 'dev-user',
            email: 'dev@example.com',
            displayName: 'Development User',
            isPremium: true,
            photoURL: null,
            emailVerified: true,
            createdAt: new Date().toISOString(),
            _id: 'dev-user-id',
            id: 'dev-user',
            name: 'Development User',
            username: 'dev-user',
            isAdmin: false,
            permissions: ['read', 'write'],
            roles: ['user'],
            lastActivityAt: new Date(),
            subscriptionStatus: 'premium' as const,
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
          });
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
      return;
    }

    // Firebase認証状態のリスナー設定（Firebase有効時のみ）
    if (!auth) {
      console.warn('Firebase auth not available');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const authUser = convertFirebaseUser(firebaseUser);
      setUser(authUser);
      setIsAuthenticated(!!authUser);
      setSessionExpired(false);
      setLoading(false);

      if (authUser) {
        logger.info('Auth', 'User authenticated via Firebase', {
          userId: authUser.uid,
          email: authUser.email,
        });
      }
    });

    return unsubscribe;
  }, [convertFirebaseUser]);

  // 認証メソッドの実装
  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set error helper
  const setErrorMessage = useCallback((message: string) => {
    setError(message);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
      if (!shouldUseFirebase || !auth) {
        const message = 'Firebase認証が設定されていません';
        setErrorMessage(message);
        toast.error(message);
        throw new Error(message);
      }

      setLoading(true);
      clearError();
      try {
        await signInWithEmailAndPassword(auth, email, password);
        clearError();
        toast.success('ログインしました');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setErrorMessage]
  );

  // Test-expected method names
  const login = useCallback(
    async (email: string, password: string) => {
      return signIn(email, password);
    },
    [signIn]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
      if (!shouldUseFirebase || !auth) {
        const message = 'Firebase認証が設定されていません';
        setErrorMessage(message);
        toast.error(message);
        throw new Error(message);
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
        const errorMessage =
          error instanceof Error ? error.message : 'アカウント作成に失敗しました';
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setErrorMessage]
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      return signUp(displayName, email, password);
    },
    [signUp]
  );

  const signInWithGoogle = useCallback(async () => {
    const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
    if (!shouldUseFirebase || !auth) {
      const message = 'Firebase認証が設定されていません';
      setErrorMessage(message);
      toast.error(message);
      throw new Error(message);
    }

    setLoading(true);
    clearError();
    try {
      // For now, just throw an error as Google sign-in requires additional setup
      throw new Error('Google認証は実装中です');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Googleログインに失敗しました';
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearError, setErrorMessage]);

  const signOut = useCallback(async () => {
    const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
    if (!shouldUseFirebase || !auth) {
      setIsAuthenticated(false);
      setUser(null);
      clearError();
      toast.success('ログアウトしました');
      navigate('/firebase-login');
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
      navigate('/firebase-login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'ログアウトに失敗しました';
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate, clearError, setErrorMessage]);

  const logout = useCallback(async () => {
    return signOut();
  }, [signOut]);

  const updateProfile = useCallback(
    async (profileData: { displayName?: string; photoURL?: string }) => {
      const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
      if (!shouldUseFirebase || !auth || !auth.currentUser) {
        const message = 'User not authenticated';
        setErrorMessage(message);
        throw new Error(message);
      }

      setLoading(true);
      clearError();
      try {
        await updateFirebaseProfile(auth.currentUser, profileData);
        clearError();
        toast.success('プロフィールを更新しました');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'プロフィール更新に失敗しました';
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setErrorMessage]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
      if (!shouldUseFirebase || !auth) {
        const message = 'Firebase認証が設定されていません';
        setErrorMessage(message);
        toast.error(message);
        throw new Error(message);
      }

      setLoading(true);
      clearError();
      try {
        await sendPasswordResetEmail(auth, email);
        clearError();
        toast.success('パスワードリセットメールを送信しました');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'パスワードリセットに失敗しました';
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError, setErrorMessage]
  );

  const refreshAuth = useCallback(async () => {
    const shouldUseFirebase = isFirebaseEnabled || isTestEnvironment;
    if (!shouldUseFirebase) {
      return;
    }
    // 実装...
  }, [isTestEnvironment]);

  return (
    <FirebaseAuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export default FirebaseAuthContext;
