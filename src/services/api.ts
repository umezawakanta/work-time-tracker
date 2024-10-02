import axios, { AxiosResponse } from "axios";
import { WorkTimeEntry } from "../types/workTimeEntry";
import { AssetEntry } from "../types/assetEntry";
import { DebtEntry } from "../types/debtEntry";

const USE_MOCK_DATA = false;

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    console.log("Request:", config.method?.toUpperCase(), config.url);
    console.log("Request data:", config.data);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.statusText);
    console.log("Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);

const mockWorkTimeData: WorkTimeEntry[] = [
  {
    _id: "1",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    duration: 28800,
    projectName: "Project A",
    description: "Worked on feature X",
  },
  {
    _id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "18:00",
    duration: 28800,
    projectName: "Project B",
    description: "Fixed bug Y",
  },
];

const mockAssetData: AssetEntry[] = [
  {
    _id: "1",
    date: new Date().toISOString().split("T")[0],
    value: 1000000,
    account: "銀行A",
  },
  {
    _id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    value: 500000,
    account: "銀行B",
  },
];

const mockDebtData: DebtEntry[] = [
  {
    _id: "1",
    date: new Date().toISOString().split("T")[0],
    value: 500000,
    description: "住宅ローン",
    account: "銀行A",
  },
  {
    _id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    value: 100000,
    description: "クレジットカード",
    account: "カード会社B",
  },
];

// ToDoリストのモックデータを追加
const mockTodoData: TodoItem[] = [
  { id: "1", task: "洗い物", completed: false },
  { id: "2", task: "掃除", completed: false },
  { id: "3", task: "ゴミ捨て", completed: false },
  { id: "4", task: "片づけ", completed: false },
];

interface WorkTimeApiResponse {
  message: string;
  workTime: WorkTimeEntry;
}

interface AssetApiResponse {
  message: string;
  asset: AssetEntry;
}

interface DebtApiResponse {
  message: string;
  debt: DebtEntry;
}

// ToDoアイテムのインターフェースを追加
interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
}

interface TodoApiResponse {
  message: string;
  todo: TodoItem;
}

export const workTimeApi = {
  getAll: (): Promise<AxiosResponse<WorkTimeEntry[]>> => {
    console.log("Fetching all work time entries");
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockWorkTimeData } as AxiosResponse<
          WorkTimeEntry[]
        >)
      : api.get<WorkTimeEntry[]>("/worktime").then((response) => {
          console.log("Received work time entries:", response.data);
          return response;
        });
  },
  create: (
    entry: Omit<WorkTimeEntry, "_id">
  ): Promise<AxiosResponse<WorkTimeApiResponse>> => {
    console.log("Creating new work time entry:", entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "作業時間が正常に記録されました",
            workTime: { ...entry, _id: String(mockWorkTimeData.length + 1) },
          },
        } as AxiosResponse<WorkTimeApiResponse>)
      : api.post<WorkTimeApiResponse>("/worktime", entry).then((response) => {
          console.log("Created work time entry:", response.data);
          return response;
        });
  },
  update: (
    id: string,
    entry: Partial<WorkTimeEntry>
  ): Promise<AxiosResponse<WorkTimeApiResponse>> => {
    console.log("Updating work time entry:", id, entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "作業時間が正常に更新されました",
            workTime: {
              ...mockWorkTimeData.find((e) => e._id === id),
              ...entry,
              _id: id,
            },
          },
        } as AxiosResponse<WorkTimeApiResponse>)
      : api
          .put<WorkTimeApiResponse>(`/worktime/${id}`, entry)
          .then((response) => {
            console.log("Updated work time entry:", response.data);
            return response;
          });
  },
  delete: (id: string): Promise<AxiosResponse<void>> => {
    console.log("Deleting work time entry:", id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api.delete(`/worktime/${id}`).then((response) => {
          console.log("Deleted work time entry:", id);
          return response;
        });
  },
};

