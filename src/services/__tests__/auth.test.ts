import { authApi, LoginCredentials } from '../auth';
import { api } from '../api';
import { User } from '@/types';

// api モジュールをモック
jest.mock('../api', () => ({
  api: {
    post: jest.fn(),
  },
}));

// localStorage をモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authApi', () => {
  const mockApiPost = api.post as jest.MockedFunction<typeof api.post>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('login', () => {
    const mockCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      } as User,
    };

    it('should call api.post with correct parameters', async () => {
      mockApiPost.mockResolvedValue(mockResponse);

      const result = await authApi.login(mockCredentials);

      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', mockCredentials);
      expect(result).toEqual(mockResponse);
    });

    it('should handle login with different credentials', async () => {
      const differentCredentials: LoginCredentials = {
        email: 'another@example.com',
        password: 'differentpass',
      };

      mockApiPost.mockResolvedValue(mockResponse);

      await authApi.login(differentCredentials);

      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', differentCredentials);
    });

    it('should throw error when api.post fails', async () => {
      const error = new Error('Login failed');
      mockApiPost.mockRejectedValue(error);

      await expect(authApi.login(mockCredentials)).rejects.toThrow('Login failed');
    });

    it('should handle empty credentials', async () => {
      const emptyCredentials: LoginCredentials = {
        email: '',
        password: '',
      };

      mockApiPost.mockResolvedValue(mockResponse);

      await authApi.login(emptyCredentials);

      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', emptyCredentials);
    });

    it('should handle special characters in credentials', async () => {
      const specialCredentials: LoginCredentials = {
        email: 'test+special@example.com',
        password: 'p@ssw0rd!#$',
      };

      mockApiPost.mockResolvedValue(mockResponse);

      await authApi.login(specialCredentials);

      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', specialCredentials);
    });
  });

  describe('register', () => {
    const mockUserData = {
      email: 'newuser@example.com',
      password: 'newpassword123',
      name: 'New User',
    };

    const mockResponse = {
      token: 'new-jwt-token',
      user: {
        id: '2',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
      } as User,
    };

    it('should call api.post with correct parameters', async () => {
      mockApiPost.mockResolvedValue(mockResponse);

      const result = await authApi.register(mockUserData);

      expect(mockApiPost).toHaveBeenCalledWith('/auth/register', mockUserData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration with minimum required fields', async () => {
      const minimalUserData = {
        email: 'minimal@example.com',
        password: 'pass123',
        name: 'M',
      };

      mockApiPost.mockResolvedValue(mockResponse);

      await authApi.register(minimalUserData);

      expect(mockApiPost).toHaveBeenCalledWith('/auth/register', minimalUserData);
    });

    it('should handle registration with long name', async () => {
      const longNameUserData = {
        email: 'longname@example.com',
        password: 'password123',
        name: 'A'.repeat(100),
      };

      mockApiPost.mockResolvedValue(mockResponse);

      await authApi.register(longNameUserData);

      expect(mockApiPost).toHaveBeenCalledWith('/auth/register', longNameUserData);
    });

    it('should throw error when registration fails', async () => {
      const error = new Error('Registration failed');
      mockApiPost.mockRejectedValue(error);

      await expect(authApi.register(mockUserData)).rejects.toThrow('Registration failed');
    });

    it('should handle special characters in user data', async () => {
      const specialUserData = {
        email: 'special+chars@test-domain.co.jp',
        password: 'Special123!@#',
        name: 'José María',
      };

      mockApiPost.mockResolvedValue(mockResponse);

      await authApi.register(specialUserData);

      expect(mockApiPost).toHaveBeenCalledWith('/auth/register', specialUserData);
    });
  });

  describe('logout', () => {
    it('should remove token and user from localStorage', () => {
      // localStorage にデータを設定
      localStorageMock.setItem('token', 'some-token');
      localStorageMock.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));

      authApi.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('should handle logout when no data in localStorage', () => {
      authApi.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('should not throw error when called multiple times', () => {
      expect(() => {
        authApi.logout();
        authApi.logout();
        authApi.logout();
      }).not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    it('should return user from localStorage when valid JSON', () => {
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const result = authApi.getCurrentUser();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authApi.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null when user data is invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = authApi.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null when user data is empty string', () => {
      localStorageMock.getItem.mockReturnValue('');

      const result = authApi.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should handle complex user objects', () => {
      const complexUser: User = {
        id: '123',
        email: 'complex@example.com',
        name: 'Complex User',
        role: 'admin',
        avatar: 'https://example.com/avatar.jpg',
        lastLoginAt: '2024-01-15T10:30:00Z',
        preferences: {
          theme: 'dark',
          language: 'ja',
        },
      };

      localStorageMock.setItem('user', JSON.stringify(complexUser));

      const result = authApi.getCurrentUser();

      expect(result).toEqual(complexUser);
    });
  });

  describe('setCurrentUser', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    const mockToken = 'jwt-token-123';

    it('should set token and user in localStorage', () => {
      authApi.setCurrentUser(mockUser, mockToken);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should handle user with special characters', () => {
      const specialUser: User = {
        id: '2',
        email: 'special+user@test.com',
        name: 'Special ユーザー',
        role: 'user',
      };

      authApi.setCurrentUser(specialUser, mockToken);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(specialUser));
    });

    it('should handle empty token', () => {
      authApi.setCurrentUser(mockUser, '');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', '');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should handle user with null/undefined properties', () => {
      const partialUser: User = {
        id: '3',
        email: 'partial@example.com',
        name: 'Partial User',
        role: 'user',
        avatar: undefined,
        lastLoginAt: null,
      };

      authApi.setCurrentUser(partialUser, mockToken);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(partialUser));
    });

    it('should overwrite existing user data', () => {
      // 最初のユーザーを設定
      const firstUser: User = {
        id: '1',
        email: 'first@example.com',
        name: 'First User',
        role: 'user',
      };
      authApi.setCurrentUser(firstUser, 'first-token');

      // 新しいユーザーで上書き
      const secondUser: User = {
        id: '2',
        email: 'second@example.com',
        name: 'Second User',
        role: 'admin',
      };
      authApi.setCurrentUser(secondUser, 'second-token');

      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('token', 'second-token');
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('user', JSON.stringify(secondUser));
    });
  });

  describe('integration tests', () => {
    it('should perform complete login flow', async () => {
      const credentials: LoginCredentials = {
        email: 'integration@example.com',
        password: 'integrationpass',
      };

      const loginResponse = {
        token: 'integration-token',
        user: {
          id: 'int-1',
          email: 'integration@example.com',
          name: 'Integration User',
          role: 'user',
        } as User,
      };

      mockApiPost.mockResolvedValue(loginResponse);

      // ログイン実行
      const result = await authApi.login(credentials);

      // レスポンス確認
      expect(result).toEqual(loginResponse);

      // ユーザー情報を localStorage に保存
      authApi.setCurrentUser(result.user, result.token);

      // 保存されたユーザー情報を取得
      const currentUser = authApi.getCurrentUser();
      expect(currentUser).toEqual(loginResponse.user);

      // ログアウト
      authApi.logout();

      // ログアウト後はユーザー情報が取得できない
      const afterLogoutUser = authApi.getCurrentUser();
      expect(afterLogoutUser).toBeNull();
    });

    it('should handle register and immediate logout', async () => {
      const userData = {
        email: 'register@example.com',
        password: 'registerpass',
        name: 'Register User',
      };

      const registerResponse = {
        token: 'register-token',
        user: {
          id: 'reg-1',
          email: 'register@example.com',
          name: 'Register User',
          role: 'user',
        } as User,
      };

      mockApiPost.mockResolvedValue(registerResponse);

      // 登録実行
      const result = await authApi.register(userData);
      authApi.setCurrentUser(result.user, result.token);

      // 登録直後のユーザー取得
      const registeredUser = authApi.getCurrentUser();
      expect(registeredUser).toEqual(registerResponse.user);

      // すぐにログアウト
      authApi.logout();

      // ログアウト後の確認
      const afterLogoutUser = authApi.getCurrentUser();
      expect(afterLogoutUser).toBeNull();
    });
  });
});
