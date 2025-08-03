import { VercelRequest, VercelResponse } from '@vercel/node';
import { ComprehensiveTestingService } from '../../src/services/testing/ComprehensiveTestingService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://work-time-tracker-5d9q.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ];

  if (allowedOrigins.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      console.log('🧪 テスト結果取得リクエスト');

      // モックデータを返す（実際の環境では実際のテスト結果を返す）
      const mockTestSuites = [
        {
          name: '単体テスト (Unit Tests)',
          type: 'unit',
          totalTests: 247,
          passingTests: 239,
          failingTests: 8,
          coverage: 87.4,
          duration: 45.2,
          lastRun: new Date().toISOString(),
          tests: [
            {
              id: 'unit-auth-1',
              name: 'Authentication Service Tests',
              type: 'unit',
              status: 'passing',
              duration: 12.3,
              coverage: 94.2,
              lastRun: new Date(Date.now() - 300000).toISOString(),
              description: 'ログイン・ログアウト・セッション管理のテスト',
            },
            {
              id: 'unit-billing-1',
              name: 'Billing System Tests',
              type: 'unit',
              status: 'passing',
              duration: 8.7,
              coverage: 91.5,
              lastRun: new Date(Date.now() - 300000).toISOString(),
              description: 'Stripe決済・サブスクリプション管理のテスト',
            },
            {
              id: 'unit-quadrant-1',
              name: 'Quadrant Classification Tests',
              type: 'unit',
              status: 'failing',
              duration: 5.4,
              coverage: 78.9,
              lastRun: new Date(Date.now() - 180000).toISOString(),
              description: '4象限タスク分類システムのテスト',
              error: 'Gemini API key validation failed',
            },
          ],
        },
        {
          name: '結合テスト (Integration Tests)',
          type: 'integration',
          totalTests: 89,
          passingTests: 82,
          failingTests: 7,
          coverage: 76.8,
          duration: 156.7,
          lastRun: new Date().toISOString(),
          tests: [
            {
              id: 'int-auth-billing-1',
              name: 'Auth + Billing Integration',
              type: 'integration',
              status: 'passing',
              duration: 23.4,
              coverage: 85.1,
              lastRun: new Date(Date.now() - 900000).toISOString(),
              description: '認証システムと課金システムの連携テスト',
            },
            {
              id: 'int-api-db-1',
              name: 'API + Database Integration',
              type: 'integration',
              status: 'passing',
              duration: 34.7,
              coverage: 79.3,
              lastRun: new Date(Date.now() - 900000).toISOString(),
              description: 'APIとデータベースの連携テスト',
            },
          ],
        },
        {
          name: 'システムテスト (System Tests)',
          type: 'system',
          totalTests: 45,
          passingTests: 43,
          failingTests: 2,
          coverage: 68.9,
          duration: 234.5,
          lastRun: new Date().toISOString(),
          tests: [
            {
              id: 'sys-user-flow-1',
              name: 'Complete User Journey',
              type: 'system',
              status: 'passing',
              duration: 67.8,
              coverage: 72.4,
              lastRun: new Date(Date.now() - 1800000).toISOString(),
              description: 'ユーザー登録から課金まで完全フローのテスト',
            },
            {
              id: 'sys-performance-1',
              name: 'Performance & Load Tests',
              type: 'system',
              status: 'failing',
              duration: 89.2,
              coverage: 65.1,
              lastRun: new Date(Date.now() - 1800000).toISOString(),
              description: 'パフォーマンス・負荷テスト',
              error: 'Response time exceeded 2s threshold',
            },
          ],
        },
        {
          name: 'E2Eテスト (End-to-End Tests)',
          type: 'e2e',
          totalTests: 28,
          passingTests: 26,
          failingTests: 2,
          coverage: 45.2,
          duration: 412.3,
          lastRun: new Date().toISOString(),
          tests: [
            {
              id: 'e2e-critical-1',
              name: 'Critical User Paths',
              type: 'e2e',
              status: 'passing',
              duration: 156.7,
              coverage: 48.9,
              lastRun: new Date(Date.now() - 3600000).toISOString(),
              description: 'クリティカルユーザーパスのE2Eテスト',
            },
          ],
        },
      ];

      res.status(200).json({
        success: true,
        testSuites: mockTestSuites,
        timestamp: new Date().toISOString(),
        message: 'テスト結果を正常に取得しました',
      });
    } catch (error: any) {
      console.error('❌ テスト結果取得エラー:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'テスト結果の取得に失敗しました',
        details: error.message,
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'サポートされていないHTTPメソッドです',
    });
  }
}
