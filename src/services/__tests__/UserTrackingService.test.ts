/**
 * 📊 ユーザートラッキングサービステスト
 *
 * ユーザー行動分析とページトラッキング機能をテスト
 */

import { userTrackingService, UserAnalytics } from '@/services/analytics/UserTrackingService';

// グローバルのfetch関数をモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('📊 ユーザートラッキングサービス', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // fetchのデフォルトモック応答
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('✅ セッション管理', () => {
    test.skip('セッションが正常に初期化される', () => {
      const userId = 'test-user-123';
      userTrackingService.initializeSession(userId);

      // セッション開始のAPIコールが呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('session_start'),
        })
      );
    });

    test.skip('ユーザーIDなしでもセッション初期化できる', () => {
      userTrackingService.initializeSession();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    test('重複セッション初期化が適切に処理される', () => {
      userTrackingService.initializeSession('user1');
      userTrackingService.initializeSession('user2');

      // 2回目の初期化も正常に処理される
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('📖 ページビュートラッキング', () => {
    test.skip('ページビューが正常に記録される', () => {
      const page = '/dashboard';
      const url = 'http://localhost:3000/dashboard';
      const title = 'Dashboard Page';

      userTrackingService.trackPageView(page, url, title);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('page_view'),
        })
      );
    });

    test.skip('連続するページビューが正しく処理される', () => {
      userTrackingService.trackPageView('/page1', 'http://example.com/page1', 'Page 1');
      userTrackingService.trackPageView('/page2', 'http://example.com/page2', 'Page 2');

      // 前のページビューが終了し、新しいページビューが開始される
      expect(mockFetch).toHaveBeenCalledTimes(3); // session_start, page_view_end, page_view
    });
  });

  describe('🖱️ ユーザーインタラクション', () => {
    beforeEach(() => {
      // ページビューを初期化
      userTrackingService.trackPageView('/test', 'http://test.com', 'Test Page');
      jest.clearAllMocks();
    });

    test.skip('クリックインタラクションが記録される', () => {
      userTrackingService.trackInteraction('click', 'button#submit', 'submit_form');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('interaction'),
        })
      );
    });

    test.skip('フォーム送信が記録される', () => {
      userTrackingService.trackInteraction('form_submit', 'form#todo-form', 'create_todo', {
        todoTitle: 'New Task',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('form_submit'),
        })
      );
    });

    test.skip('ダウンロードアクションが記録される', () => {
      userTrackingService.trackInteraction('download', 'link#export-csv', 'export_data', {
        format: 'csv',
        recordCount: 100,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('download'),
        })
      );
    });
  });

  describe('🤖 AI機能使用追跡', () => {
    beforeEach(() => {
      userTrackingService.trackPageView('/ai-dashboard', 'http://test.com/ai', 'AI Dashboard');
      jest.clearAllMocks();
    });

    test.skip('AI機能の成功が記録される', () => {
      userTrackingService.trackAIUsage('eisenhower_matrix_classification', true, {
        taskCount: 5,
        processingTime: 1200,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('ai_action'),
        })
      );
    });

    test.skip('AI機能の失敗が記録される', () => {
      userTrackingService.trackAIUsage('task_breakdown', false, {
        error: 'API_LIMIT_EXCEEDED',
        retryCount: 3,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('failure'),
        })
      );
    });

    test('AI使用パターンが記録される', () => {
      // 複数のAI機能使用を記録
      userTrackingService.trackAIUsage('gemini_classification', true);
      userTrackingService.trackAIUsage('task_suggestion', true);
      userTrackingService.trackAIUsage('productivity_analysis', false);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('📊 ユーザー属性管理', () => {
    test.skip('ユーザー属性が正常に更新される', () => {
      const attributes = {
        userId: 'user-123',
        role: 'admin',
        subscriptionPlan: 'premium',
        preferences: { theme: 'dark', language: 'ja' },
      };

      userTrackingService.updateUserAttributes(attributes);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('user_attributes'),
        })
      );
    });

    test('部分的な属性更新が正常に動作する', () => {
      userTrackingService.updateUserAttributes({
        subscriptionPlan: 'pro',
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('📈 解析データ取得', () => {
    test.skip('週次データが正常に取得される', async () => {
      const mockAnalytics: UserAnalytics = {
        totalUsers: 1000,
        activeUsers: 150,
        newUsers: 50,
        returningUsers: 100,
        averageSessionDuration: 600,
        pageViewsTotal: 5000,
        topPages: [
          { page: '/dashboard', views: 1500 },
          { page: '/todos', views: 1200 },
        ],
        deviceBreakdown: {
          desktop: 60,
          mobile: 35,
          tablet: 5,
        },
        trafficSources: {
          direct: 40,
          search: 30,
          social: 20,
          referral: 10,
        },
        userJourney: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalytics),
      });

      const result = await userTrackingService.getAnalytics('week');

      expect(result).toEqual(mockAnalytics);
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/summary?range=week');
    });

    test('データ取得失敗時にモックデータが返される', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await userTrackingService.getAnalytics('month');

      expect(result).toBeDefined();
      expect(result.totalUsers).toBeGreaterThan(0);
      expect(result.topPages).toBeInstanceOf(Array);
    });

    test.skip('異なる時間範囲のデータが取得できる', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ totalUsers: 100 }),
      });

      await userTrackingService.getAnalytics('day');
      await userTrackingService.getAnalytics('week');
      await userTrackingService.getAnalytics('month');

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/summary?range=day');
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/summary?range=week');
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/summary?range=month');
    });
  });

  describe('🎯 A/Bテスト', () => {
    beforeEach(() => {
      userTrackingService.trackPageView('/test', 'http://test.com', 'Test Page');
      jest.clearAllMocks();
    });

    test.skip('A/Bテストバリアントが記録される', () => {
      userTrackingService.trackABTest('header_design', 'variant_b');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('ab_test'),
        })
      );
    });

    test('複数のA/Bテストが記録される', () => {
      userTrackingService.trackABTest('button_color', 'red');
      userTrackingService.trackABTest('form_layout', 'compact');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('⏰ セッション終了', () => {
    test.skip('beforeunloadイベントでセッションが終了される', () => {
      userTrackingService.initializeSession('test-user');
      jest.clearAllMocks();

      // beforeunloadイベントをシミュレート
      window.dispatchEvent(new Event('beforeunload'));

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('session_end'),
        })
      );
    });

    test.skip('非アクティブタイムアウトでセッションが終了される', () => {
      userTrackingService.initializeSession('test-user');
      jest.clearAllMocks();

      // 30分（1800秒）経過をシミュレート
      jest.advanceTimersByTime(30 * 60 * 1000);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('session_end'),
        })
      );
    });
  });

  describe('⚠️ エラーハンドリング', () => {
    test.skip('ネットワークエラーが適切に処理される', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // エラーが発生してもアプリケーションが停止しない
      expect(() => {
        userTrackingService.trackInteraction('click', 'button');
      }).not.toThrow();
    });

    test('無効なページビューデータが適切に処理される', () => {
      expect(() => {
        userTrackingService.trackPageView('', '', '');
      }).not.toThrow();

      expect(mockFetch).toHaveBeenCalled();
    });

    test('API応答エラーが適切に処理される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await userTrackingService.getAnalytics('week');

      // フォールバックデータが返される
      expect(result).toBeDefined();
      expect(result.totalUsers).toBeGreaterThan(0);
    });
  });

  describe('🔧 ユーティリティ機能', () => {
    test.skip('デバイス情報が正確に検出される', () => {
      // モバイルUserAgentのシミュレート
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });

      userTrackingService.initializeSession();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('mobile'),
        })
      );
    });

    test.skip('位置情報が正確に取得される', () => {
      userTrackingService.initializeSession();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('Asia/Tokyo'),
        })
      );
    });
  });
});

