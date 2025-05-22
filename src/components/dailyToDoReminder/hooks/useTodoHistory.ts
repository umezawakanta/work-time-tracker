import { useMemo } from 'react';
import { Todo } from '../types';

interface TodoHistoryData {
    readonly date: string;
    readonly count: number;
}

interface UseTodoHistoryReturn {
    readonly streakCount: number;
    readonly todoHistory: readonly TodoHistoryData[];
    readonly dailyHistory: readonly TodoHistoryData[];
}

/**
 * Custom hook for managing todo history data
 */
export const useTodoHistory = (todos: readonly Todo[]): UseTodoHistoryReturn => {
    return useMemo(() => {
        // Calculate streak count
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streakCount = 0;
        let dayOffset = 0;

        // This is a simplified implementation
        // In a real app, you'd check actual completion dates
        const hasCompletedTodoOnDate = (date: Date): boolean => {
            const dateStr = date.toISOString().split('T')[0];
            return todos.some(todo =>
                todo.completed &&
                todo.completedAt &&
                todo.completedAt.startsWith(dateStr)
            );
        };

        // Calculate streak by checking consecutive days
        while (true) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - dayOffset);
            
            if (hasCompletedTodoOnDate(checkDate)) {
                streakCount++;
                dayOffset++;
            } else {
                break;
            }
        }

        // Generate history data
        const todoHistory: TodoHistoryData[] = [];
        const dailyHistory: TodoHistoryData[] = [];

        // Group todos by date
        const todosByDate = new Map<string, number>();

        todos.forEach(todo => {
            if (todo.completed && todo.completedAt) {
                const date = todo.completedAt.split('T')[0];
                todosByDate.set(date, (todosByDate.get(date) || 0) + 1);
            }
        });

        // Convert to array
        todosByDate.forEach((count, date) => {
            todoHistory.push({ date, count });
        });

        // Sort by date
        todoHistory.sort((a, b) => a.date.localeCompare(b.date));

        // For daily history, you might want to include all days in a range
        // For now, using the same as todoHistory
        dailyHistory.push(...todoHistory);

        return {
            streakCount,
            todoHistory,
            dailyHistory,
        };
    }, [todos]);
};