// src/services/auth/AuthService.ts
import { auth, db } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { AuthUser, AuthError, AuthResponse } from '@/types/auth';

class AuthService {
  private googleProvider: GoogleAuthProvider;
  private authStateListeners: Set<(user: AuthUser | null) => void>;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.authStateListeners = new Set();
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    onAuthStateChanged(auth, async (firebaseUser) => {
      const user = firebaseUser ? await this.mapFirebaseUserToAuthUser(firebaseUser) : null;
      this.notifyAuthStateListeners(user);
    });
  }

  private notifyAuthStateListeners(user: AuthUser | null): void {
    this.authStateListeners.forEach((listener) => listener(user));
  }

  public subscribeToAuthState(listener: (user: AuthUser | null) => void): Unsubscribe {
    this.authStateListeners.add(listener);
    return () => {
      this.authStateListeners.delete(listener);
    };
  }

  private formatTimestamp(timestamp: Timestamp | string | null | undefined): string {
    if (!timestamp) return new Date().toISOString();

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }

    if (typeof timestamp === 'string') {
      return timestamp;
    }

    return new Date().toISOString();
  }

  private async mapFirebaseUserToAuthUser(firebaseUser: User): Promise<AuthUser> {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || userData?.displayName || '',
      photoURL: firebaseUser.photoURL || userData?.photoURL || null,
      emailVerified: firebaseUser.emailVerified,
      isPremium: userData?.isPremium || false,
      subscriptionStatus: userData?.subscriptionStatus || 'free',
      createdAt: this.formatTimestamp(userData?.createdAt || firebaseUser.metadata.creationTime),
      lastLoginAt: this.formatTimestamp(
        userData?.lastLoginAt || firebaseUser.metadata.lastSignInTime
      ),
      preferences: userData?.preferences || this.getDefaultPreferences(),
      _id: firebaseUser.uid,
      id: firebaseUser.uid,
      name: firebaseUser.displayName || '',
      username: firebaseUser.email?.split('@')[0] || '',
      isAdmin: false,
      permissions: ['read', 'write'],
      roles: ['user'],
      lastActivityAt: new Date(),
    };
  }

  private getDefaultPreferences(): AuthUser['preferences'] {
    return {
      theme: 'system',
      language: 'ja',
      timezone: 'Asia/Tokyo',
      notifications: {
        email: true,
        push: true,
        daily: true,
        weekly: true,
      },
    };
  }

  public async signUp(email: string, password: string, displayName: string): Promise<AuthResponse> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(user, { displayName });

      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        isPremium: false,
        subscriptionStatus: 'free',
        createdAt: serverTimestamp(),
        preferences: this.getDefaultPreferences(),
      });

      const authUser = await this.mapFirebaseUserToAuthUser(user);

      return {
        user: authUser,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: this.mapFirebaseError(error),
      };
    }
  }

  public async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
      });

      const authUser = await this.mapFirebaseUserToAuthUser(user);

      return {
        user: authUser,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: this.mapFirebaseError(error),
      };
    }
  }

  public async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { user } = await signInWithPopup(auth, this.googleProvider);

      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isPremium: false,
          subscriptionStatus: 'free',
          createdAt: serverTimestamp(),
          preferences: this.getDefaultPreferences(),
        });
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp(),
        });
      }

      const authUser = await this.mapFirebaseUserToAuthUser(user);

      return {
        user: authUser,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: this.mapFirebaseError(error),
      };
    }
  }

  public async signOut(): Promise<void> {
    await signOut(auth);
  }

  public async resetPassword(email: string): Promise<AuthError | null> {
    try {
      await sendPasswordResetEmail(auth, email);
      return null;
    } catch (error) {
      return this.mapFirebaseError(error);
    }
  }

  public getCurrentUser(): AuthUser | null {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      isPremium: false,
      subscriptionStatus: 'free',
      createdAt: this.formatTimestamp(firebaseUser.metadata.creationTime),
      lastLoginAt: this.formatTimestamp(firebaseUser.metadata.lastSignInTime),
      preferences: this.getDefaultPreferences(),
      _id: firebaseUser.uid,
      id: firebaseUser.uid,
      name: firebaseUser.displayName || '',
      username: firebaseUser.email?.split('@')[0] || '',
      isAdmin: false,
      permissions: ['read', 'write'],
      roles: ['user'],
      lastActivityAt: new Date(),
    };
  }

  private mapFirebaseError(error: unknown): AuthError {
    const firebaseError = error as { code?: string; message?: string };

    const errorMap: Record<string, AuthError> = {
      'auth/email-already-in-use': {
        code: 'EMAIL_EXISTS',
        message: 'このメールアドレスは既に使用されています',
      },
      'auth/invalid-email': {
        code: 'INVALID_EMAIL',
        message: 'メールアドレスの形式が正しくありません',
      },
      'auth/operation-not-allowed': {
        code: 'OPERATION_NOT_ALLOWED',
        message: 'この操作は許可されていません',
      },
      'auth/weak-password': {
        code: 'WEAK_PASSWORD',
        message: 'パスワードは6文字以上で設定してください',
      },
      'auth/user-disabled': {
        code: 'USER_DISABLED',
        message: 'このアカウントは無効化されています',
      },
      'auth/user-not-found': {
        code: 'USER_NOT_FOUND',
        message: 'ユーザーが見つかりません',
      },
      'auth/wrong-password': {
        code: 'WRONG_PASSWORD',
        message: 'パスワードが正しくありません',
      },
      'auth/too-many-requests': {
        code: 'TOO_MANY_REQUESTS',
        message: 'ログイン試行回数が多すぎます。しばらくしてから再度お試しください',
      },
      'auth/popup-closed-by-user': {
        code: 'POPUP_CLOSED',
        message: 'ログイン画面が閉じられました',
      },
    };

    return (
      errorMap[firebaseError.code || ''] || {
        code: 'UNKNOWN_ERROR',
        message: firebaseError.message || '予期しないエラーが発生しました',
      }
    );
  }
}

export default new AuthService();
