import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

// Store actions and selectors
import { fetchTodoItems } from '@/store/todoSlice';
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
import { TodoAIAnalysis } from './components/TodoAIAnalysis';

// Hooks
import { useTodoState } from './hooks/useTodoState';
import { useTodoHistory } from './hooks/useTodoHistory';
import { useTodoFilters } from './hooks/useTodoFilters';

// Types
import { Todo } from './types';

// Styles
import './DailyTodoReminder.css';

// Services
import {
  todoAnalysisService,
  TodoAnalysisResult,
  TaskRecommendation,
} from '@/services/ai/todoAnalysisService';

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

  // AI analysis related state
  const [analysisResult, setAnalysisResult] = useState<TodoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

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
  }, [dispatch, todos.length, status, error, hasPremium]);

  // Progress calculations
  const completedCount = todos.filter((todo: Todo) => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const inputCount = todos.filter((todo: Todo) => todo.type === 'input').length;
  const outputCount = todos.filter((todo: Todo) => todo.type === 'output').length;

  // AI analysis execution
  const handleAnalyzeTodos = async () => {
    console.log('[DEBUG] AI分析ボタンがクリックされました');
    console.log('[DEBUG] todos.length:', todos.length);
    console.log('[DEBUG] todos:', todos);

    if (todos.length === 0) {
      console.log('[DEBUG] ToDoがないため早期リターン');
      toast.error('分析するToDoがありません');
      return;
    }

    setIsAnalyzing(true);
    console.log('[DEBUG] 分析開始');

    try {
      // 簡単なテストデータで動作確認
      const testData = [
        { id: '1', task: 'テストタスク1', description: '' },
        { id: '2', task: 'テストタスク2', description: '' },
      ];

      console.log('[DEBUG] todoAnalysisService呼び出し前');
      const result = await todoAnalysisService.analyzeTodos(testData);
      console.log('[DEBUG] 分析結果:', result);

      setAnalysisResult(result);
      setShowAIAnalysis(true);

      toast.success(`${result.totalTasks}個のタスクを分析しました`);
    } catch (error) {
      console.error('[DEBUG] AI分析エラー:', error);
      toast.error('AI分析に失敗しました');
    } finally {
      console.log('[DEBUG] 分析終了');
      setIsAnalyzing(false);
    }
  };

  // Apply recommendation
  const handleApplyRecommendation = (taskId: string, recommendation: TaskRecommendation) => {
    // TODO: Implement with correct Redux actions
    toast.error('この機能は現在利用できません');
    /*
    const task = todos.find((t) => t.id === taskId);
    if (!task) return;

    switch (recommendation.type) {
      case 'delete':
        // dispatch(deleteTodo(taskId));
        toast.success('タスクを削除しました');
        break;
      // ... rest of cases
    }
    */
  };

  // Dismiss recommendation
  const handleDismissRecommendation = (taskId: string, recommendationIndex: number) => {
    if (!analysisResult) return;

    const updatedTasks = analysisResult.analyzedTasks.map((task) => {
      if (task.id === taskId) {
        const newRecommendations = [...task.recommendations];
        newRecommendations.splice(recommendationIndex, 1);
        return {
          ...task,
          recommendations: newRecommendations,
        };
      }
      return task;
    });

    setAnalysisResult({
      ...analysisResult,
      analyzedTasks: updatedTasks,
    });
  };

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
    <div className="space-y-4">
      <Card className="w-full shadow-sm border border-gray-200 todo-reminder-card">
        {/* デバッグ情報表示（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-2 bg-blue-50 text-xs">
            🐛 ToDo数: {todos.length}, 状態: {status}, プレミアム: {hasPremium ? 'Yes' : 'No'}
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <TodoHeader
              hasPremium={hasPremium}
              streakCount={streakCount}
              completedToday={completedCount}
              totalToday={totalCount}
              productivityScore={progressPercentage}
            />

            {/* デバッグ用ボタン表示条件確認 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500">
                ボタン条件: Premium={hasPremium ? 'Yes' : 'No'}, Todos={todos.length}
              </div>
            )}

            {/* AI分析ボタン */}
            {(hasPremium || process.env.NODE_ENV === 'development') && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('テストボタンクリック');
                    toast.success('ボタンクリックテスト成功');
                  }}
                  className="flex items-center gap-2"
                >
                  テスト
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeTodos}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  {isAnalyzing ? 'AI分析中...' : 'AI分析'}
                </Button>
              </div>
            )}
          </div>
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
            onAnalyzeRequest={handleAnalyzeTodos}
          />
        </CardContent>
      </Card>

      {/* AI分析結果 */}
      {showAIAnalysis && (
        <TodoAIAnalysis
          analysisResult={analysisResult}
          isLoading={isAnalyzing}
          onAnalyze={handleAnalyzeTodos}
          onApplyRecommendation={handleApplyRecommendation}
          onDismissRecommendation={handleDismissRecommendation}
        />
      )}
    </div>
  );
};

export default DailyTodoReminder;
