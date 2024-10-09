import { AxiosResponse } from "axios";
import { TodoItem } from "../../store/todoSlice";
import { api, USE_MOCK_DATA } from "./apiConfig";

const mockTodoData: TodoItem[] = [
  { _id: "1", task: "洗い物", completed: false },
  { _id: "2", task: "掃除", completed: false },
  { _id: "3", task: "ゴミ捨て", completed: false },
  { _id: "4", task: "片づけ", completed: false },
];

interface TodoApiResponse {
  message: string;
  todo: TodoItem;
}

export const todoApi = {
  getAll: (): Promise<AxiosResponse<TodoItem[]>> => {
    console.log("Fetching all todo items");
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockTodoData } as AxiosResponse<TodoItem[]>)
      : api.get<TodoItem[]>("/todos").then((response) => {
          console.log("Received todo items:", response.data);
          return response;
        });
  },
  create: (task: string): Promise<AxiosResponse<TodoApiResponse>> => {
    console.log("Creating new todo item:", task);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "ToDoアイテムが正常に追加されました",
            todo: {
              _id: String(mockTodoData.length + 1),
              task,
              completed: false,
            },
          },
        } as AxiosResponse<TodoApiResponse>)
      : api.post<TodoApiResponse>("/todos", { task }).then((response) => {
          console.log("Created todo item:", response.data);
          return response;
        });
  },
  update: (
    _id: string,
    updates: Partial<TodoItem>
  ): Promise<AxiosResponse<TodoApiResponse>> => {
    console.log("Updating todo item:", _id, updates);
    
    // Ensure that the task field is always included in the update request
    if (!updates.task) {
      const existingTodo = USE_MOCK_DATA
        ? mockTodoData.find((item) => item._id === _id)
        : undefined;
      
      if (existingTodo) {
        updates.task = existingTodo.task;
      } else {
        return Promise.reject(new Error("Task field is required for updates"));
      }
    }

    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "ToDoアイテムが正常に更新されました",
            todo: {
              ...mockTodoData.find((item) => item._id === _id),
              ...updates,
              _id,
            },
          },
        } as AxiosResponse<TodoApiResponse>)
      : api
          .put<TodoApiResponse>(`/todos/${_id}`, updates)
          .then((response) => {
            console.log("Updated todo item:", response.data);
            return response;
          })
          .catch((error) => {
            console.error("Error updating todo item:", error.response?.data);
            throw error;
          });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log("Deleting todo item:", _id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api.delete(`/todos/${_id}`).then((response) => {
          console.log("Deleted todo item:", _id);
          return response;
        });
  },
  reset: (): Promise<AxiosResponse<TodoItem[]>> => {
    console.log("Resetting todo list");
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockTodoData } as AxiosResponse<TodoItem[]>)
      : api.post<TodoItem[]>("/todos/reset").then((response) => {
          console.log("Reset todo list");
          return response;
        });
  },
};
