import { TokenManager } from '../TokenManager';
import { api } from '@/services/api/apiConfig';

// APIのモック設定
jest.mock('@/services/api/apiConfig', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  },
}));

jest.mock('@/services/ErrorRecoveryService', () => ({
  ErrorRecoveryService: {
    handleAuthenticationError: jest.fn().mockResolvedValue(false),
  },
}));

// Fetch API のモック
global.fetch = jest.fn();

describe('TokenManager', () => {
  let tokenManager: TokenManager;

  // 本番環境をシミュレート
  const originalLocation = window.location;
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // window.location をモック
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      hostname: 'myapp.vercel.app',
      origin: 'https://myapp.vercel.app',
    } as Location;

    // 本番環境に設定
    process.env.NODE_ENV = 'production';
  });

  afterAll(() => {
    window.location = originalLocation;
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Fetch のモック設定
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });

    tokenManager = TokenManager.getInstance();

    // 各テスト前にトークンをクリア（Singletonパターン対応）
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });
    await tokenManager.clearTokens();

    // Authorization ヘッダーもクリア
    delete api.defaults.headers.common['Authorization'];
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = TokenManager.getInstance();
      const instance2 = TokenManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('setTokens', () => {
    it('should set tokens and save to storage', async () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';
      const expiresIn = 3600;
      const refreshExpiresIn = 604800;

      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      await tokenManager.setTokens(accessToken, refreshToken, expiresIn, refreshExpiresIn);

      expect(api.post).toHaveBeenCalledWith('/auth/tokens', {
        accessToken,
        refreshToken,
        expiresAt: expect.any(Number),
        refreshExpiresAt: expect.any(Number),
      });

      expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${accessToken}`);
    });

    it('should handle storage save failures gracefully', async () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';

      (api.post as jest.Mock).mockRejectedValue(new Error('Storage failed'));

      // Should not throw
      await expect(tokenManager.setTokens(accessToken, refreshToken)).resolves.toBeUndefined();

      expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${accessToken}`);
    });
  });

  describe('getAccessToken', () => {
    it('should return valid access token', async () => {
      const accessToken = 'valid-token-123';
      const refreshToken = 'refresh-token-456';

      // トークンの有効期限を1時間後に設定
      const expiresIn = 3600;

      (api.post as jest.Mock).mockResolvedValue({ data: {} });
      await tokenManager.setTokens(accessToken, refreshToken, expiresIn);

      const result = await tokenManager.getAccessToken();

      expect(result).toBe(accessToken);
    });

    it('should return null when no tokens available', async () => {
      // トークンがクリアされている状態で確認
      expect(tokenManager.isAuthenticated()).toBe(false);

      const result = await tokenManager.getAccessToken();
      expect(result).toBeNull();
    });

    it('should refresh expired access token', async () => {
      const oldAccessToken = 'old-token';
      const newAccessToken = 'new-token';
      const refreshToken = 'refresh-token';

      // まずは期限切れのトークンを設定
      (api.post as jest.Mock).mockResolvedValue({ data: {} });
      // 期限切れトークンを設定（-1秒で既に期限切れ）
      await tokenManager.setTokens(oldAccessToken, refreshToken, -1, 604800);

      // リフレッシュAPIのモックを設定
      jest.clearAllMocks(); // 前の呼び出しをクリア
      (api.post as jest.Mock).mockResolvedValue({
        data: {
          accessToken: newAccessToken,
          refreshToken: refreshToken,
          expiresIn: 3600,
          refreshExpiresIn: 604800,
        },
      });

      const result = await tokenManager.getAccessToken();

      expect(api.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken,
      });
      expect(result).toBe(newAccessToken);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid tokens exist', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      (api.post as jest.Mock).mockResolvedValue({ data: {} });
      await tokenManager.setTokens(accessToken, refreshToken, 3600, 604800);

      expect(tokenManager.isAuthenticated()).toBe(true);
    });

    it('should return false when no tokens exist', () => {
      // beforeEach でトークンがクリアされているはず
      expect(tokenManager.isAuthenticated()).toBe(false);
    });

    it('should return false when refresh token is expired', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      (api.post as jest.Mock).mockResolvedValue({ data: {} });
      await tokenManager.setTokens(accessToken, refreshToken, 3600, -1); // 期限切れ

      expect(tokenManager.isAuthenticated()).toBe(false);
    });
  });

  describe('clearTokens', () => {
    it('should clear all tokens and call API', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      (api.post as jest.Mock).mockResolvedValue({ data: {} });
      (api.delete as jest.Mock).mockResolvedValue({ data: {} });

      await tokenManager.setTokens(accessToken, refreshToken);

      // モックをクリアしてから clearTokens をテスト
      jest.clearAllMocks();
      (api.delete as jest.Mock).mockResolvedValue({ data: {} });

      await tokenManager.clearTokens();

      expect(api.delete).toHaveBeenCalledWith('/auth/tokens');
      expect(tokenManager.isAuthenticated()).toBe(false);
      expect(api.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should handle API deletion failures gracefully', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      (api.post as jest.Mock).mockResolvedValue({ data: {} });
      await tokenManager.setTokens(accessToken, refreshToken);

      // API削除の失敗をモック
      (api.delete as jest.Mock).mockRejectedValue(new Error('API failed'));

      // Should not throw
      await expect(tokenManager.clearTokens()).resolves.toBeUndefined();

      expect(tokenManager.isAuthenticated()).toBe(false);
    });
  });

  describe('getSessionInfo', () => {
    it('should return session information', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      (api.post as jest.Mock).mockResolvedValue({ data: {} });
      await tokenManager.setTokens(accessToken, refreshToken, 3600, 604800);

      const sessionInfo = tokenManager.getSessionInfo();

      expect(sessionInfo.isAuthenticated).toBe(true);
      expect(sessionInfo.expiresAt).toBeInstanceOf(Date);
      expect(sessionInfo.refreshExpiresAt).toBeInstanceOf(Date);
      expect(sessionInfo.timeUntilExpiry).toBeGreaterThan(0);
      expect(sessionInfo.timeUntilRefreshExpiry).toBeGreaterThan(0);
    });

    it('should return empty session info when not authenticated', () => {
      // beforeEach でトークンがクリアされている状態
      const sessionInfo = tokenManager.getSessionInfo();

      expect(sessionInfo.isAuthenticated).toBe(false);
      expect(sessionInfo.expiresAt).toBeNull();
      expect(sessionInfo.refreshExpiresAt).toBeNull();
      expect(sessionInfo.timeUntilExpiry).toBe(0);
      expect(sessionInfo.timeUntilRefreshExpiry).toBe(0);
    });
  });

  describe('development environment', () => {
    beforeAll(() => {
      // 開発環境に設定
      process.env.NODE_ENV = 'development';
      window.location.hostname = 'localhost';
    });

    afterAll(() => {
      // 本番環境に戻す
      process.env.NODE_ENV = 'production';
      window.location.hostname = 'myapp.vercel.app';
    });

    it('should disable token management in development', async () => {
      const devTokenManager = TokenManager.getInstance();

      await devTokenManager.setTokens('token', 'refresh', 3600, 604800);

      // 開発環境ではAPI呼び出しが無効化される
      expect(api.post).not.toHaveBeenCalled();
    });
  });
});
