// src/services/api/todoApi.ts

import { AxiosResponse } from 'axios';
import { api } from './apiConfig';
import { TodoItem } from '@/types';

export interface TodoApiResponse {
  message: string;
  todo: TodoItem;
}

interface ReorderResponse {
  message: string;
  todos: TodoItem[];
}

// TodoHistoryのインターフェース
export interface TodoHistoryItem {
  date: string;
  completedCount: number;
  taskDetails: Array<{
    task: string;
    completedDate: string | null;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export const todoApi = {
  getAll: async (): Promise<TodoItem[]> => {
    const resp = await api.get('/todos');
    const items = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? []);
    return items as TodoItem[];
  },

  // createdAt パラメータを追加
  create: (
    task: string,
    priority: number,
    isPrioritized: boolean,
    type: 'input' | 'output' = 'input',
    deadline?: string,
    createdAt?: string // createdAt パラメータを追加
  ): Promise<AxiosResponse<TodoApiResponse>> => {
    return api.post<TodoApiResponse>('/todos', {
      task,
      priority,
      isPrioritized,
      type,
      deadline,
      createdAt, // APIリクエストに createdAt を含める
    });
  },

  update: (_id: string, updates: Partial<TodoItem>): Promise<AxiosResponse<TodoApiResponse>> => {
    return api.put<TodoApiResponse>(`/todos/${_id}`, updates);
  },

  delete: (_id: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/todos/${_id}`);
  },

  reset: (): Promise<AxiosResponse<TodoItem[]>> => {
    return api.post<TodoItem[]>('/todos/reset');
  },

  reorder: (items: TodoItem[]): Promise<AxiosResponse<ReorderResponse>> => {
    return api.post<ReorderResponse>('/todos/reorder', { items });
  },

  togglePriority: (_id: string): Promise<AxiosResponse<TodoApiResponse>> => {
    return api.post<TodoApiResponse>(`/todos/${_id}/toggle-priority`);
  },

  getHistory: async (): Promise<TodoHistoryItem[]> => {
    const resp = await api.get('/todos/history');
    return (Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? [])) as TodoHistoryItem[];
  },

  getDailyHistory: async (): Promise<{ date: string; count: number }[]> => {
    const resp = await api.get('/todos/history/daily');
    return (Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? [])) as {
      date: string;
      count: number;
    }[];
  },
};
