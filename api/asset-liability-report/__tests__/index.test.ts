import { createMocks } from 'node-mocks-http';
import handler from '../index';

// Type assertion to fix VercelRequest compatibility
const createVercelMocks = (options: any) => {
  const { req, res } = createMocks(options);
  return { req: req as any, res };
};

describe('/api/asset-liability-report', () => {
  describe('GET /api/asset-liability-report?action=summary', () => {
    test('should return report summary successfully', async () => {
      const { req, res } = createVercelMocks({
        method: 'GET',
        query: { action: 'summary', userId: 'test-user-123' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('assets');
      expect(data.data).toHaveProperty('debts');
      expect(data.data).toHaveProperty('metrics');
      expect(data.data).toHaveProperty('trends');
      expect(data.data).toHaveProperty('categories');
    });

    test('should return 401 when userId is missing', async () => {
      const { req, res } = createVercelMocks({
        method: 'GET',
        query: { action: 'summary' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID is required');
    });
  });

  describe('GET /api/asset-liability-report?action=metrics', () => {
    test('should return financial metrics successfully', async () => {
      const { req, res } = createVercelMocks({
        method: 'GET',
        query: { action: 'metrics', userId: 'test-user-123' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalAssets');
      expect(data.data).toHaveProperty('totalDebts');
      expect(data.data).toHaveProperty('netWorth');
      expect(data.data).toHaveProperty('debtToAssetRatio');
    });
  });

  describe('GET /api/asset-liability-report?action=trends', () => {
    test('should return trend data successfully', async () => {
      const { req, res } = createVercelMocks({
        method: 'GET',
        query: { action: 'trends', userId: 'test-user-123' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('monthly');
      expect(data.data).toHaveProperty('yearly');
    });
  });

  describe('CORS handling', () => {
    test('should set CORS headers for allowed origins', async () => {
      const { req, res } = createVercelMocks({
        method: 'GET',
        query: { action: 'summary', userId: 'test-user-123' },
        headers: { origin: 'https://work-time-tracker-five.vercel.app' },
      });

      await handler(req, res);

      expect(res._getHeaders()).toHaveProperty('access-control-allow-origin');
      expect(res._getHeaders()).toHaveProperty('access-control-allow-methods');
      expect(res._getHeaders()).toHaveProperty('access-control-allow-headers');
    });

    test('should handle OPTIONS request', async () => {
      const { req, res } = createVercelMocks({
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('Error handling', () => {
    test('should return 405 for unsupported methods', async () => {
      const { req, res } = createVercelMocks({
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('Method not allowed');
    });
  });
});
