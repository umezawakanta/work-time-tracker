import { WorkTimeEntry } from "@/types/workTimeEntry";
import { AssetEntry } from "@/store/assetSlice";
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

interface ApiResponse {
  message: string;
  workTime: WorkTimeEntry;
}

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
  ): Promise<AxiosResponse<ApiResponse>> =>
    USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "作業時間が正常に記録されました",
            workTime: { ...entry, _id: String(mockData.length + 1) },
          },
        } as AxiosResponse<ApiResponse>)
      : api.post<ApiResponse>("/worktime", entry),
  update: (
    id: string,
    entry: Partial<WorkTimeEntry>
  ): Promise<AxiosResponse<WorkTimeEntry>> =>
    USE_MOCK_DATA
      ? Promise.resolve({
          data: { ...entry, _id: id } as WorkTimeEntry,
        } as AxiosResponse<WorkTimeEntry>)
      : api.put<WorkTimeEntry>(`/worktime/${id}`, entry),
  delete: (id: string): Promise<AxiosResponse<void>> =>
    USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api.delete(`/worktime/${id}`),
};

const mockAssetData: AssetEntry[] = [
  {
    _id: "1",
    date: new Date().toISOString().split("T")[0],
    value: 1000000,
  },
  {
    _id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    value: 990000,
  },
];

interface AssetApiResponse {
  message: string;
  asset: AssetEntry;
}

export const assetApi = {
  getAll: (): Promise<AxiosResponse<AssetEntry[]>> =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockAssetData } as AxiosResponse<AssetEntry[]>)
      : api.get<AssetEntry[]>("/asset"),
  create: (
    entry: Omit<AssetEntry, "_id">
  ): Promise<AxiosResponse<AssetApiResponse>> =>
    USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "資産情報が正常に記録されました",
            asset: { ...entry, _id: String(mockAssetData.length + 1) },
          },
        } as AxiosResponse<AssetApiResponse>)
      : api.post<AssetApiResponse>("/asset", entry),
};

export default api;
