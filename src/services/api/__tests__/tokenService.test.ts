import axios from 'axios';
import { fetchTokenFromDB } from '../tokenService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('tokenService', () => {
  let originalWindow: any;
  let originalProcess: any;
  let originalConsole: any;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Store original values
    originalWindow = global.window;
    originalProcess = global.process;
    originalConsole = global.console;

    // Mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Mock console
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
    } as any;

    // Default window mock
    global.window = {
      location: {
        hostname: 'localhost',
        protocol: 'http:',
      },
    } as any;

    // Default process mock
    global.process = {
      env: {
        NODE_ENV: 'test',
      },
    } as any;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.process = originalProcess;
    global.console = originalConsole;
    jest.clearAllMocks();
  });

  describe('fetchTokenFromDB', () => {
    it('should throw error in development environment', async () => {
      Object.defineProperty(global.process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      await expect(fetchTokenFromDB()).rejects.toThrow('Token fetch disabled in development mode');
      expect(console.log).toHaveBeenCalledWith('🚫 Development: Token fetch from DB disabled');
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it('should use production API URL for production hostname', async () => {
      global.window.location.hostname = 'work-time-tracker-5d9q.vercel.app';
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: { token: 'production-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        'https://work-time-tracker-5d9q.vercel.app/api/auth/token'
      );
      expect(result).toBe('production-token');
    });

    it('should use production API URL for preview hostname', async () => {
      global.window.location.hostname = 'work-time-tracker-5d9q-preview.vercel.app';
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: { token: 'preview-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        'https://work-time-tracker-5d9q.vercel.app/api/auth/token'
      );
      expect(result).toBe('preview-token');
    });

    it('should use localhost API URL for localhost hostname', async () => {
      global.window.location.hostname = 'localhost';
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: { token: 'localhost-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('http://localhost:3001/api/auth/token');
      expect(result).toBe('localhost-token');
    });

    it('should use dynamic API URL for custom hostname', async () => {
      global.window.location.hostname = 'custom-domain.com';
      global.window.location.protocol = 'https:';
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: { token: 'custom-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        'https://custom-domain.com/api/auth/token'
      );
      expect(result).toBe('custom-token');
    });

    it('should use default localhost URL when window is undefined', async () => {
      global.window = undefined as any;
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: { token: 'default-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('http://localhost:3001/api/auth/token');
      expect(result).toBe('default-token');
    });

    it('should handle API errors', async () => {
      global.window.location.hostname = 'localhost';
      global.process.env.NODE_ENV = 'production';

      const error = new Error('API Error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(fetchTokenFromDB()).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalledWith('Token fetch failed:', error);
    });

    it('should handle network errors', async () => {
      global.window.location.hostname = 'localhost';
      global.process.env.NODE_ENV = 'production';

      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(fetchTokenFromDB()).rejects.toThrow('Network Error');
      expect(console.error).toHaveBeenCalledWith('Token fetch failed:', networkError);
    });

    it('should handle timeout errors', async () => {
      global.window.location.hostname = 'localhost';
      global.process.env.NODE_ENV = 'production';

      const timeoutError = new Error('Timeout');
      timeoutError.name = 'TimeoutError';
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(fetchTokenFromDB()).rejects.toThrow('Timeout');
      expect(console.error).toHaveBeenCalledWith('Token fetch failed:', timeoutError);
    });

    it('should handle responses without token', async () => {
      global.window.location.hostname = 'localhost';
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: { message: 'No token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(result).toBeUndefined();
    });

    it('should handle empty response data', async () => {
      global.window.location.hostname = 'localhost';
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: null };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(result).toBeUndefined();
    });

    it('should use correct axios configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('preview hostname patterns', () => {
    const testCases = [
      'work-time-tracker-5d9q-abc123.vercel.app',
      'work-time-tracker-5d9q-feature-branch.vercel.app',
      'work-time-tracker-5d9q-pr-123.vercel.app',
      'work-time-tracker-5d9q-git-main.vercel.app',
    ];

    testCases.forEach((hostname) => {
      it(`should recognize ${hostname} as preview hostname`, async () => {
        global.window.location.hostname = hostname;
        global.process.env.NODE_ENV = 'production';

        const mockResponse = { data: { token: 'preview-token' } };
        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        await fetchTokenFromDB();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          'https://work-time-tracker-5d9q.vercel.app/api/auth/token'
        );
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing location protocol', async () => {
      global.window.location.hostname = 'custom-domain.com';
      global.window.location.protocol = undefined as any;
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: { token: 'edge-case-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        'undefined/custom-domain.com/api/auth/token'
      );
      expect(result).toBe('edge-case-token');
    });

    it('should handle missing location hostname', async () => {
      global.window.location.hostname = undefined as any;
      global.window.location.protocol = 'https:';
      global.process.env.NODE_ENV = 'production';

      const mockResponse = { data: { token: 'no-hostname-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('https://undefined/api/auth/token');
      expect(result).toBe('no-hostname-token');
    });

    it('should handle test environment', async () => {
      global.process.env.NODE_ENV = 'test';

      const mockResponse = { data: { token: 'test-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('http://localhost:3001/api/auth/token');
      expect(result).toBe('test-token');
    });

    it('should handle staging environment', async () => {
      global.process.env.NODE_ENV = 'staging';

      const mockResponse = { data: { token: 'staging-token' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchTokenFromDB();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('http://localhost:3001/api/auth/token');
      expect(result).toBe('staging-token');
    });
  });
});
