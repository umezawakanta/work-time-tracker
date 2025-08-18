// Mock dependencies BEFORE importing any modules
jest.mock('axios');
jest.mock('../tokenService');
jest.mock('../../../utils/env');
jest.mock('../../../utils/logger');

import axios from 'axios';
import { fetchTokenFromDB } from '../tokenService';
import { getEnv, getBooleanEnv, isDev, isProd } from '../../../utils/env';
import { logger } from '../../../utils/logger';

// Create properly typed mocks
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFetchTokenFromDB = fetchTokenFromDB as jest.MockedFunction<typeof fetchTokenFromDB>;
const mockedGetEnv = getEnv as jest.MockedFunction<typeof getEnv>;
const mockedGetBooleanEnv = getBooleanEnv as jest.MockedFunction<typeof getBooleanEnv>;
const mockedIsDev = isDev as jest.MockedFunction<typeof isDev>;
const mockedIsProd = isProd as jest.MockedFunction<typeof isProd>;
const mockedLogger = logger as jest.Mocked<typeof logger>;

// Create mock axios instance with proper interceptors
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
  defaults: {
    baseURL: '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  request: jest.fn(),
};

// Set up the axios mock BEFORE any module imports
mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

// Mock environment functions with default values
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

// Mock logger
mockedLogger.debug.mockImplementation(() => {});
mockedLogger.error.mockImplementation(() => {});

// Mock token service
mockedFetchTokenFromDB.mockResolvedValue('test-token');

// Mock global objects
Object.defineProperty(global, 'window', {
  value: {
    location: {
      hostname: 'localhost',
      protocol: 'http:',
    },
    __VITE_USE_MOCK_DATA__: undefined,
    __API_CONNECTION_FAILED__: undefined,
  },
  writable: true,
  configurable: true,
});

// Mock console to avoid noise in tests
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
} as any;

// Mock fetch globally
global.fetch = jest.fn();

describe('apiConfig', () => {
  let api: any;
  let USE_MOCK_DATA: any;
  let clearTokenCache: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset modules to get fresh imports
    jest.resetModules();

    // Re-import the module after clearing
    const apiConfigModule = require('../apiConfig');
    api = apiConfigModule.api;
    USE_MOCK_DATA = apiConfigModule.USE_MOCK_DATA;
    clearTokenCache = apiConfigModule.clearTokenCache;
  });

  describe('USE_MOCK_DATA determination', () => {
    it.skip('should use mock data when VITE_USE_MOCK_DATA is true', () => {
      mockedGetBooleanEnv.mockReturnValue(true);

      // Re-import to test the initial configuration
      jest.resetModules();
      const { USE_MOCK_DATA } = require('../apiConfig');

      expect(USE_MOCK_DATA).toBe(true);
    });

    it('should use mock data when window.__VITE_USE_MOCK_DATA__ is true', () => {
      (global.window as any).__VITE_USE_MOCK_DATA__ = 'true';

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
    it.skip('should use production API for production hostname', () => {
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

    it.skip('should use production API for preview hostnames', () => {
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

    it.skip('should use local dev server for localhost in development', () => {
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

    it.skip('should use remote API when VITE_API_BASE_URL contains vercel.app', () => {
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

    it.skip('should use dynamic API URL as fallback', () => {
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

  describe('Axios instance creation', () => {
    it.skip('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3001/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it.skip('should set up request interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it.skip('should set up response interceptors', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Token cache management', () => {
    it('should clear token cache when clearTokenCache is called', () => {
      expect(clearTokenCache).toBeDefined();
      expect(typeof clearTokenCache).toBe('function');

      // Should not throw when called
      expect(() => clearTokenCache()).not.toThrow();
    });
  });

  describe('Console logging', () => {
    it('should log configuration information', () => {
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

    it.skip('should log API connection mode', () => {
      mockedGetBooleanEnv.mockReturnValue(false);
      jest.resetModules();
      require('../apiConfig');

      expect(console.log).toHaveBeenCalledWith(
        '🌐 API接続モード有効: 実際のAPIサーバーに接続します'
      );
    });

    it.skip('should log hostname and final API URL', () => {
      expect(console.log).toHaveBeenCalledWith('🌐 Current hostname:', 'localhost');
      expect(console.log).toHaveBeenCalledWith(
        '🔗 Final API Base URL:',
        'http://localhost:3001/api'
      );
    });
  });
});
