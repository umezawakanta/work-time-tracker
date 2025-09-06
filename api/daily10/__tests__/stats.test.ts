import { createMocks } from 'node-mocks-http';
import handler from '../stats/index';

describe('/api/daily10/stats', () => {
  describe('GET /api/daily10/stats', () => {
    test('should return stats successfully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'user-123' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalDays');
      expect(data.data).toHaveProperty('completedDays');
      expect(data.data).toHaveProperty('averageCompletionRate');
      expect(data.data).toHaveProperty('longestStreak');
      expect(data.data).toHaveProperty('currentStreak');
      expect(data.data).toHaveProperty('weeklyStats');
      expect(data.data).toHaveProperty('monthlyStats');
    });

    test('should return 401 when userId is missing', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID is required');
    });

    test('should return weekly stats when type=weekly', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'user-123', type: 'weekly' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data[0]).toHaveProperty('week');
      expect(data.data[0]).toHaveProperty('completionRate');
      expect(data.data[0]).toHaveProperty('completedTasks');
    });

    test('should return monthly stats when type=monthly', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'user-123', type: 'monthly' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data[0]).toHaveProperty('month');
      expect(data.data[0]).toHaveProperty('completionRate');
      expect(data.data[0]).toHaveProperty('completedTasks');
    });

    test('should return mock data with correct structure', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'user-123' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      const stats = data.data;

      expect(stats.totalDays).toBe(30);
      expect(stats.completedDays).toBe(25);
      expect(stats.averageCompletionRate).toBe(85.5);
      expect(stats.longestStreak).toBe(15);
      expect(stats.currentStreak).toBe(5);
      expect(stats.weeklyStats).toHaveLength(4);
      expect(stats.monthlyStats).toHaveLength(2);
    });
  });

  describe('CORS handling', () => {
    test('should set CORS headers for allowed origins', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'user-123' },
        headers: { origin: 'https://work-time-tracker-five.vercel.app' },
      });

      await handler(req, res);

      expect(res._getHeaders()).toHaveProperty('access-control-allow-origin');
      expect(res._getHeaders()).toHaveProperty('access-control-allow-methods');
      expect(res._getHeaders()).toHaveProperty('access-control-allow-headers');
    });

    test('should handle OPTIONS request', async () => {
      const { req, res } = createMocks({
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('Error handling', () => {
    test('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: 'user-123' },
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
