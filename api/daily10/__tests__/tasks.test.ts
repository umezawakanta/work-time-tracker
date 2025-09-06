import { createMocks } from 'node-mocks-http';
import handler from '../tasks/index';

describe('/api/daily10/tasks', () => {
  describe('GET /api/daily10/tasks', () => {
    test('should return tasks list successfully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(16);
      expect(data.data[0]).toHaveProperty('id');
      expect(data.data[0]).toHaveProperty('name');
      expect(data.data[0]).toHaveProperty('category');
    });

    test('should return tasks with correct structure', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      const task = data.data[0];

      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('name');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('category');
      expect(task).toHaveProperty('isActive');
      expect(task).toHaveProperty('order');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
    });

    test('should include all required tasks', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      const taskNames = data.data.map((task: any) => task.name);

      expect(taskNames).toContain('直近3ヶ月の収入と支出をすべて把握する');
      expect(taskNames).toContain('現在の資産と負債をすべて把握する');
      expect(taskNames).toContain('現在から3ヶ月後までの予定をすべて把握する');
      expect(taskNames).toContain('先月と今月の固定費の支払いと支払日をすべて把握');
      expect(taskNames).toContain('直近3ヶ月の利息の支払いをすべて把握');
      expect(taskNames).toContain('直近3ヶ月の光熱費の支払いをすべて把握');
      expect(taskNames).toContain('ギターの練習');
      expect(taskNames).toContain('洗い物');
      expect(taskNames).toContain('自炊');
      expect(taskNames).toContain('風呂');
      expect(taskNames).toContain('読書');
      expect(taskNames).toContain('このサイトの開発を進める');
      expect(taskNames).toContain('新聞を捨てる');
      expect(taskNames).toContain('チラシを捨てる');
      expect(taskNames).toContain('冷蔵庫の中身を確認');
      expect(taskNames).toContain('床掃除');
    });
  });

  describe('PUT /api/daily10/tasks/:id', () => {
    test('should update task successfully', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'task_1' },
        body: { isActive: false },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.isActive).toBe(false);
    });

    test('should return 400 when task ID is missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: { isActive: false },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('Task ID is required');
    });

    test('should return 404 when task not found', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'nonexistent_task' },
        body: { isActive: false },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('Task not found');
    });
  });

  describe('CORS handling', () => {
    test('should set CORS headers for allowed origins', async () => {
      const { req, res } = createMocks({
        method: 'GET',
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
