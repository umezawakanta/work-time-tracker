import { createMocks } from 'node-mocks-http';
import handler from '../index';
import fs from 'fs';
import path from 'path';

// ファイルシステムのモック
jest.mock('fs');
jest.mock('path');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

describe('/api/docs', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのモック設定
    mockedPath.join.mockImplementation((...args) => args.join('/'));
    mockedPath.relative.mockImplementation((from, to) => to.replace(from, ''));
    mockedPath.resolve.mockImplementation((...args) => args.join('/'));
  });

  describe('GET /api/docs?action=list', () => {
    test('should return document list successfully', async () => {
      // モックファイルシステムの設定
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        { isFile: () => true, name: 'requirements.md' },
        { isFile: () => true, name: 'design.md' },
      ] as any);
      mockedFs.statSync.mockReturnValue({
        mtime: new Date('2024-01-01T00:00:00.000Z'),
        size: 1024,
      } as any);
      mockedFs.readFileSync.mockReturnValue('# Test Document\n\nThis is a test document.');

      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'list' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.total).toBeGreaterThan(0);
    });

    test('should handle file system errors gracefully', async () => {
      // ファイルシステムエラーをモック
      mockedFs.existsSync.mockReturnValue(false);

      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'list' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('GET /api/docs?action=categories', () => {
    test('should return categories successfully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'categories' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('features');
      expect(data.data).toHaveProperty('api');
      expect(data.data.features).toHaveProperty('name');
      expect(data.data.features).toHaveProperty('description');
    });
  });

  describe('GET /api/docs?action=content&id={docId}', () => {
    test('should return document content successfully', async () => {
      const mockContent = '# Test Document\n\nThis is test content.';
      const mockStats = {
        mtime: new Date('2024-01-01T00:00:00.000Z'),
        size: 1024,
      };

      mockedFs.readFileSync.mockReturnValue(mockContent);
      mockedFs.statSync.mockReturnValue(mockStats as any);
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        { isFile: () => true, name: 'requirements.md' },
      ] as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'content', id: 'features/docs/requirements' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('content');
      expect(data.data).toHaveProperty('metadata');
      expect(data.data.content).toBe(mockContent);
    });

    test('should return 404 when document not found', async () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'content', id: 'nonexistent/document' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('ドキュメントが見つかりません');
    });

    test('should prevent path traversal attacks', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'content', id: '../../../etc/passwd' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('ドキュメントが見つかりません');
    });
  });

  describe('CORS handling', () => {
    test('should set CORS headers for allowed origins', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'list' },
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
    test('should handle unexpected errors', async () => {
      // 予期しないエラーをモック
      mockedFs.readdirSync.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'list' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

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

  describe('Performance', () => {
    test('should handle large number of documents efficiently', async () => {
      const largeFileList = Array.from({ length: 1000 }, (_, i) => ({
        isFile: () => true,
        name: `document-${i}.md`,
      }));

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(largeFileList as any);
      mockedFs.statSync.mockReturnValue({
        mtime: new Date('2024-01-01T00:00:00.000Z'),
        size: 1024,
      } as any);
      mockedFs.readFileSync.mockReturnValue('# Test Document\n\nThis is a test document.');

      const startTime = performance.now();

      const { req, res } = createMocks({
        method: 'GET',
        query: { action: 'list' },
        headers: { origin: 'http://localhost:3000' },
      });

      await handler(req, res);

      const endTime = performance.now();

      expect(res._getStatusCode()).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // 1秒以内

      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1000);
    });
  });
});
