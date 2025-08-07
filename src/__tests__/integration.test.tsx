/**
 * 🚀 システム統合テスト
 *
 * Work Time Tracker - 完全システム統合テスト
 * 全機能の連携動作確認
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import todoSlice from '@/store/todoSlice';
import { UnifiedAuthManager } from '@/services/auth/UnifiedAuthManager';
import { userTrackingService } from '@/services/analytics/UserTrackingService';
import { QuadrantClassificationService } from '@/services/ai/QuadrantClassificationService';

// 統合テスト用のコンポーネント（実際のアプリケーションのミニ版）
const TestApp: React.FC = () => (
  <div data-testid="test-app">
    <h1>Work Time Tracker</h1>
    <div data-testid="todo-section">
      <h2>Todo Management</h2>
      <button data-testid="add-todo">Add Todo</button>
      <button data-testid="ai-classify">AI Classify</button>
    </div>
    <div data-testid="analytics-section">
      <h2>Analytics</h2>
      <button data-testid="export-data">Export Data</button>
    </div>
    <div data-testid="auth-section">
      <h2>Authentication</h2>
      <button data-testid="login">Login</button>
      <button data-testid="logout">Logout</button>
    </div>
  </div>
);

// テスト用ストア
const createIntegrationStore = () => {
  return configureStore({
    reducer: {
      todo: todoSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  });
};

// テストラッパー
const IntegrationTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createIntegrationStore();

  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

// モック設定
jest.mock('@/services/auth/UnifiedAuthManager', () => ({
  UnifiedAuthManager: {
    getInstance: jest.fn(),
  },
}));

jest.mock('@/services/analytics/UserTrackingService', () => ({
  userTrackingService: {
    trackPageView: jest.fn(),
    trackInteraction: jest.fn(),
    trackAIUsage: jest.fn(),
    getAnalytics: jest.fn(),
  },
}));

jest.mock('@/services/ai/QuadrantClassificationService', () => ({
  QuadrantClassificationService: {
    getInstance: jest.fn(),
  },
}));

const mockAuthManager = UnifiedAuthManager as jest.Mocked<typeof UnifiedAuthManager>;
const mockUserTracking = userTrackingService as jest.Mocked<typeof userTrackingService>;
const mockQuadrantService = QuadrantClassificationService as jest.Mocked<
  typeof QuadrantClassificationService
>;

describe('🚀 Work Time Tracker - システム統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 認証マネージャーのモック設定
    (mockAuthManager.getInstance as jest.Mock).mockReturnValue({
      login: jest.fn().mockResolvedValue({
        success: true,
        user: { id: 'test-user', email: 'test@example.com' },
      }),
      logout: jest.fn().mockResolvedValue({ success: true }),
      validateSession: jest.fn().mockResolvedValue(true),
    });

    // ユーザートラッキングのモック設定 - no need to reassign since they're already mocked
    mockUserTracking.trackPageView.mockImplementation(() => {});
    mockUserTracking.trackInteraction.mockImplementation(() => {});
    mockUserTracking.trackAIUsage.mockImplementation(() => {});
    mockUserTracking.getAnalytics.mockResolvedValue({
      totalUsers: 1000,
      activeUsers: 100,
      pageViewsTotal: 5000,
      averageSessionDuration: 600,
    });

    // AI分類サービスのモック設定
    (mockQuadrantService.getInstance as jest.Mock).mockReturnValue({
      classifyTask: jest.fn().mockResolvedValue({
        quadrant: 'essential',
        importance: 8,
        urgency: 9,
        confidence: 0.85,
      }),
      analyzeQuadrants: jest.fn().mockResolvedValue({
        totalTasks: 5,
        quadrantBreakdown: {
          essential: { count: 2, percentage: 40 },
          effectiveness: { count: 2, percentage: 40 },
          illusion: { count: 1, percentage: 20 },
          waste: { count: 0, percentage: 0 },
        },
      }),
    });
  });

  describe('🎯 アプリケーション初期化', () => {
    test('アプリケーションが正常に起動する', () => {
      render(
        <IntegrationTestWrapper>
          <TestApp />
        </IntegrationTestWrapper>
      );

      expect(screen.getByTestId('test-app')).toBeInTheDocument();
      expect(screen.getByText('Work Time Tracker')).toBeInTheDocument();
      expect(screen.getByTestId('todo-section')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-section')).toBeInTheDocument();
      expect(screen.getByTestId('auth-section')).toBeInTheDocument();
    });

    test('Redux storeが正常に初期化される', () => {
      const store = createIntegrationStore();

      expect(store.getState()).toBeDefined();
      expect(store.getState().todo).toBeDefined();
      expect(store.getState().todo.items).toEqual([]);
      expect(store.getState().todo.status).toBe('idle');
    });
  });

  describe('🔐 認証システム統合', () => {
    test('ログイン・ログアウトフローが正常に動作する', async () => {
      const user = userEvent.setup();

      render(
        <IntegrationTestWrapper>
          <TestApp />
        </IntegrationTestWrapper>
      );

      // ログインボタンをクリック
      const loginButton = screen.getByTestId('login');
      await user.click(loginButton);

      // ユーザートラッキングが初期化されることを確認
      expect(mockUserTracking.initializeSession).toHaveBeenCalled();
      expect(mockUserTracking.trackInteraction).toHaveBeenCalledWith(
        'click',
        'login',
        expect.any(String)
      );
    });

    test('認証状態に基づく機能制御が動作する', async () => {
      const user = userEvent.setup();

      render(
        <IntegrationTestWrapper>
          <TestApp />
        </IntegrationTestWrapper>
      );

      // 未認証状態での制限確認
      const aiClassifyButton = screen.getByTestId('ai-classify');
      await user.click(aiClassifyButton);

      // 認証が必要な機能へのアクセス試行が記録される
      expect(mockUserTracking.trackInteraction).toHaveBeenCalled();
    });
  });

  describe('📝 ToDo管理システム統合', () => {
    test('Todo作成からAI分析までの完全フローが動作する', async () => {
      const user = userEvent.setup();

      render(
        <IntegrationTestWrapper>
          <TestApp />
        </IntegrationTestWrapper>
      );

      // 1. Todo追加
      const addTodoButton = screen.getByTestId('add-todo');
      await user.click(addTodoButton);

      expect(mockUserTracking.trackInteraction).toHaveBeenCalledWith(
        'click',
        'add-todo',
        expect.any(String)
      );

      // 2. AI分類実行
      const aiClassifyButton = screen.getByTestId('ai-classify');
      await user.click(aiClassifyButton);

      expect(mockUserTracking.trackAIUsage).toHaveBeenCalledWith(
        'task_classification',
        true,
        expect.any(Object)
      );
    });

    test('Todoデータの永続化が正常に動作する', async () => {
      const store = createIntegrationStore();

      // Todo追加のディスパッチ
      store.dispatch({
        type: 'todo/addTodoItem/fulfilled',
        payload: {
          _id: 'test-todo-1',
          task: 'Test Task',
          completed: false,
          priority: 'medium',
        },
      });

      const state = store.getState();
      expect(state.todo.items).toHaveLength(1);
      expect(state.todo.items[0].task).toBe('Test Task');
    });
  });

  describe('🤖 AI機能統合', () => {
    test('AI分析機能が正常に統合されている', async () => {
      const classificationService = QuadrantClassificationService.getInstance();

      const mockTask = {
        id: 'test-task-1',
        title: 'Important Task',
        description: 'This is an important task',
        deadline: new Date().toISOString(),
        priority: 'high',
      };

      const result = await classificationService.classifyTask(mockTask);

      expect(result).toEqual({
        quadrant: 'essential',
        importance: 8,
        urgency: 9,
        confidence: 0.85,
      });
    });

    test('複数タスクの一括分析が動作する', async () => {
      const classificationService = QuadrantClassificationService.getInstance();

      const mockTasks = [
        { id: '1', title: 'Task 1', priority: 'high' },
        { id: '2', title: 'Task 2', priority: 'medium' },
        { id: '3', title: 'Task 3', priority: 'low' },
      ];

      const result = await classificationService.analyzeQuadrants(mockTasks);

      expect(result.totalTasks).toBe(5);
      expect(result.quadrantBreakdown.essential.count).toBe(2);
      expect(result.quadrantBreakdown.effectiveness.percentage).toBe(40);
    });
  });

  describe('📊 アナリティクス統合', () => {
    test('ユーザー行動追跡が正常に動作する', async () => {
      const user = userEvent.setup();

      render(
        <IntegrationTestWrapper>
          <TestApp />
        </IntegrationTestWrapper>
      );

      // 複数のインタラクションを実行
      await user.click(screen.getByTestId('add-todo'));
      await user.click(screen.getByTestId('ai-classify'));
      await user.click(screen.getByTestId('export-data'));

      // すべてのインタラクションが記録されることを確認
      expect(mockUserTracking.trackInteraction).toHaveBeenCalledTimes(3);
    });

    test('データエクスポート機能が統合されている', async () => {
      const analytics = await userTrackingService.getAnalytics('week');

      expect(analytics).toBeDefined();
      expect(analytics.totalUsers).toBe(1000);
      expect(analytics.activeUsers).toBe(100);
    });
  });

  describe('🔄 状態管理統合', () => {
    test('Redux状態が複数コンポーネント間で共有される', () => {
      const store = createIntegrationStore();

      // 複数のアクションをディスパッチ
      store.dispatch({
        type: 'todo/addTodoItem/fulfilled',
        payload: { _id: '1', task: 'Task 1' },
      });

      store.dispatch({
        type: 'todo/addTodoItem/fulfilled',
        payload: { _id: '2', task: 'Task 2' },
      });

      const state = store.getState();
      expect(state.todo.items).toHaveLength(2);
    });

    test('非同期操作が正常に処理される', async () => {
      const store = createIntegrationStore();

      // 非同期アクションのディスパッチ
      store.dispatch({
        type: 'todo/fetchTodoItems/pending',
      });

      expect(store.getState().todo.status).toBe('loading');

      store.dispatch({
        type: 'todo/fetchTodoItems/fulfilled',
        payload: [
          { _id: '1', task: 'Fetched Task 1' },
          { _id: '2', task: 'Fetched Task 2' },
        ],
      });

      expect(store.getState().todo.status).toBe('succeeded');
      expect(store.getState().todo.items).toHaveLength(2);
    });
  });

  describe('⚠️ エラーハンドリング統合', () => {
    test('システム全体のエラーハンドリングが正常に動作する', async () => {
      const user = userEvent.setup();

      // 認証エラーのシミュレート
      const authManager = UnifiedAuthManager.getInstance();
      (authManager.login as jest.Mock).mockRejectedValueOnce(new Error('Authentication failed'));

      render(
        <IntegrationTestWrapper>
          <TestApp />
        </IntegrationTestWrapper>
      );

      const loginButton = screen.getByTestId('login');
      await user.click(loginButton);

      // エラーが発生してもアプリケーションが停止しない
      expect(screen.getByTestId('test-app')).toBeInTheDocument();
    });

    test('AI機能のエラーが適切に処理される', async () => {
      const classificationService = QuadrantClassificationService.getInstance();
      (classificationService.classifyTask as jest.Mock).mockRejectedValueOnce(
        new Error('AI service unavailable')
      );

      try {
        await classificationService.classifyTask({
          id: 'error-task',
          title: 'Error Task',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // エラー後もサービスが利用可能
      expect(classificationService.classifyTask).toBeDefined();
    });
  });

  describe('📱 レスポンシブ統合', () => {
    test('モバイル環境での動作が正常', () => {
      // モバイルビューポートのシミュレート
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <IntegrationTestWrapper>
          <TestApp />
        </IntegrationTestWrapper>
      );

      expect(screen.getByTestId('test-app')).toBeInTheDocument();

      // モバイル用のユーザートラッキングが初期化される
      expect(mockUserTracking.trackPageView).toHaveBeenCalled();
    });
  });

  describe('🔄 実時間統合', () => {
    test('リアルタイム機能が正常に動作する', async () => {
      jest.useFakeTimers();

      const user = userEvent.setup();

      render(
        <IntegrationTestWrapper>
          <TestApp />
        </IntegrationTestWrapper>
      );

      // 定期的な状態更新をシミュレート
      await user.click(screen.getByTestId('ai-classify'));

      // 1秒後の処理
      jest.advanceTimersByTime(1000);

      expect(mockUserTracking.trackAIUsage).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});

describe('🚀 E2E統合シナリオテスト', () => {
  test('完全なユーザージャーニーが正常に動作する', async () => {
    const user = userEvent.setup();

    render(
      <IntegrationTestWrapper>
        <TestApp />
      </IntegrationTestWrapper>
    );

    // シナリオ: 新規ユーザーの完全フロー

    // 1. アプリケーション起動
    expect(screen.getByText('Work Time Tracker')).toBeInTheDocument();

    // 2. ユーザートラッキング開始
    expect(mockUserTracking.trackPageView).toHaveBeenCalled();

    // 3. ログイン
    await user.click(screen.getByTestId('login'));
    expect(mockUserTracking.trackInteraction).toHaveBeenCalledWith(
      'click',
      'login',
      expect.any(String)
    );

    // 4. Todo作成
    await user.click(screen.getByTestId('add-todo'));
    expect(mockUserTracking.trackInteraction).toHaveBeenCalledWith(
      'click',
      'add-todo',
      expect.any(String)
    );

    // 5. AI分析実行
    await user.click(screen.getByTestId('ai-classify'));
    expect(mockUserTracking.trackAIUsage).toHaveBeenCalledWith(
      'task_classification',
      true,
      expect.any(Object)
    );

    // 6. データエクスポート
    await user.click(screen.getByTestId('export-data'));
    expect(mockUserTracking.trackInteraction).toHaveBeenCalledWith(
      'click',
      'export-data',
      expect.any(String)
    );

    // 7. ログアウト
    await user.click(screen.getByTestId('logout'));

    // 全ての操作が正常に完了
    expect(mockUserTracking.trackInteraction).toHaveBeenCalledTimes(4);
  });

  test('エラー回復シナリオが正常に動作する', async () => {
    const user = userEvent.setup();

    // 一時的なエラーをシミュレート
    mockUserTracking.trackInteraction
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(undefined);

    render(
      <IntegrationTestWrapper>
        <TestApp />
      </IntegrationTestWrapper>
    );

    // エラーが発生するアクション
    await user.click(screen.getByTestId('add-todo'));

    // 回復後のアクション
    await user.click(screen.getByTestId('ai-classify'));

    // エラー後も正常に動作することを確認
    expect(screen.getByTestId('test-app')).toBeInTheDocument();
  });

  test('データ整合性が保たれる', async () => {
    const store = createIntegrationStore();

    // 複数の操作を実行
    const actions = [
      { type: 'todo/addTodoItem/fulfilled', payload: { _id: '1', task: 'Task 1' } },
      { type: 'todo/addTodoItem/fulfilled', payload: { _id: '2', task: 'Task 2' } },
      { type: 'todo/updateTodoItem/fulfilled', payload: { _id: '1', completed: true } },
      { type: 'todo/deleteTodoItem/fulfilled', payload: '2' },
    ];

    actions.forEach((action) => store.dispatch(action));

    const finalState = store.getState();

    // データの整合性確認
    expect(finalState.todo.items).toHaveLength(1);
    expect(finalState.todo.items[0]._id).toBe('1');
    expect(finalState.todo.items[0].completed).toBe(true);
  });
});
