import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface WorkTimeEntry {
  id?: string;
  projectName: string;
  description: string;
  duration: number;
  date: string;
}

const mockData: WorkTimeEntry[] = [
  { id: '1', projectName: 'Project A', description: 'Task 1', duration: 3600, date: new Date().toISOString() },
  { id: '2', projectName: 'Project B', description: 'Task 2', duration: 7200, date: new Date().toISOString() },
];

export const workTimeApi = {
  getAll: () => USE_MOCK_DATA ? Promise.resolve({ data: mockData }) : api.get<WorkTimeEntry[]>('/work-time'),
  getById: (id: string) => USE_MOCK_DATA ? Promise.resolve({ data: mockData.find(entry => entry.id === id) }) : api.get<WorkTimeEntry>(`/work-time/${id}`),
  create: (entry: WorkTimeEntry) => USE_MOCK_DATA ? Promise.resolve({ data: { ...entry, id: String(mockData.length + 1) } }) : api.post<WorkTimeEntry>('/work-time', entry),
  update: (id: string, entry: WorkTimeEntry) => USE_MOCK_DATA ? Promise.resolve({ data: { ...entry, id } }) : api.put<WorkTimeEntry>(`/work-time/${id}`, entry),
  delete: (id: string) => USE_MOCK_DATA ? Promise.resolve({ data: null }) : api.delete(`/work-time/${id}`),
};

export default api;