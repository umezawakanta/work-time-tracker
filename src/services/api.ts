import { WorkTimeEntry } from "@/types/workTimeEntry";
import axios, { AxiosError, AxiosResponse } from "axios";

let API_BASE_URL = "http://localhost:3001/api"; // デフォルト値
const USE_MOCK_DATA = process.env.VITE_USE_MOCK_DATA === "true" || false;

if (typeof process !== "undefined" && process.env) {
  API_BASE_URL = process.env.VITE_API_BASE_URL || API_BASE_URL;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log("Request data:", config.data); // リクエストデータをログに出力
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("Response data:", response.data); // レスポンスデータをログに出力
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、ログインページにリダイレクト
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const mockData: WorkTimeEntry[] = [
  {
    _id: "1",
    projectName: "Project A",
    description: "Task 1",
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    duration: 3600,
    date: new Date().toISOString().split("T")[0],
  },
  {
    _id: "2",
    projectName: "Project B",
    description: "Task 2",
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date().toISOString(),
    duration: 7200,
    date: new Date().toISOString().split("T")[0],
  },
];

export const workTimeApi = {
  getAll: (): Promise<AxiosResponse<WorkTimeEntry[]>> =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData } as AxiosResponse<WorkTimeEntry[]>)
      : api.get<WorkTimeEntry[]>("/worktime"),
  getById: (id: string): Promise<AxiosResponse<WorkTimeEntry | undefined>> =>
    USE_MOCK_DATA
      ? Promise.resolve({
          data: mockData.find((entry) => entry._id === id),
        } as AxiosResponse<WorkTimeEntry | undefined>)
      : api.get<WorkTimeEntry>(`/worktime/${id}`),
  create: (
    entry: Omit<WorkTimeEntry, "_id">
  ): Promise<AxiosResponse<WorkTimeEntry>> =>
    USE_MOCK_DATA
      ? Promise.resolve({
          data: { ...entry, _id: String(mockData.length + 1) },
        } as AxiosResponse<WorkTimeEntry>)
      : api.post<WorkTimeEntry>("/worktime", entry),
  update: (
    id: string,
    entry: Partial<WorkTimeEntry>
  ): Promise<AxiosResponse<WorkTimeEntry>> =>
    USE_MOCK_DATA
      ? Promise.resolve({
          data: { ...entry, _id: id } as WorkTimeEntry,
        } as AxiosResponse<WorkTimeEntry>)
      : api.put<WorkTimeEntry>(`/worktime/${id}`, entry),
  delete: (id: string): Promise<AxiosResponse<null>> =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: null } as AxiosResponse<null>)
      : api.delete(`/worktime/${id}`),
};

export default api;
