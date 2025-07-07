import axios from 'axios';
import { api, USE_MOCK_DATA, clearTokenCache } from '../apiConfig';
import { fetchTokenFromDB } from '../tokenService';
import { getEnv, getBooleanEnv, isDev, isProd } from '../../../utils/env';
import { logger } from '../../../utils/logger';

// Mock dependencies
jest.mock('axios');
jest.mock('../tokenService');
jest.mock('../../../utils/env');
jest.mock('../../../utils/logger');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFetchTokenFromDB = fetchTokenFromDB as jest.MockedFunction<typeof fetchTokenFromDB>;
const mockedGetEnv = getEnv as jest.MockedFunction<typeof getEnv>;
const mockedGetBooleanEnv = getBooleanEnv as jest.MockedFunction<typeof getBooleanEnv>;
const mockedIsDev = isDev as jest.MockedFunction<typeof isDev>;
const mockedIsProd = isProd as jest.MockedFunction<typeof isProd>;
const mockedLogger = logger as jest.Mocked<typeof logger>;

// Mock axios create
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
  defaults: {
    baseURL: '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
} as any;

mockedAxios.create.mockReturnValue(mockAxiosInstance);

describe('apiConfig', () => {
  let originalWindow: any;
  let originalConsole: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalConsole = global.console;

    // Mock window
    global.window = {
      location: {
        hostname: 'localhost',
        protocol: 'http:',
      },
      __VITE_USE_MOCK_DATA__: undefined,
      __API_CONNECTION_FAILED__: undefined,
    } as any;

    // Mock console
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    // Reset mocks
    jest.clearAllMocks();

    // Default environment setup
    mockedGetEnv.mockImplementation((key: string) => {
      const envs: { [key: string]: string } = {
        NODE_ENV: 'test',
        VITE_USE_MOCK_DATA: 'false',
        VITE_API_BASE_URL: '',
      };
      return envs[key] || '';
    });

    mockedGetBooleanEnv.mockReturnValue(false);
    mockedIsDev.mockReturnValue(false);
    mockedIsProd.mockReturnValue(false);
  });

  afterEach(() => {
    global.window = originalWindow;
    global.console = originalConsole;
  });

  describe('USE_MOCK_DATA determination', () => {
    it('should use mock data when VITE_USE_MOCK_DATA is true', () => {
      mockedGetBooleanEnv.mockReturnValue(true);

      // Re-import to test the initial configuration
      jest.resetModules();
      const { USE_MOCK_DATA } = require('../apiConfig');

      expect(USE_MOCK_DATA).toBe(true);
    });

    it('should use mock data when window.__VITE_USE_MOCK_DATA__ is true', () => {
      global.window.__VITE_USE_MOCK_DATA__ = 'true';

      jest.resetModules();
      const { USE_MOCK_DATA } = require('../apiConfig');

      expect(USE_MOCK_DATA).toBe(true);
    });

    it('should use mock data in development on localhost', () => {
      mockedIsDev.mockReturnValue(true);
      global.window.location.hostname = 'localhost';

      jest.resetModules();
      const { USE_MOCK_DATA } = require('../apiConfig');

      expect(USE_MOCK_DATA).toBe(true);
    });

    it('should use mock data in development on 127.0.0.1', () => {
      mockedIsDev.mockReturnValue(true);
      global.window.location.hostname = '127.0.0.1';

      jest.resetModules();
      const { USE_MOCK_DATA } = require('../apiConfig');

      expect(USE_MOCK_DATA).toBe(true);
    });

    it('should use mock data in production without proper API URL', () => {
      global.window.location.hostname = 'work-time-tracker-5d9q.vercel.app';
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'VITE_API_BASE_URL') return 'http://localhost:3001';
        return '';
      });

      jest.resetModules();
      const { USE_MOCK_DATA } = require('../apiConfig');

      expect(USE_MOCK_DATA).toBe(true);
    });
  });

  describe('Base URL configuration', () => {
    it('should use production API for production hostname', () => {
      global.window.location.hostname = 'work-time-tracker-5d9q.vercel.app';

      jest.resetModules();
      require('../apiConfig');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://work-time-tracker-5d9q.vercel.app/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use production API for preview hostnames', () => {
      global.window.location.hostname = 'work-time-tracker-5d9q-preview.vercel.app';

      jest.resetModules();
      require('../apiConfig');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://work-time-tracker-5d9q.vercel.app/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use local dev server for localhost in development', () => {
      global.window.location.hostname = 'localhost';
      mockedIsDev.mockReturnValue(true);

      jest.resetModules();
      require('../apiConfig');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3001/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use remote API when VITE_API_BASE_URL contains vercel.app', () => {
      global.window.location.hostname = 'localhost';
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'VITE_API_BASE_URL') return 'https://remote.vercel.app';
        return '';
      });

      jest.resetModules();
      require('../apiConfig');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://remote.vercel.app',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use dynamic API URL as fallback', () => {
      global.window.location.hostname = 'custom-domain.com';
      global.window.location.protocol = 'https:';

      jest.resetModules();
      require('../apiConfig');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom-domain.com/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Health check', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should perform health check in production', async () => {
      global.window.location.hostname = 'work-time-tracker-5d9q.vercel.app';
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'healthy' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      jest.resetModules();
      require('../apiConfig');

      jest.advanceTimersByTime(1000);

      await Promise.resolve(); // Let promises resolve

      expect(global.fetch).toHaveBeenCalledWith(
        'https://work-time-tracker-5d9q.vercel.app/api/health',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should perform health check in preview environment', async () => {
      global.window.location.hostname = 'work-time-tracker-5d9q-preview.vercel.app';
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'healthy' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      jest.resetModules();
      require('../apiConfig');

      jest.advanceTimersByTime(1000);

      await Promise.resolve();

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle health check errors', async () => {
      global.window.location.hostname = 'work-time-tracker-5d9q.vercel.app';
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      jest.resetModules();
      require('../apiConfig');

      jest.advanceTimersByTime(1000);

      await Promise.resolve();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ 本番環境API接続失敗:'),
        'Connection failed'
      );
    });
  });

  describe('Request interceptor', () => {
    let requestInterceptor: any;

    beforeEach(() => {
      jest.resetModules();
      require('../apiConfig');
      requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    });

    it('should skip token authentication in development', async () => {
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return '';
      });

      const config = { url: '/api/test', headers: {} };
      const result = await requestInterceptor(config);

      expect(result).toBe(config);
      expect(mockedFetchTokenFromDB).not.toHaveBeenCalled();
    });

    it('should skip token authentication in test environment', async () => {
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        return '';
      });

      const config = { url: '/api/test', headers: {} };
      const result = await requestInterceptor(config);

      expect(result).toBe(config);
      expect(mockedFetchTokenFromDB).not.toHaveBeenCalled();
    });

    it('should skip token for auth/token endpoints', async () => {
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return '';
      });

      const config = { url: '/auth/token', headers: {} };
      const result = await requestInterceptor(config);

      expect(result).toBe(config);
      expect(mockedFetchTokenFromDB).not.toHaveBeenCalled();
    });

    it('should add token to request headers', async () => {
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return '';
      });
      mockedFetchTokenFromDB.mockResolvedValue('test-token');

      const config = { url: '/api/test', headers: {} };
      const result = await requestInterceptor(config);

      expect(mockedFetchTokenFromDB).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should add admin header for admin endpoints', async () => {
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return '';
      });
      mockedFetchTokenFromDB.mockResolvedValue('admin-token');

      const config = { url: '/admin/users', headers: {} };
      const result = await requestInterceptor(config);

      expect(result.headers['X-Admin-Request']).toBe('true');
    });

    it('should handle token fetch failure', async () => {
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return '';
      });
      mockedFetchTokenFromDB.mockRejectedValue(new Error('Token fetch failed'));

      const config = { url: '/api/test', headers: {} };
      const result = await requestInterceptor(config);

      expect(result).toBe(config);
      expect(console.warn).toHaveBeenCalledWith(
        'Token fetch failed in interceptor:',
        expect.any(Error)
      );
    });

    it('should wait for ongoing token fetch', async () => {
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return '';
      });

      let resolveToken: (value: string) => void;
      const tokenPromise = new Promise<string>((resolve) => {
        resolveToken = resolve;
      });
      mockedFetchTokenFromDB.mockReturnValue(tokenPromise);

      const config1 = { url: '/api/test1', headers: {} };
      const config2 = { url: '/api/test2', headers: {} };

      const promise1 = requestInterceptor(config1);
      const promise2 = requestInterceptor(config2);

      resolveToken!('shared-token');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.headers.Authorization).toBe('Bearer shared-token');
      expect(result2.headers.Authorization).toBe('Bearer shared-token');
      expect(mockedFetchTokenFromDB).toHaveBeenCalledTimes(1);
    });

    it('should suppress logs for auth and notification endpoints', async () => {
      mockedGetEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return '';
      });

      const authConfig = { url: '/auth/login', method: 'POST', headers: {} };
      const notificationConfig = { url: '/notifications/list', method: 'GET', headers: {} };
      const regularConfig = { url: '/api/users', method: 'GET', headers: {} };

      await requestInterceptor(authConfig);
      await requestInterceptor(notificationConfig);
      await requestInterceptor(regularConfig);

      expect(mockedLogger.debug).toHaveBeenCalledTimes(1);
      expect(mockedLogger.debug).toHaveBeenCalledWith('API', 'GET /api/users');
    });
  });

  describe('Response interceptor', () => {
    let responseInterceptor: any;
    let errorInterceptor: any;

    beforeEach(() => {
      jest.resetModules();
      require('../apiConfig');
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      responseInterceptor = interceptorCall[0];
      errorInterceptor = interceptorCall[1];
    });

    it('should normalize books API response', () => {
      const response = {
        data: {
          books: [{ id: 1, title: 'Test Book' }],
        },
        config: {
          url: '/books',
          method: 'get',
        },
      };

      const result = responseInterceptor(response);

      expect(result.data).toEqual([{ id: 1, title: 'Test Book' }]);
    });

    it('should normalize nested data response', () => {
      const response = {
        data: {
          data: [{ id: 1, title: 'Test Book' }],
        },
        config: {
          url: '/books',
          method: 'get',
        },
      };

      const result = responseInterceptor(response);

      expect(result.data).toEqual([{ id: 1, title: 'Test Book' }]);
    });

    it('should suppress logs for auth endpoints', () => {
      const response = {
        data: {},
        status: 200,
        config: {
          url: '/auth/login',
        },
      };

      responseInterceptor(response);

      expect(mockedLogger.debug).not.toHaveBeenCalled();
    });

    it('should log response for regular endpoints', () => {
      const response = {
        data: {},
        status: 200,
        config: {
          url: '/api/users',
        },
      };

      responseInterceptor(response);

      expect(mockedLogger.debug).toHaveBeenCalledWith('API', '200 /api/users');
    });

    it('should clear token cache on 401 error', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          url: '/api/protected',
        },
      };

      expect(() => errorInterceptor(error)).rejects.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        'Authentication error detected, clearing token cache'
      );
    });

    it('should clear token cache on 403 error', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
        config: {
          url: '/api/admin',
        },
      };

      expect(() => errorInterceptor(error)).rejects.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        'Authentication error detected, clearing token cache'
      );
    });

    it('should handle connection errors in production', () => {
      global.window.location.hostname = 'work-time-tracker-5d9q.vercel.app';
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
        config: {
          url: '/api/test',
        },
      };

      expect(() => errorInterceptor(error)).rejects.toThrow();
      expect(console.warn).toHaveBeenCalledWith('⚠️ Server connection failed:', expect.any(Object));
      expect(console.warn).toHaveBeenCalledWith(
        '💡 本番環境: APIサーバーに接続できません。デモモードの利用を検討してください。'
      );
      expect(global.window.__API_CONNECTION_FAILED__).toBe(true);
    });

    it('should handle connection errors in development', () => {
      mockedIsDev.mockReturnValue(true);
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
        config: {
          url: '/api/test',
        },
      };

      // Mock baseURL to include localhost:3001
      jest.doMock('../apiConfig', () => ({
        ...jest.requireActual('../apiConfig'),
        api: {
          ...mockAxiosInstance,
          defaults: {
            baseURL: 'http://localhost:3001/api',
          },
        },
      }));

      expect(() => errorInterceptor(error)).rejects.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        '💡 Hint: Make sure your development server is running on http://localhost:3001'
      );
    });

    it('should log API errors for regular responses', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
        config: {
          url: '/api/test',
        },
      };

      expect(() => errorInterceptor(error)).rejects.toThrow();
      expect(mockedLogger.error).toHaveBeenCalledWith('API', '500 /api/test', {
        message: 'Internal Server Error',
      });
    });
  });

  describe('Token cache management', () => {
    it('should clear token cache', () => {
      clearTokenCache();

      expect(console.log).toHaveBeenCalledWith('Token cache cleared');
    });
  });

  describe('Console logging', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should log configuration information', () => {
      jest.resetModules();
      require('../apiConfig');

      expect(console.log).toHaveBeenCalledWith('🔧 Determining API Configuration...');
      expect(console.log).toHaveBeenCalledWith('📋 Environment:', expect.any(Object));
    });

    it('should log mock data mode', () => {
      mockedGetBooleanEnv.mockReturnValue(true);

      jest.resetModules();
      require('../apiConfig');

      expect(console.log).toHaveBeenCalledWith(
        '🎭 モックデータモード有効: APIサーバーへの接続は行わず、ローカルのモックデータを使用します'
      );
    });

    it('should log API connection mode', () => {
      mockedGetBooleanEnv.mockReturnValue(false);

      jest.resetModules();
      require('../apiConfig');

      expect(console.log).toHaveBeenCalledWith(
        '🌐 API接続モード有効: 実際のAPIサーバーに接続します'
      );
    });

    it('should log hostname and final API URL', () => {
      global.window.location.hostname = 'localhost';

      jest.resetModules();
      require('../apiConfig');

      expect(console.log).toHaveBeenCalledWith('🌐 Current hostname:', 'localhost');
      expect(console.log).toHaveBeenCalledWith('🔗 Final API Base URL:', expect.any(String));
    });
  });
});