export const assetApi = {
  getAll: (): Promise<AxiosResponse<AssetEntry[]>> => {
    console.log("Fetching all asset entries");
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockAssetData } as AxiosResponse<AssetEntry[]>)
      : api.get<AssetEntry[]>("/asset").then((response) => {
          console.log("Received asset entries:", response.data);
          return response;
        });
  },
  create: (
    entry: Omit<AssetEntry, "_id">
  ): Promise<AxiosResponse<AssetApiResponse>> => {
    console.log("Creating new asset entry:", entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "資産情報が正常に記録されました",
            asset: { ...entry, _id: String(mockAssetData.length + 1) },
          },
        } as AxiosResponse<AssetApiResponse>)
      : api.post<AssetApiResponse>("/asset", entry).then((response) => {
          console.log("Created asset entry:", response.data);
          return response;
        });
  },
  update: (
    id: string,
    entry: Partial<AssetEntry>
  ): Promise<AxiosResponse<AssetApiResponse>> => {
    console.log("Updating asset entry:", id, entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "資産情報が正常に更新されました",
            asset: {
              ...mockAssetData.find((e) => e._id === id),
              ...entry,
              _id: id,
            },
          },
        } as AxiosResponse<AssetApiResponse>)
      : api.put<AssetApiResponse>(`/asset/${id}`, entry).then((response) => {
          console.log("Updated asset entry:", response.data);
          return response;
        });
  },
  delete: (id: string): Promise<AxiosResponse<void>> => {
    console.log("Deleting asset entry:", id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api
          .delete(`/asset/${id}`)
          .then((response) => {
            console.log("Deleted asset entry:", id);
            return response;
          })
          .catch((error) => {
            console.error("Error deleting asset entry:", error);
            if (error.response) {
              console.error("Server responded with:", error.response.data);
            }
            throw error;
          });
  },
};

export const debtApi = {
  getAll: (): Promise<AxiosResponse<DebtEntry[]>> => {
    console.log("Fetching all debt entries");
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockDebtData } as AxiosResponse<DebtEntry[]>)
      : api.get<DebtEntry[]>("/debt").then((response) => {
          console.log("Received debt entries:", response.data);
          return response;
        });
  },
  create: (
    entry: Omit<DebtEntry, "_id">
  ): Promise<AxiosResponse<DebtApiResponse>> => {
    console.log("Creating new debt entry:", entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "負債情報が正常に記録されました",
            debt: { ...entry, _id: String(mockDebtData.length + 1) },
          },
        } as AxiosResponse<DebtApiResponse>)
      : api.post<DebtApiResponse>("/debt", entry).then((response) => {
          console.log("Created debt entry:", response.data);
          return response;
        });
  },
  update: (
    id: string,
    entry: Partial<DebtEntry>
  ): Promise<AxiosResponse<DebtApiResponse>> => {
    console.log("Updating debt entry:", id, entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "負債情報が正常に更新されました",
            debt: {
              ...mockDebtData.find((e) => e._id === id),
              ...entry,
              _id: id,
            },
          },
        } as AxiosResponse<DebtApiResponse>)
      : api.put<DebtApiResponse>(`/debt/${id}`, entry).then((response) => {
          console.log("Updated debt entry:", response.data);
          return response;
        });
  },
  delete: (id: string): Promise<AxiosResponse<void>> => {
    console.log("Deleting debt entry:", id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api
          .delete(`/debt/${id}`)
          .then((response) => {
            console.log("Deleted debt entry:", id);
            return response;
          })
          .catch((error) => {
            console.error("Error deleting debt entry:", error);
            if (error.response) {
              console.error("Server responded with:", error.response.data);
            }
            throw error;
          });
  },
};

// ToDoリストのAPIを追加
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
              id: String(mockTodoData.length + 1),
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
    id: string,
    updates: Partial<TodoItem>
  ): Promise<AxiosResponse<TodoApiResponse>> => {
    console.log("Updating todo item:", id, updates);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "ToDoアイテムが正常に更新されました",
            todo: {
              ...mockTodoData.find((item) => item.id === id),
              ...updates,
              id,
            },
          },
        } as AxiosResponse<TodoApiResponse>)
      : api.put<TodoApiResponse>(`/todos/${id}`, updates).then((response) => {
          console.log("Updated todo item:", response.data);
          return response;
        });
  },
  delete: (id: string): Promise<AxiosResponse<void>> => {
    console.log("Deleting todo item:", id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api.delete(`/todos/${id}`).then((response) => {
          console.log("Deleted todo item:", id);
          return response;
        });
  },
  reset: (): Promise<AxiosResponse<void>> => {
    console.log("Resetting todo list");
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api.post("/todos/reset").then((response) => {
          console.log("Reset todo list");
          return response;
        });
  },
};
