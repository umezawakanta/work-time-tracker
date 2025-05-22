import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { TodoItem, Todo, todoItemsToTodos } from '../../types';

// Base selectors
export const selectTodoItems = (state: RootState): readonly TodoItem[] => {
    const items = state.todo?.items;
    return Array.isArray(items) ? items : [];
};

export const selectTodoStatus = (state: RootState): string =>
    state.todo?.status || 'idle';

export const selectTodoError = (state: RootState): string | null =>
    state.todo?.error || null;

export const selectTodoHistory = (state: RootState): Record<string, number> => {
    // If history doesn't exist on TodoState, return empty object
    const todoState = state.todo as any;
    return todoState?.history || {};
};

export const selectDailyHistory = (state: RootState): readonly { date: string; count: number; }[] => {
    // If dailyHistory doesn't exist on TodoState, return empty array
    const todoState = state.todo as any;
    return todoState?.dailyHistory || [];
};

export const selectIsPremium = (state: RootState): boolean => {
    const todoState = state.todo as any;
    return todoState?.isPremium || false;
};

// Memoized selector for converting TodoItems to Todos
export const selectTodos = createSelector(
    [selectTodoItems],
    (todoItems: readonly TodoItem[]): readonly Todo[] => {
        return todoItemsToTodos(todoItems);
    }
);

// Additional computed selectors
export const selectActiveTodos = createSelector(
    [selectTodos],
    (todos: readonly Todo[]): readonly Todo[] => {
        return todos.filter((todo: Todo) => !todo.completed);
    }
);

export const selectCompletedTodos = createSelector(
    [selectTodos],
    (todos: readonly Todo[]): readonly Todo[] => {
        return todos.filter((todo: Todo) => todo.completed);
    }
);

export const selectTodoStats = createSelector(
    [selectTodos],
    (todos: readonly Todo[]) => {
        const total = todos.length;
        const completed = todos.filter((todo: Todo) => todo.completed).length;
        const active = total - completed;
        const inputCount = todos.filter((todo: Todo) => todo.type === 'input').length;
        const outputCount = todos.filter((todo: Todo) => todo.type === 'output').length;

        return {
            total,
            completed,
            active,
            inputCount,
            outputCount,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }
);