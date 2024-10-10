import { api } from './apiConfig';
import { TodoItem } from '@/store/todoSlice';

export const todoApi = {
  getAll: () => api.get<TodoItem[]>('/todos'),
  create: (task: string) => api.post<TodoItem>('/todos', { task }),
  update: (id: string, updates: Partial<TodoItem>) => api.put<TodoItem>(`/todos/${id}`, updates),
  delete: (id: string) => api.delete(`/todos/${id}`),
  reset: () => api.post('/todos/reset'),
  reorder: (items: TodoItem[]) => api.put<TodoItem[]>('/todos/reorder', { items }),
};