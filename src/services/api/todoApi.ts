import { AxiosResponse } from "axios";
import { TodoItem } from "@/store/todoSlice";
import { api } from "./apiConfig";

interface TodoApiResponse {
  message: string;
  todo: TodoItem;
}

export const todoApi = {
  getAll: (): Promise<AxiosResponse<TodoItem[]>> => {
    return api.get<TodoItem[]>("/todos");
  },

  create: (task: string): Promise<AxiosResponse<TodoApiResponse>> => {
    return api.post<TodoApiResponse>("/todos", { task });
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
};