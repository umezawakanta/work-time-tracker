/**
 * 📝 TodoItemコンポーネントテスト
 *
 * ToDo項目の表示・編集・削除機能をテスト
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import todoSlice from '@/store/todoSlice';
import { TodoItem } from '@/components/dailyToDoReminder/todo/TodoItem';
import { TodoItem as TodoItemType } from '@/types';
import { renderWithAuth } from '@/test-utils/render';

// テスト用のストア作成
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      todo: todoSlice,
    },
    preloadedState: {
      todo: {
        items: [],
        status: 'idle',
        error: null,
        ...initialState.todo,
      },
    },
  });
};

// テストユーティリティ（AuthProvider付き）
const renderWithRedux = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...renderWithAuth(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('📝 TodoItem コンポーネント', () => {
  const mockTodo: TodoItemType = {
    _id: 'test-todo-1',
    id: 'test-todo-1',
    task: 'テストタスク',
    title: 'テストタスク',
    description: 'これはテスト用のタスクです',
    completed: false,
    priority: 3,
    type: 'task',
    category: 'personal',
    tags: ['test', 'important'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deadline: '2024-12-31T23:59:59.000Z',
    estimatedMinutes: 30,
    isPrioritized: false,
    userId: 'test-user-1',
    source: 'manual' as const,
    context: [],
    subtodos: [],
  };

  const mockProps = {
    todo: mockTodo,
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onToggleComplete: jest.fn(),
    className: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ 基本表示機能', () => {
    test('TodoItemが正常に表示される', () => {
      renderWithRedux(<TodoItem {...mockProps} />);

      expect(screen.getByText('テストタスク')).toBeInTheDocument();
      expect(screen.getByText('これはテスト用のタスクです')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    test('完了済みタスクが正しく表示される', () => {
      const completedTodo = { ...mockTodo, completed: true };
      const props = { ...mockProps, todo: completedTodo };

      renderWithRedux(<TodoItem {...props} />);

      expect(screen.getByRole('checkbox')).toBeChecked();
      // 完了済みタスクのスタイリング確認（line-throughなど）
      const taskTitle = screen.getByText('テストタスク');
      expect(taskTitle).toHaveClass('line-through');
    });

    test('優先度バッジが正しく表示される（数値優先度4以上で表示）', () => {
      const highPriorityTodo = { ...mockTodo, priority: 4 };
      const props = { ...mockProps, todo: highPriorityTodo };
      renderWithRedux(<TodoItem {...props} />);

      // ラベルは日本語で表示される（4: 高）
      expect(screen.getByText('高')).toBeInTheDocument();
    });

    test('タグが正しく表示される', () => {
      renderWithRedux(<TodoItem {...mockProps} />);

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('important')).toBeInTheDocument();
    });

    test('期限が正しく表示される', () => {
      renderWithRedux(<TodoItem {...mockProps} />);

      // 期限表示の確認（フォーマットは実装に依存）
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });

  describe('🖱️ ユーザーインタラクション', () => {
    test('チェックボックスクリックで完了状態が切り替わる', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockProps.onToggleComplete).toHaveBeenCalledWith(mockTodo._id);
    });

    test('編集ボタンクリックで編集モードになる', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      // 編集ボタンを探す（DropdownMenuまたは直接のボタン）
      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      const editButton = screen.getByRole('menuitem', { name: /edit/i });
      await user.click(editButton);

      // 編集フォームが表示されることを確認
      expect(screen.getByDisplayValue('テストタスク')).toBeInTheDocument();
    });

    test('削除ボタンクリックで削除確認が表示される', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      const deleteButton = screen.getByRole('menuitem', { name: /delete|削除/i });
      await user.click(deleteButton);

      // 削除確認ダイアログが表示されることを確認（英語UIのため）
      expect(screen.getByText(/are you sure you want to delete this task\?/i)).toBeInTheDocument();
    });
  });

  describe('✏️ 編集機能', () => {
    test('タスク内容が正しく編集される', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      // 編集モードに入る
      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      const editButton = screen.getByRole('menuitem', { name: /edit/i });
      await user.click(editButton);

      // タスク名を編集
      const taskInput = screen.getByDisplayValue('テストタスク');
      await user.clear(taskInput);
      await user.type(taskInput, '編集されたタスク');

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        mockTodo._id,
        expect.objectContaining({
          text: '編集されたタスク',
        })
      );
    });

    test('編集キャンセルが正常に動作する', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      // 編集モードに入る
      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      const editButton = screen.getByRole('menuitem', { name: /edit/i });
      await user.click(editButton);

      // 内容を変更
      const taskInput = screen.getByDisplayValue('テストタスク');
      await user.clear(taskInput);
      await user.type(taskInput, '変更内容');

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      // 元の内容が表示されることを確認
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
      expect(mockProps.onUpdate).not.toHaveBeenCalled();
    });
  });

  describe('🗑️ 削除機能', () => {
    test('削除確認後にタスクが削除される', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      // 削除メニューを開く
      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      const deleteButton = screen.getByRole('menuitem', { name: /delete/i });
      await user.click(deleteButton);

      // 削除確認
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockProps.onDelete).toHaveBeenCalledWith(mockTodo._id);
    });

    test('削除キャンセルが正常に動作する', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      // 削除メニューを開く
      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      const deleteButton = screen.getByRole('menuitem', { name: /delete/i });
      await user.click(deleteButton);

      // 削除キャンセル
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockProps.onDelete).not.toHaveBeenCalled();
    });
  });

  describe('🎯 優先度機能', () => {
    test('優先度変更が正常に動作する', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      // 編集モードに入る
      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      const editButton = screen.getByRole('menuitem', { name: /edit/i });
      await user.click(editButton);

      // 優先度を変更
      const prioritySelect = screen.getByRole('combobox', { name: '優先度' });
      await user.click(prioritySelect);

      const highPriorityOption = screen.getByRole('option', { name: '高' });
      await user.click(highPriorityOption);

      // 保存
      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        mockTodo._id,
        expect.objectContaining({
          priority: expect.any(Number),
        })
      );
    });
  });

  describe('⚠️ エラーハンドリング', () => {
    test('不正なTodoデータが適切に処理される', () => {
      const invalidTodo = { ...mockTodo, _id: undefined } as any;
      const props = { ...mockProps, todo: invalidTodo };

      // エラーが発生しても表示が崩れないことを確認
      const { container } = renderWithRedux(<TodoItem {...props} />);
      expect(container).toBeInTheDocument();
    });

    test('長いテキストが適切に処理される', () => {
      const longTextTodo = {
        ...mockTodo,
        task: 'A'.repeat(1000),
        description: 'B'.repeat(2000),
      };
      const props = { ...mockProps, todo: longTextTodo };

      renderWithRedux(<TodoItem {...props} />);

      // 長いテキストが適切に表示される（truncateなど）
      expect(screen.getByText(/A+/)).toBeInTheDocument();
    });
  });

  describe('📱 レスポンシブ対応', () => {
    test('モバイル表示が正常に動作する', () => {
      // viewport変更のモック
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithRedux(<TodoItem {...mockProps} />);

      // モバイル向けの表示確認
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
    });
  });

  describe('♿ アクセシビリティ', () => {
    test('キーボードナビゲーションが正常に動作する', async () => {
      const user = userEvent.setup();
      renderWithRedux(<TodoItem {...mockProps} />);

      const checkbox = screen.getByRole('checkbox');

      // Tabキーでフォーカス移動
      await user.tab();
      expect(checkbox).toHaveFocus();

      // Spaceキーでチェックボックス操作
      await user.keyboard(' ');
      expect(mockProps.onToggleComplete).toHaveBeenCalled();
    });

    test('適切なARIAラベルが設定されている', () => {
      renderWithRedux(<TodoItem {...mockProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAccessibleName();

      // その他のARIA属性確認
      const todoContainer = screen.getByTestId('todo-item');
      expect(todoContainer).toHaveAttribute('role');
    });
  });
});
