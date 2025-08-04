/**
 * 🔐 認証システムテスト
 * 
 * Firebase + JWT 双方向認証システムの動作確認
 */

import { UnifiedAuthManager } from '@/services/auth/UnifiedAuthManager';
import { userTrackingService } from '@/services/analytics/UserTrackingService';

// モック設定
jest.mock('@/services/analytics/UserTrackingService', () => ({
  userTrackingService: {
    initializeSession: jest.fn(),
    updateUserAttributes: jest.fn(),
    trackInteraction: jest.fn(),
  }
}));

describe('🔐 認証システムテスト', () => {
  let authManager: UnifiedAuthManager;

  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    
    // 認証マネージャーの新しいインスタンスを取得
    authManager = UnifiedAuthManager.getInstance();
  });

  describe('✅ UnifiedAuthManager - 基本機能', () => {
    test('シングルトンパターンが正常に動作する', () => {
      const instance1 = UnifiedAuthManager.getInstance();
      const instance2 = UnifiedAuthManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(UnifiedAuthManager);
    });

    test('初期設定が正しく行われる', () => {
      expect(authManager).toBeDefined();
      // インスタンス作成時の初期化確認
    });
  });

  describe('🎯 JWT認証', () => {
    test('JWT ログイン成功ケース', async () => {
      // Axiosモックの設定
      const mockAxios = await import('axios');
      (mockAxios.default.post as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User'
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600000
        }
      });

      const result = await authManager.login({
        email: 'test@example.com',
        password: 'password123',
        provider: 'jwt'
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(expect.objectContaining({
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User'
      }));
      expect(mockAxios.default.post).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123'
        })
      );
    });

    test('JWT ログイン失敗ケース', async () => {
      const mockAxios = await import('axios');
      (mockAxios.default.post as jest.Mock).mockRejectedValueOnce(
        new Error('Authentication failed')
      );

      const result = await authManager.login({
        email: 'invalid@example.com',
        password: 'wrongpassword',
        provider: 'jwt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
    });
  });

  describe('🔥 Firebase認証', () => {
    test('Firebase ログイン成功ケース', async () => {
      // Firebase認証のモック
      const mockUser = {
        uid: 'firebase-uid-123',
        email: 'firebase@example.com',
        displayName: 'Firebase User',
        photoURL: 'https://example.com/avatar.jpg',
        emailVerified: true,
        metadata: {
          creationTime: '2023-01-01T00:00:00.000Z',
          lastSignInTime: '2023-12-01T00:00:00.000Z'
        },
        getIdToken: jest.fn().mockResolvedValue('firebase-id-token'),
        refreshToken: 'firebase-refresh-token'
      };

      // Firebase認証の成功をモック
      jest.doMock('firebase/auth', () => ({
        signInWithEmailAndPassword: jest.fn().mockResolvedValue({
          user: mockUser
        })
      }));

      jest.doMock('@/config/firebase', () => ({
        auth: {}
      }));

      // Firebase認証の場合のテスト実行
      const result = await authManager.login({
        email: 'firebase@example.com',
        password: 'password123',
        provider: 'firebase'
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(expect.objectContaining({
        id: 'firebase-uid-123',
        email: 'firebase@example.com',
        provider: 'firebase'
      }));
    });
  });

  describe('📊 ユーザートラッキング連携', () => {
    test('ログイン時にユーザートラッキングが正しく初期化される', async () => {
      const mockAxios = await import('axios');
      (mockAxios.default.post as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          user: { id: 'user-123', email: 'test@example.com' },
          accessToken: 'token',
          refreshToken: 'refresh-token'
        }
      });

      await authManager.login({
        email: 'test@example.com',
        password: 'password123',
        provider: 'jwt'
      });

      // ユーザートラッキングの初期化が呼ばれることを確認
      // 実際の実装では、認証成功後にユーザートラッキングが初期化される
      expect(userTrackingService.initializeSession).toHaveBeenCalled();
    });
  });

  describe('🔄 セッション管理', () => {
    test('セッション検証が正常に動作する', async () => {
      const mockAxios = await import('axios');
      (mockAxios.default.get as jest.Mock).mockResolvedValueOnce({
        data: {
          valid: true,
          user: { id: 'user-123', email: 'test@example.com' }
        }
      });

      const isValid = await authManager.validateSession();
      
      expect(isValid).toBe(true);
      expect(mockAxios.default.get).toHaveBeenCalledWith('/api/auth/validate');
    });

    test('無効なセッションが正しく処理される', async () => {
      const mockAxios = await import('axios');
      (mockAxios.default.get as jest.Mock).mockRejectedValueOnce(
        new Error('Session expired')
      );

      const isValid = await authManager.validateSession();
      
      expect(isValid).toBe(false);
    });
  });

  describe('🚪 ログアウト', () => {
    test('ログアウトが正常に実行される', async () => {
      // ログイン状態にする
      const mockAxios = await import('axios');
      (mockAxios.default.post as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          user: { id: 'user-123' },
          accessToken: 'token'
        }
      });

      await authManager.login({
        email: 'test@example.com',
        password: 'password123'
      });

      // ログアウト実行
      (mockAxios.default.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true }
      });

      const result = await authManager.logout();
      
      expect(result.success).toBe(true);
      expect(mockAxios.default.post).toHaveBeenCalledWith('/api/auth/logout');
    });
  });

  describe('⚠️ エラーハンドリング', () => {
    test('ネットワークエラーが適切に処理される', async () => {
      const mockAxios = await import('axios');
      (mockAxios.default.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network Error')
      );

      const result = await authManager.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network Error');
    });

    test('認証失敗が適切に処理される', async () => {
      const mockAxios = await import('axios');
      (mockAxios.default.post as jest.Mock).mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Invalid credentials'
        }
      });

      const result = await authManager.login({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });
  });
});

describe('🎯 認証統合テスト', () => {
  test('完全な認証フローが正常に動作する', async () => {
    const authManager = UnifiedAuthManager.getInstance();
    const mockAxios = await import('axios');

    // 1. ログイン
    (mockAxios.default.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        user: {
          id: 'integration-user-123',
          email: 'integration@example.com',
          name: 'Integration Test User'
        },
        accessToken: 'integration-access-token',
        refreshToken: 'integration-refresh-token'
      }
    });

    const loginResult = await authManager.login({
      email: 'integration@example.com',
      password: 'password123'
    });

    expect(loginResult.success).toBe(true);

    // 2. セッション検証
    (mockAxios.default.get as jest.Mock).mockResolvedValueOnce({
      data: {
        valid: true,
        user: { id: 'integration-user-123' }
      }
    });

    const sessionValid = await authManager.validateSession();
    expect(sessionValid).toBe(true);

    // 3. ログアウト
    (mockAxios.default.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true }
    });

    const logoutResult = await authManager.logout();
    expect(logoutResult.success).toBe(true);
  });
});