describe('📊 ユーザートラッキング統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  test.skip('完全なユーザージャーニーが記録される', () => {
    // 1. セッション開始
    userTrackingService.initializeSession('integration-user');

    // 2. ページビュー
    userTrackingService.trackPageView('/dashboard', 'http://app.com/dashboard', 'Dashboard');

    // 3. ユーザーインタラクション
    userTrackingService.trackInteraction('click', 'nav#todos', 'navigate_to_todos');

    // 4. ページ遷移
    userTrackingService.trackPageView('/todos', 'http://app.com/todos', 'Todo List');

    // 5. AI機能使用
    userTrackingService.trackAIUsage('task_classification', true, { taskCount: 3 });

    // 6. フォーム送信
    userTrackingService.trackInteraction('form_submit', 'form#new-todo', 'create_todo');

    // すべてのイベントが記録されていることを確認
    expect(mockFetch).toHaveBeenCalledTimes(6);
  });

  test('リアルタイム解析データが正常に動作する', async () => {
    const mockAnalytics = {
      totalUsers: 500,
      activeUsers: 75,
      newUsers: 25,
      returningUsers: 50,
      averageSessionDuration: 450,
      pageViewsTotal: 2500,
      topPages: [
        { page: '/dashboard', views: 800 },
        { page: '/todos', views: 600 },
        { page: '/analytics', views: 400 },
      ],
      deviceBreakdown: { desktop: 70, mobile: 25, tablet: 5 },
      trafficSources: { direct: 50, search: 25, social: 15, referral: 10 },
      userJourney: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAnalytics),
    });

    const analytics = await userTrackingService.getAnalytics('week');

    expect(analytics).toEqual(mockAnalytics);
    expect(analytics.topPages).toHaveLength(3);
    expect(analytics.deviceBreakdown.desktop).toBe(70);
  });
});
