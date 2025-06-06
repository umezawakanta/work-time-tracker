import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from './utils/errorUtils';
import { Button } from '@/components/ui/button';

// Store actions and selectors
import { fetchTodoItems, checkPremiumStatus } from '@/store/todoSlice';
import {
  selectTodos,
  selectTodoStatus,
  selectTodoError,
  selectIsPremium,
} from './store/selectors/todoSelectors';
import { AppDispatch } from '@/store';

// Sub-components
import { TodoHeader } from './components/TodoHeader';
import { TodoProgress } from './components/TodoProgress';
import { TodoTabs } from './components/TodoTabs';
import { LoadingSpinner } from './components/LoadingSpinner';

// Hooks
import { useTodoState } from './hooks/useTodoState';
import { useTodoHistory } from './hooks/useTodoHistory';
import { useTodoFilters } from './hooks/useTodoFilters';

// Types
import { Todo } from './types';

// Styles
import './DailyTodoReminder.css';

interface DailyTodoReminderProps {
  readonly isPremium?: boolean;
}

/**
 * Daily Todo Reminder Component
 * World-class task management interface with premium features
 */
const DailyTodoReminder: React.FC<DailyTodoReminderProps> = ({ isPremium = false }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors with proper type safety
  const todos = useSelector(selectTodos);
  const status = useSelector(selectTodoStatus);
  const error = useSelector(selectTodoError);
  const hasPremium = useSelector(selectIsPremium) || isPremium;

  // Custom hooks for state management
  const { selectedTab, setSelectedTab } = useTodoState();
  const { streakCount, todoHistory, dailyHistory } = useTodoHistory(todos);
  const { filteredTodos, filterControls } = useTodoFilters(todos);

  // Initial data loading
  useEffect(() => {
    console.log('[DailyTodoReminder] 🔄 初期化開始:', {
      todosCount: todos.length,
      status,
      error,
      hasPremium,
    });

    // データが空で、ロード中でない場合は再取得を試行
    if (todos.length === 0 && status !== 'loading') {
      console.log('[DailyTodoReminder] 📡 ToDoデータ再取得試行');
      dispatch(fetchTodoItems());
    }

    // エラー処理
    if (error) {
      console.error('[DailyTodoReminder] ❌ ToDoデータエラー:', error);
      toast.error(`ToDoデータの取得に失敗しました: ${error}`);
    }
  }, [dispatch, todos.length, status, error]);

  // Progress calculations
  const completedCount = todos.filter((todo: Todo) => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const inputCount = todos.filter((todo: Todo) => todo.type === 'input').length;
  const outputCount = todos.filter((todo: Todo) => todo.type === 'output').length;

  // Loading state
  if (status === 'loading') {
    return (
      <Card className="w-full shadow-sm border border-gray-200">
        <CardContent className="p-4 text-center">
          <LoadingSpinner />
          <p className="mt-2 text-sm text-gray-600">ToDoリストを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  // エラー状態の表示を改善
  if (status === 'failed') {
    return (
      <Card className="w-full shadow-sm border border-red-200">
        <CardContent className="p-4 text-center">
          <p className="text-red-600">ToDoデータの読み込みに失敗しました</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => dispatch(fetchTodoItems())}
          >
            再試行
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm border border-gray-200 todo-reminder-card">
      {/* デバッグ情報表示（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 bg-blue-50 text-xs">
          🐛 ToDo数: {todos.length}, 状態: {status}, プレミアム: {hasPremium ? 'Yes' : 'No'}
        </div>
      )}

      <CardHeader className="pb-2">
        <TodoHeader
          hasPremium={hasPremium}
          streakCount={streakCount}
          completedToday={completedCount}
          totalToday={totalCount}
          productivityScore={progressPercentage}
        />
      </CardHeader>

      <TodoProgress
        completedCount={completedCount}
        totalCount={totalCount}
        progressPercentage={progressPercentage}
        inputCount={inputCount}
        outputCount={outputCount}
      />

      <CardContent className="pb-2 pt-0">
        <TodoTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          todos={filteredTodos}
          todoHistory={todoHistory}
          dailyHistory={dailyHistory}
          hasPremium={hasPremium}
          filterControls={filterControls}
        />
      </CardContent>
    </Card>
  );
};

export default DailyTodoReminder;
