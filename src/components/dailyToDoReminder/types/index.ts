// Base Todo interface that matches the store structure
export interface TodoItem {
  readonly id: string;
  readonly text: string;
  readonly completed: boolean;
  readonly priority: number;
  readonly isPrioritized: boolean;
  readonly type: 'input' | 'output';
  readonly deadline?: string;
  readonly createdAt: string;
  readonly category?: string;
  readonly tags?: readonly string[];
}

// Extended Todo interface with additional computed properties
export interface Todo extends TodoItem {
  readonly updatedAt: string;
  readonly completedAt?: string;
  readonly estimatedDuration?: number;
  readonly actualDuration?: number;
}

// Type guard to check if TodoItem has updatedAt (making it a Todo)
export const isTodo = (item: TodoItem): item is Todo => {
  return 'updatedAt' in item && typeof (item as Todo).updatedAt === 'string';
};

// Converter function to transform TodoItem to Todo
export const todoItemToTodo = (item: TodoItem): Todo => {
  if (isTodo(item)) {
    return item;
  }

  return {
    ...item,
    updatedAt: item.createdAt, // Use createdAt as fallback for updatedAt
    completedAt: item.completed ? new Date().toISOString() : undefined,
  };
};

// Array converter
export const todoItemsToTodos = (items: readonly TodoItem[]): readonly Todo[] => {
  return items.map(todoItemToTodo);
};
