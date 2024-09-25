import { WorkTimeEntry } from "@/types/workTimeEntry";
import axios, { AxiosError } from "axios";

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
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
    date: new Date().toISOString(),
  },
  {
    _id: "2",
    projectName: "Project B",
    description: "Task 2",
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date().toISOString(),
    duration: 7200,
    date: new Date().toISOString(),
  },
];

export const workTimeApi = {
  getAll: () =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData })
      : api.get<WorkTimeEntry[]>("/worktime"),
  getById: (id: string) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.find((entry) => entry._id === id) })
      : api.get<WorkTimeEntry>(`/worktime/${id}`),
  create: (entry: Omit<WorkTimeEntry, "_id">) =>
    USE_MOCK_DATA
      ? Promise.resolve({
          data: { ...entry, _id: String(mockData.length + 1) },
        })
      : api.post<WorkTimeEntry>("/worktime", entry),
  update: (id: string, entry: Partial<WorkTimeEntry>) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: { ...entry, _id: id } as WorkTimeEntry })
      : api.put<WorkTimeEntry>(`/worktime/${id}`, entry),
  delete: (id: string) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: null })
      : api.delete(`/worktime/${id}`),
};

export default api;
