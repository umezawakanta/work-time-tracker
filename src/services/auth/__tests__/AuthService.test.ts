import AuthService from '../AuthService';
import { auth, db } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AuthUser, AuthError } from '@/types/auth';

// Firebase のモック設定
jest.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

describe('AuthService', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    metadata: {
      creationTime: '2023-01-01T00:00:00.000Z',
      lastSignInTime: '2023-01-01T00:00:00.000Z',
    },
  };

  const mockUserDoc = {
    exists: () => true,
    data: () => ({
      isPremium: false,
      subscriptionStatus: 'free',
      createdAt: { toDate: () => new Date('2023-01-01') },
      lastLoginAt: { toDate: () => new Date('2023-01-01') },
      preferences: {
        theme: 'system',
        language: 'ja',
        timezone: 'Asia/Tokyo',
        notifications: {
          email: true,
          push: true,
          daily: true,
          weekly: true,
        },
      },
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDoc as jest.Mock).mockResolvedValue(mockUserDoc);
    (serverTimestamp as jest.Mock).mockReturnValue('mock-timestamp');
  });

  describe('signUp', () => {
    it('should successfully create a new user account', async () => {
      const mockCredential = { user: mockUser };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockCredential);
      (updateProfile as jest.Mock).mockResolvedValue(undefined);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.signUp('test@example.com', 'password123', 'Test User');

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.displayName).toBe('Test User');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' });
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          email: 'test@example.com',
          displayName: 'Test User',
          isPremium: false,
          subscriptionStatus: 'free',
        })
      );
    });

    it('should handle email already in use error', async () => {
      const firebaseError = { code: 'auth/email-already-in-use' };
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(firebaseError);

      const result = await AuthService.signUp('existing@example.com', 'password123', 'Test User');

      expect(result.user).toBeNull();
      expect(result.error).toEqual({
        code: 'EMAIL_EXISTS',
        message: 'このメールアドレスは既に使用されています',
      });
    });

    it('should handle weak password error', async () => {
      const firebaseError = { code: 'auth/weak-password' };
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(firebaseError);

      const result = await AuthService.signUp('test@example.com', '123', 'Test User');

      expect(result.user).toBeNull();
      expect(result.error).toEqual({
        code: 'WEAK_PASSWORD',
        message: 'パスワードは6文字以上で設定してください',
      });
    });
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockCredential = { user: mockUser };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockCredential);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.signIn('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
        lastLoginAt: 'mock-timestamp',
      });
    });

    it('should handle user not found error', async () => {
      const firebaseError = { code: 'auth/user-not-found' };
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(firebaseError);

      const result = await AuthService.signIn('nonexistent@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).toEqual({
        code: 'USER_NOT_FOUND',
        message: 'ユーザーが見つかりません',
      });
    });

    it('should handle wrong password error', async () => {
      const firebaseError = { code: 'auth/wrong-password' };
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(firebaseError);

      const result = await AuthService.signIn('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.error).toEqual({
        code: 'WRONG_PASSWORD',
        message: 'パスワードが正しくありません',
      });
    });
  });

  describe('signInWithGoogle', () => {
    it('should successfully sign in with Google for new user', async () => {
      const mockCredential = { user: mockUser };
      (signInWithPopup as jest.Mock).mockResolvedValue(mockCredential);
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.signInWithGoogle();

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null,
          isPremium: false,
          subscriptionStatus: 'free',
        })
      );
    });

    it('should handle popup closed by user error', async () => {
      const firebaseError = { code: 'auth/popup-closed-by-user' };
      (signInWithPopup as jest.Mock).mockRejectedValue(firebaseError);

      const result = await AuthService.signInWithGoogle();

      expect(result.user).toBeNull();
      expect(result.error).toEqual({
        code: 'POPUP_CLOSED',
        message: 'ログイン画面が閉じられました',
      });
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await AuthService.signOut();

      expect(signOut).toHaveBeenCalledWith(auth);
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.resetPassword('test@example.com');

      expect(result).toBeNull();
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
    });

    it('should handle user not found error in password reset', async () => {
      const firebaseError = { code: 'auth/user-not-found' };
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(firebaseError);

      const result = await AuthService.resetPassword('nonexistent@example.com');

      expect(result).toEqual({
        code: 'USER_NOT_FOUND',
        message: 'ユーザーが見つかりません',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      (auth as any).currentUser = mockUser;

      const result = AuthService.getCurrentUser();

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(result?.displayName).toBe('Test User');
    });

    it('should return null when not authenticated', () => {
      (auth as any).currentUser = null;

      const result = AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('error mapping', () => {
    it('should handle unknown Firebase errors', async () => {
      const unknownError = { code: 'auth/unknown-error', message: 'Unknown error occurred' };
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(unknownError);

      const result = await AuthService.signIn('test@example.com', 'password123');

      expect(result.error).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred',
      });
    });
  });
});
