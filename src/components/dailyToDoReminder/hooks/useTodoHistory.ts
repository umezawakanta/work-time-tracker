import { useMemo } from 'react';
import { Todo } from '../types';

// TodoCalendarと互換性のある型定義
export interface TodoHistoryItem {
  date: string;
  count: number;
  completed?: number;
  categories?: string[];
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

interface UseTodoHistoryReturn {
  readonly streakCount: number;
  readonly todoHistory: readonly TodoHistoryItem[];
  readonly dailyHistory: readonly TodoHistoryItem[];
}

/**
 * Custom hook for managing todo history data
 * TodoCalendarコンポーネントと互換性のあるデータ形式を返す
 */
export const useTodoHistory = (todos: readonly Todo[]): UseTodoHistoryReturn => {
  return useMemo(() => {
    console.log('[useTodoHistory] 🔄 履歴データ計算開始:', {
      todosCount: todos.length,
      todos: todos.slice(0, 3).map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
        type: t.type,
        priority: t.priority,
      })),
    });

    // Calculate streak count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streakCount = 0;
    let dayOffset = 0;

    // Check if user completed any todos on given date
    const hasCompletedTodoOnDate = (date: Date): boolean => {
      const dateStr = date.toISOString().split('T')[0];
      return todos.some(
        (todo) => todo.completed && todo.completedAt && todo.completedAt.startsWith(dateStr)
      );
    };

    // Calculate streak by checking consecutive days
    while (dayOffset < 30) {
      // 最大30日まで検索
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - dayOffset);

      if (hasCompletedTodoOnDate(checkDate)) {
        streakCount++;
        dayOffset++;
      } else {
        if (dayOffset === 0) {
          // 今日完了していない場合は昨日から開始
          dayOffset++;
          continue;
        }
        break;
      }
    }

    // 日付ごりにタスクをグループ化（作成日と完了日両方を考慮）
    const todosByDate = new Map<
      string,
      {
        total: number;
        completed: number;
        todos: Todo[];
        categories: Set<string>;
        priorities: number[];
      }
    >();

    // 作成されたタスクを追加
    todos.forEach((todo) => {
      const createdDate = todo.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];

      if (!todosByDate.has(createdDate)) {
        todosByDate.set(createdDate, {
          total: 0,
          completed: 0,
          todos: [],
          categories: new Set(),
          priorities: [],
        });
      }

      const dayData = todosByDate.get(createdDate)!;
      dayData.total++;
      dayData.todos.push(todo);
      dayData.categories.add(todo.type);
      dayData.priorities.push(todo.priority);

      // 完了日が異なる場合は完了日にも記録
      if (todo.completed && todo.completedAt) {
        const completedDate = todo.completedAt.split('T')[0];
        if (completedDate !== createdDate) {
          if (!todosByDate.has(completedDate)) {
            todosByDate.set(completedDate, {
              total: 0,
              completed: 0,
              todos: [],
              categories: new Set(),
              priorities: [],
            });
          }
          const completedDayData = todosByDate.get(completedDate)!;
          completedDayData.completed++;
        }
      }
    });

    // 完了タスクをカウント（作成日ベース）
    todos.forEach((todo) => {
      if (todo.completed) {
        const createdDate = todo.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];
        const dayData = todosByDate.get(createdDate);
        if (dayData) {
          dayData.completed++;
        }
      }
    });

    // 優先度を判定する関数
    const determinePriority = (priorities: number[]): 'low' | 'medium' | 'high' => {
      if (priorities.length === 0) return 'medium';
      const avgPriority = priorities.reduce((sum, p) => sum + p, 0) / priorities.length;
      if (avgPriority >= 4) return 'high';
      if (avgPriority >= 2.5) return 'medium';
      return 'low';
    };

    // TodoHistoryItem形式に変換
    const todoHistory: TodoHistoryItem[] = Array.from(todosByDate.entries())
      .map(
        ([date, data]): TodoHistoryItem => ({
          date,
          count: data.total,
          completed: data.completed,
          categories: Array.from(data.categories),
          priority: determinePriority(data.priorities),
          notes:
            data.completed > 0
              ? `${data.completed}/${data.total} タスク完了`
              : `${data.total}個のタスク作成`,
        })
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    // 過去30日間のデータも生成（空の日も含める）
    const dailyHistory: TodoHistoryItem[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const existingData = todoHistory.find((item) => item.date === dateStr);
      if (existingData) {
        dailyHistory.push(existingData);
      } else {
        // データがない日は空のエントリを追加
        dailyHistory.push({
          date: dateStr,
          count: 0,
          completed: 0,
          categories: [],
          priority: 'medium',
          notes: 'タスクなし',
        });
      }
    }

    console.log('[useTodoHistory] ✅ 履歴データ計算完了:', {
      streakCount,
      todoHistoryLength: todoHistory.length,
      dailyHistoryLength: dailyHistory.length,
      sampleTodoHistory: todoHistory.slice(0, 3),
      sampleDailyHistory: dailyHistory.slice(-3),
    });

    return {
      streakCount,
      todoHistory,
      dailyHistory,
    };
  }, [todos]);
};
