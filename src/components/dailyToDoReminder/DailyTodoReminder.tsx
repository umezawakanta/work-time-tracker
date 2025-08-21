import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import SocialShareButton from '@/components/ui/SocialShareButton';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useResponsive } from '@/hooks/useResponsive';

// Store actions and selectors
import { fetchTodoItems, deleteTodoItem, updateTodoItem, addTodoItem } from '@/store/todoSlice';
import { selectTodos, selectTodoStatus, selectTodoError } from '@/store/todoSlice';
import { AppDispatch, RootState } from '@/store';

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
import { useUserTracking } from '@/hooks/useUserTracking';

// Types
import { TodoItem } from '@/types';

// Styles
import './DailyTodoReminder.css';

// Services
import { todoAnalysisService, TodoAnalysisResult } from '@/services/ai/todoAnalysisService';
import type { TaskRecommendation } from '@/types/ai';

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
  const loading = useSelector(selectTodoStatus) === 'loading';
  const error = useSelector(selectTodoError);

  // Stats calculation (inline replacement for selectTodoStats)
  const stats = React.useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo: TodoItem) => todo.completed).length;
    const pending = total - completed;
    const inputCount = todos.filter((todo: TodoItem) => todo.type === 'input').length;
    const outputCount = todos.filter((todo: TodoItem) => todo.type === 'output').length;

    return {
      total,
      completed,
      pending,
      inputCount,
      outputCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [todos]);

  // Custom hooks for state management
  const { selectedTab, setSelectedTab } = useTodoState();
  const { streakCount, todoHistory, dailyHistory } = useTodoHistory(todos as any);
  const { filteredTodos, filterControls } = useTodoFilters(todos as any);
  const { trackInteraction, trackAIUsage } = useUserTracking();

  // AI analysis related state
  const [analysisResult, setAnalysisResult] = useState<TodoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const { isMobile } = useResponsive();

  // Initial data loading - run only once
  useEffect(() => {
    console.log('[DailyTodoReminder] 🔄 初期化開始');
    dispatch(fetchTodoItems());
  }, [dispatch]);

  // Debug: Redux stateの変更を追跡
  useEffect(() => {
    console.log('[DailyTodoReminder] 📊 Redux state更新:', {
      todosCount: todos.length,
      loading,
      error,
      todosSample: todos
        .slice(0, 3)
        .filter((t) => t && t._id)
        .map((t) => ({ _id: t._id, task: t.task, type: t.type })),
    });
  }, [todos, loading, error]);

  // エラー処理を別のuseEffectに分離
  useEffect(() => {
    if (error) {
      console.error('[DailyTodoReminder] ❌ ToDoデータエラー:', error);
      toast.error(`ToDoデータの取得に失敗しました: ${error}`);
    }
  }, [error]);

  // Progress calculations
  const completedCount = todos.filter((todo: TodoItem) => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const inputCount = todos.filter((todo: TodoItem) => todo.type === 'input').length;
  const outputCount = todos.filter((todo: TodoItem) => todo.type === 'output').length;

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
      // 実際のToDoデータを分析用の形式にマッピング
      const tasksForAnalysis = todos
        .filter((todo): todo is TodoItem => Boolean((todo as any)?._id))
        .map((todo: TodoItem) => ({
          id: todo._id,
          task: todo.task,
          description: todo.category || '',
        }));

      console.log('[DEBUG] todoAnalysisService呼び出し前 - 実データ:', tasksForAnalysis.length);
      const result = await todoAnalysisService.analyzeTodos(tasksForAnalysis);
      console.log('[DEBUG] 分析結果:', result);

      setAnalysisResult(result);
      setShowAIAnalysis(true);
      console.log('[DEBUG] showAIAnalysis設定:', true);
      console.log('[DEBUG] analysisResult設定:', result);

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
  const handleApplyRecommendation = (_taskId: string, _recommendation: TaskRecommendation) => {
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

  // 一括適用ハンドラーを追加
  const handleApplyAllRecommendations = useCallback(async () => {
    if (!analysisResult) return;

    const confirmMessage = '全ての推奨事項を適用しますか？この操作は元に戻せません。';
    if (!window.confirm(confirmMessage)) return;

    try {
      let appliedCount = 0;

      for (const task of analysisResult.analyzedTasks) {
        for (const recommendation of task.recommendations) {
          try {
            switch (recommendation.type) {
              case 'delete':
                await dispatch(deleteTodoItem(task.id)).unwrap();
                appliedCount++;
                break;

              case 'rewrite':
                if (recommendation.rewrittenTask) {
                  await dispatch(
                    updateTodoItem({
                      _id: task.id,
                      updates: { task: recommendation.rewrittenTask },
                    })
                  ).unwrap();
                  appliedCount++;
                }
                break;

              case 'split':
                if (recommendation.newTasks && recommendation.newTasks.length > 0) {
                  // 元のタスクを削除
                  await dispatch(deleteTodoItem(task.id)).unwrap();

                  // 新しいタスクを追加
                  for (const newTaskText of recommendation.newTasks) {
                    await dispatch(
                      addTodoItem({
                        task: newTaskText,
                        priority: 3,
                        isPrioritized: false,
                        type: 'input',
                      })
                    ).unwrap();
                  }
                  appliedCount++;
                }
                break;

              case 'clarify':
                // 明確化は手動での確認が必要なため、自動適用はスキップ
                console.log(`明確化が必要なタスク: ${task.originalTask}`);
                break;

              default:
                console.warn('未対応の推奨事項タイプ:', recommendation.type);
            }
          } catch (error) {
            console.error(`タスク ${task.id} の推奨事項適用に失敗:`, error);
          }
        }
      }

      toast.success(`${appliedCount}件の推奨事項を適用しました`);

      // 分析結果をクリア
      setAnalysisResult(null);
      setShowAIAnalysis(false);
    } catch (error) {
      console.error('一括適用エラー:', error);
      toast.error('一括適用中にエラーが発生しました');
    }
  }, [analysisResult, dispatch]);

  // 📱 モバイルファースト: プルツーリフレッシュでTodoデータ更新
  const handleRefresh = async () => {
    try {
      // Todoデータの再取得
      await Promise.all([
        dispatch(fetchTodoItems()), // 既存のloadTodos関数を使用
        // アチーブメントデータも更新
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
    } catch (error) {
      console.error('Todo refresh failed:', error);
    }
  };

  // Loading state
  if (loading) {
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
  if (error) {
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

  console.log('[DEBUG] showAIAnalysis状態:', showAIAnalysis);

  return (
    <div className="daily-todo-reminder">
      <Card className="w-full shadow-sm border border-gray-200 todo-reminder-card">
        {/* デバッグ情報表示（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-2 bg-blue-50 text-xs">
            🐛 ToDo数: {todos.length}, 状態: {loading ? 'loading' : 'loaded'}, プレミアム:{' '}
            {isPremium ? 'Yes' : 'No'}
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <TodoHeader
              hasPremium={isPremium}
              streakCount={streakCount}
              completedToday={completedCount}
              totalToday={totalCount}
              productivityScore={progressPercentage}
            />

            {/* デバッグ用ボタン表示条件確認 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500">
                ボタン条件: Premium={isPremium ? 'Yes' : 'No'}, Todos={todos.length}
              </div>
            )}

            {/* AI分析ボタン */}
            {(isPremium || process.env.NODE_ENV === 'development') && (
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
            todos={filteredTodos as any}
            todoHistory={todoHistory}
            dailyHistory={dailyHistory}
            hasPremium={isPremium}
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
          onApplyAllRecommendations={handleApplyAllRecommendations}
        />
      )}

      {isMobile ? (
        // 📱 モバイル: プルツーリフレッシュ対応
        <PullToRefresh
          onRefresh={handleRefresh}
          className="flex-1"
          refreshText="プルしてタスク更新"
          releaseText="離してタスク更新"
          loadingText="タスク更新中..."
        >
          <div className="space-y-4">
            {/* 既存のTodoリストコンテンツ */}
            {/* ... existing todo sections ... */}
          </div>
        </PullToRefresh>
      ) : (
        // デスクトップ: 通常レイアウト
        <div className="space-y-4">
          {/* 既存のTodoリストコンテンツ */}
          {/* ... existing todo sections ... */}
        </div>
      )}
    </div>
  );
};

export default DailyTodoReminder;
