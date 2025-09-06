import { createMocks } from 'node-mocks-http';
import handler from '../progress/index';

describe('/api/daily10/progress', () => {
  describe('GET /api/daily10/progress', () => {
    test('should return 401 when userId is missing', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { date: '2024-01-20' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID is required');
    });

    test('should return empty progress for new date', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'user-123', date: '2024-01-20' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('userId', 'user-123');
      expect(data.data).toHaveProperty('date', '2024-01-20');
      expect(data.data).toHaveProperty('tasks');
      expect(data.data).toHaveProperty('completionRate', 0);
      expect(data.data).toHaveProperty('streak');
    });

    test('should return 400 when date is missing', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'user-123' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('Date or date range is required');
    });
  });

  describe('POST /api/daily10/progress', () => {
    test('should create progress successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: 'user-123' },
        body: {
          date: '2024-01-20',
          taskId: 'task_1',
          completed: true,
          notes: 'Test note',
        },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('userId', 'user-123');
      expect(data.data).toHaveProperty('date', '2024-01-20');
      expect(data.data.tasks.task_1).toHaveProperty('completed', true);
      expect(data.data.tasks.task_1).toHaveProperty('notes', 'Test note');
    });

    test('should return 400 when required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { userId: 'user-123' },
        body: {
          date: '2024-01-20',
          // taskId is missing
        },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('Date and task ID are required');
    });

    test('should return 401 when userId is missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          date: '2024-01-20',
          taskId: 'task_1',
          completed: true,
        },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID is required');
    });
  });

  describe('PUT /api/daily10/progress/:id', () => {
    test('should return 400 when progress ID is missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: { userId: 'user-123' },
        body: {
          tasks: {
            task_1: { completed: true },
          },
        },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('Progress ID is required');
    });

    test('should return 404 when progress not found', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: { userId: 'user-123', id: 'nonexistent-progress' },
        body: {
          tasks: {
            task_1: { completed: true },
          },
        },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('Progress not found');
    });
  });

  describe('CORS handling', () => {
    test('should set CORS headers for allowed origins', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'user-123', date: '2024-01-20' },
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
        method: 'DELETE',
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
