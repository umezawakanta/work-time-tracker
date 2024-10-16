import { AxiosResponse } from "axios";
import { TodoItem } from "@/store/todoSlice";
import { api } from "./apiConfig";

interface TodoApiResponse {
  message: string;
  todo: TodoItem;
}

interface ReorderResponse {
  message: string;
  todos: TodoItem[];
}

export const todoApi = {
  getAll: (): Promise<AxiosResponse<TodoItem[]>> => {
    return api.get<TodoItem[]>("/todos");
  },

  create: (task: string, priority: number): Promise<AxiosResponse<TodoApiResponse>> => {
    return api.post<TodoApiResponse>("/todos", { task, priority });
  },

  update: (
    _id: string,
    updates: Partial<TodoItem>
  ): Promise<AxiosResponse<TodoApiResponse>> => {
    return api.put<TodoApiResponse>(`/todos/${_id}`, updates);
  },

  delete: (_id: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/todos/${_id}`);
  },

  reset: (): Promise<AxiosResponse<TodoItem[]>> => {
    return api.post<TodoItem[]>("/todos/reset");
  },

  reorder: (items: TodoItem[]): Promise<AxiosResponse<ReorderResponse>> => {
    return api.post<ReorderResponse>("/todos/reorder", { items });
  },
};