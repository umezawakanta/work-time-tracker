import { useState, useMemo } from 'react';
import { Todo } from '../types';

type FilterStatus = "all" | "active" | "completed";
type CategoryFilter = "all" | "input" | "output" | "deadline";

interface FilterControls {
    readonly filterStatus: FilterStatus;
    readonly setFilterStatus: (status: FilterStatus) => void;
    readonly categoryFilter: CategoryFilter;
    readonly setCategoryFilter: (category: CategoryFilter) => void;
    readonly showFilters: boolean;
    readonly setShowFilters: (show: boolean) => void;
}

interface UseTodoFiltersReturn {
    readonly filteredTodos: readonly Todo[];
    readonly filterControls: FilterControls;
}

/**
 * Custom hook for managing todo filters
 */
export const useTodoFilters = (todos: readonly Todo[]): UseTodoFiltersReturn => {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const filteredTodos = useMemo(() => {
        let filtered = [...todos];

        // Apply status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter(todo => {
                if (filterStatus === "completed") return todo.completed;
                if (filterStatus === "active") return !todo.completed;
                return true;
            });
        }

        // Apply category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter(todo => {
                if (categoryFilter === "input") return todo.type === "input";
                if (categoryFilter === "output") return todo.type === "output";
                if (categoryFilter === "deadline") return !!todo.deadline;
                return true;
            });
        }

        return filtered;
    }, [todos, filterStatus, categoryFilter]);

    return {
        filteredTodos,
        filterControls: {
            filterStatus,
            setFilterStatus,
            categoryFilter,
            setCategoryFilter,
            showFilters,
            setShowFilters,
        },
    };
};