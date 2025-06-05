import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from './utils/errorUtils';

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
    const loadInitialData = async (): Promise<void> => {
      try {
        await Promise.all([
          dispatch(fetchTodoItems()).unwrap(),
          dispatch(checkPremiumStatus()).unwrap(),
        ]);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(`データの読み込みに失敗しました: ${errorMessage}`);
      }
    };

    void loadInitialData();
  }, [dispatch]);

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Loading state
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // Progress calculations
  const completedCount = todos.filter((todo: Todo) => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const inputCount = todos.filter((todo: Todo) => todo.type === 'input').length;
  const outputCount = todos.filter((todo: Todo) => todo.type === 'output').length;

  return (
    <Card className="w-full shadow-sm border border-gray-200 todo-reminder-card">
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
