import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useTodos } from '../useTodos';
import { useAuth } from '../useAuth';
import TodoService from '@/services/data/TodoService';
import { Todo, NewTodo, TodoUpdate, TodoFilter, TodoStats } from '@/types/todo';

// Mock dependencies
jest.mock('../useAuth');
jest.mock('@/services/data/TodoService');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockTodoService = TodoService as jest.Mocked<typeof TodoService>;

describe('useTodos', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
  };

  const mockTodo: Todo = {
    _id: 'todo-1',
    title: 'テストタスク',
    description: 'テストの説明',
    completed: false,
    priority: 'medium',
    userId: 'test-user-id',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    dueDate: new Date('2024-01-31T23:59:59.000Z'),
    category: 'work',
    tags: ['testing', 'important'],
  };

  const mockTodos: Todo[] = [
    mockTodo,
    {
      ...mockTodo,
      _id: 'todo-2',
      title: '完了済みタスク',
      completed: true,
    },
  ];

  const mockStats: TodoStats = {
    total: 2,
    completed: 1,
    pending: 1,
    overdue: 0,
    completionRate: 50,
    averageCompletionTime: 3600000, // 1 hour in milliseconds
  };

  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth state
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
      checkAuthStatus: jest.fn(),
      refreshToken: jest.fn(),
    });

    // Default TodoService mocks
    mockTodoService.subscribeTodos.mockReturnValue(mockUnsubscribe);
    mockTodoService.getTodoStats.mockResolvedValue(mockStats);
    mockTodoService.createTodo.mockResolvedValue();
    mockTodoService.updateTodo.mockResolvedValue();
    mockTodoService.deleteTodo.mockResolvedValue();
  });

  describe('初期化', () => {
    it('認証ユーザーでTodosの購読を開始する', () => {
      const { result } = renderHook(() => useTodos());

      expect(mockTodoService.subscribeTodos).toHaveBeenCalledWith(
        'test-user-id',
        expect.any(Function),
        undefined
      );
      expect(result.current.loading).toBe(true);
    });

    it('フィルターを適用してTodosを購読する', () => {
      const filter: TodoFilter = { completed: false, priority: 'high' };

      renderHook(() => useTodos(filter));

      expect(mockTodoService.subscribeTodos).toHaveBeenCalledWith(
        'test-user-id',
        expect.any(Function),
        filter
      );
    });

    it('未認証ユーザーの場合は購読しない', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        updateProfile: jest.fn(),
        checkAuthStatus: jest.fn(),
        refreshToken: jest.fn(),
      });

      const { result } = renderHook(() => useTodos());

      expect(mockTodoService.subscribeTodos).not.toHaveBeenCalled();
      expect(result.current.todos).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('クリーンアップ時に購読解除する', () => {
      const { unmount } = renderHook(() => useTodos());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('データ取得', () => {
    it('Todosデータを正常に取得する', async () => {
      const { result } = renderHook(() => useTodos());

      // Simulate TodoService calling the callback
      const subscribedCallback = mockTodoService.subscribeTodos.mock.calls[0][1];
      act(() => {
        subscribedCallback(mockTodos);
      });

      expect(result.current.todos).toEqual(mockTodos);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('統計データを自動取得する', async () => {
      const { result } = renderHook(() => useTodos());

      // Trigger todos update
      const subscribedCallback = mockTodoService.subscribeTodos.mock.calls[0][1];
      act(() => {
        subscribedCallback(mockTodos);
      });

      await waitFor(() => {
        expect(mockTodoService.getTodoStats).toHaveBeenCalledWith('test-user-id');
        expect(result.current.stats).toEqual(mockStats);
      });
    });

    it('統計取得に失敗してもエラーにならない', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTodoService.getTodoStats.mockRejectedValue(new Error('Stats error'));

      const { result } = renderHook(() => useTodos());

      // Trigger todos update
      const subscribedCallback = mockTodoService.subscribeTodos.mock.calls[0][1];
      act(() => {
        subscribedCallback(mockTodos);
      });

      await waitFor(() => {
        expect(result.current.stats).toBeNull();
        expect(result.current.error).toBeNull();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('addTodo', () => {
    it('新しいTodoを正常に追加する', async () => {
      const { result } = renderHook(() => useTodos());

      const newTodo: NewTodo = {
        title: '新しいタスク',
        description: '新しいタスクの説明',
        priority: 'high',
        dueDate: new Date('2024-02-01T00:00:00.000Z'),
        category: 'personal',
        tags: ['new', 'urgent'],
      };

      await act(async () => {
        await result.current.addTodo(newTodo);
      });

      expect(mockTodoService.createTodo).toHaveBeenCalledWith('test-user-id', newTodo);
      expect(result.current.error).toBeNull();
    });

    it('未認証ユーザーの場合はエラーを投げる', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        updateProfile: jest.fn(),
        checkAuthStatus: jest.fn(),
        refreshToken: jest.fn(),
      });

      const { result } = renderHook(() => useTodos());

      const newTodo: NewTodo = {
        title: '新しいタスク',
        description: '説明',
        priority: 'medium',
      };

      await expect(async () => {
        await act(async () => {
          await result.current.addTodo(newTodo);
        });
      }).rejects.toThrow('User not authenticated');
    });

    it('API エラー時はエラー状態を設定する', async () => {
      mockTodoService.createTodo.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useTodos());

      const newTodo: NewTodo = {
        title: '新しいタスク',
        priority: 'medium',
      };

      await expect(async () => {
        await act(async () => {
          await result.current.addTodo(newTodo);
        });
      }).rejects.toThrow('API Error');

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe('タスクの追加に失敗しました');
      });
    });
  });

  describe('updateTodo', () => {
    it('Todoを正常に更新する', async () => {
      const { result } = renderHook(() => useTodos());

      const update: TodoUpdate = {
        _id: 'todo-1',
        updates: {
          title: '更新されたタスク',
          completed: true,
        },
      };

      await act(async () => {
        await result.current.updateTodo(update);
      });

      expect(mockTodoService.updateTodo).toHaveBeenCalledWith(update);
      expect(result.current.error).toBeNull();
    });

    it('API エラー時はエラー状態を設定する', async () => {
      mockTodoService.updateTodo.mockRejectedValue(new Error('Update Error'));

      const { result } = renderHook(() => useTodos());

      const update: TodoUpdate = {
        _id: 'todo-1',
        updates: { title: '更新' },
      };

      await expect(async () => {
        await act(async () => {
          await result.current.updateTodo(update);
        });
      }).rejects.toThrow('Update Error');

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe('タスクの更新に失敗しました');
      });
    });
  });

  describe('deleteTodo', () => {
    it('Todoを正常に削除する', async () => {
      const { result } = renderHook(() => useTodos());

      await act(async () => {
        await result.current.deleteTodo('todo-1');
      });

      expect(mockTodoService.deleteTodo).toHaveBeenCalledWith('todo-1');
      expect(result.current.error).toBeNull();
    });

    it('API エラー時はエラー状態を設定する', async () => {
      mockTodoService.deleteTodo.mockRejectedValue(new Error('Delete Error'));

      const { result } = renderHook(() => useTodos());

      await expect(async () => {
        await act(async () => {
          await result.current.deleteTodo('todo-1');
        });
      }).rejects.toThrow('Delete Error');

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe('タスクの削除に失敗しました');
      });
    });
  });

  describe('toggleComplete', () => {
    it('Todoの完了状態を切り替える', async () => {
      const { result } = renderHook(() => useTodos());

      // Set initial todos data
      const subscribedCallback = mockTodoService.subscribeTodos.mock.calls[0][1];
      act(() => {
        subscribedCallback(mockTodos);
      });

      await act(async () => {
        await result.current.toggleComplete('todo-1');
      });

      expect(mockTodoService.updateTodo).toHaveBeenCalledWith({
        _id: 'todo-1',
        updates: {
          completed: true, // Should toggle from false to true
        },
      });
    });

    it('存在しないTodoの場合は何もしない', async () => {
      const { result } = renderHook(() => useTodos());

      // Set initial todos data
      const subscribedCallback = mockTodoService.subscribeTodos.mock.calls[0][1];
      act(() => {
        subscribedCallback(mockTodos);
      });

      await act(async () => {
        await result.current.toggleComplete('nonexistent-id');
      });

      expect(mockTodoService.updateTodo).not.toHaveBeenCalled();
    });
  });

  describe('refreshStats', () => {
    it('統計データを手動更新する', async () => {
      const { result } = renderHook(() => useTodos());

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(mockTodoService.getTodoStats).toHaveBeenCalledWith('test-user-id');
    });

    it('未認証ユーザーの場合は統計を更新しない', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        updateProfile: jest.fn(),
        checkAuthStatus: jest.fn(),
        refreshToken: jest.fn(),
      });

      const { result } = renderHook(() => useTodos());

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(mockTodoService.getTodoStats).not.toHaveBeenCalled();
    });
  });

  describe('依存関係の変更', () => {
    it('ユーザーが変更されると再購読する', () => {
      const { rerender } = renderHook(() => useTodos());

      // Change user
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, uid: 'new-user-id' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        updateProfile: jest.fn(),
        checkAuthStatus: jest.fn(),
        refreshToken: jest.fn(),
      });

      rerender();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(mockTodoService.subscribeTodos).toHaveBeenCalledTimes(2);
      expect(mockTodoService.subscribeTodos).toHaveBeenLastCalledWith(
        'new-user-id',
        expect.any(Function),
        undefined
      );
    });

    it('フィルターが変更されると再購読する', () => {
      let filter: TodoFilter | undefined = undefined;

      const { rerender } = renderHook(() => useTodos(filter));

      // Change filter
      filter = { completed: true };
      rerender();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(mockTodoService.subscribeTodos).toHaveBeenCalledTimes(2);
      expect(mockTodoService.subscribeTodos).toHaveBeenLastCalledWith(
        'test-user-id',
        expect.any(Function),
        filter
      );
    });
  });

  describe('エラーハンドリング', () => {
    it('複数のエラーが発生しても最新のエラーを保持する', async () => {
      const { result } = renderHook(() => useTodos());

      // First error
      mockTodoService.createTodo.mockRejectedValue(new Error('Create Error'));

      await expect(async () => {
        await act(async () => {
          await result.current.addTodo({ title: 'Test', priority: 'medium' });
        });
      }).rejects.toThrow();

      // Wait for first error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe('タスクの追加に失敗しました');
      });

      // Second error
      mockTodoService.updateTodo.mockRejectedValue(new Error('Update Error'));

      await expect(async () => {
        await act(async () => {
          await result.current.updateTodo({ _id: 'test', updates: { title: 'Updated' } });
        });
      }).rejects.toThrow();

      // Wait for second error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe('タスクの更新に失敗しました');
      });
    });

    it('成功時にエラー状態をクリアする', async () => {
      const { result } = renderHook(() => useTodos());

      // Set error first
      mockTodoService.createTodo.mockRejectedValue(new Error('Error'));

      await expect(async () => {
        await act(async () => {
          await result.current.addTodo({ title: 'Test', priority: 'medium' });
        });
      }).rejects.toThrow();

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe('タスクの追加に失敗しました');
      });

      // Success should clear error
      mockTodoService.createTodo.mockResolvedValue();

      await act(async () => {
        await result.current.addTodo({ title: 'Test Success', priority: 'medium' });
      });

      // Wait for error to be cleared
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('パフォーマンス最適化', () => {
    it('同じ依存関係では関数インスタンスが安定している', () => {
      const { result, rerender } = renderHook(() => useTodos());

      const firstAddTodo = result.current.addTodo;
      const firstUpdateTodo = result.current.updateTodo;
      const firstDeleteTodo = result.current.deleteTodo;
      const firstToggleComplete = result.current.toggleComplete;
      const firstRefreshStats = result.current.refreshStats;

      rerender();

      expect(result.current.addTodo).toBe(firstAddTodo);
      expect(result.current.updateTodo).toBe(firstUpdateTodo);
      expect(result.current.deleteTodo).toBe(firstDeleteTodo);
      expect(result.current.toggleComplete).toBe(firstToggleComplete);
      expect(result.current.refreshStats).toBe(firstRefreshStats);
    });
  });
});
