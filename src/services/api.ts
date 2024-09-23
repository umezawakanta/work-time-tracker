// services/api.ts

const API_BASE_URL = '<http://localhost:3000/api>'; // バックエンドのURLを適切に設定してください

export interface WorkTimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  duration: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'APIリクエストエラー');
  }
  return response.json();
}

export async function fetchWorkTimeEntries(): Promise<ApiResponse<WorkTimeEntry[]>> {
  const response = await fetch(`${API_BASE_URL}/work-time-entries`);
  return handleResponse<WorkTimeEntry[]>(response);
}

export async function fetchWorkTimeEntry(id: string): Promise<ApiResponse<WorkTimeEntry>> {
  const response = await fetch(`${API_BASE_URL}/work-time-entries/${id}`);
  return handleResponse<WorkTimeEntry>(response);
}

export async function createWorkTimeEntry(entry: Omit<WorkTimeEntry, 'id'>): Promise<ApiResponse<WorkTimeEntry>> {
  const response = await fetch(`${API_BASE_URL}/work-time-entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
  return handleResponse<WorkTimeEntry>(response);
}

export async function updateWorkTimeEntry(id: string, entry: Partial<WorkTimeEntry>): Promise<ApiResponse<WorkTimeEntry>> {
  const response = await fetch(`${API_BASE_URL}/work-time-entries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
  return handleResponse<WorkTimeEntry>(response);
}

export async function deleteWorkTimeEntry(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/work-time-entries/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

export async function fetchTotalWorkTime(): Promise<ApiResponse<{ totalMinutes: number }>> {
  const response = await fetch(`${API_BASE_URL}/work-time-entries/total`);
  return handleResponse<{ totalMinutes: number }>(response);
}

export async function fetchWorkTimeEntriesByDate(date: string): Promise<ApiResponse<WorkTimeEntry[]>> {
  const response = await fetch(`${API_BASE_URL}/work-time-entries/by-date/${date}`);
  return handleResponse<WorkTimeEntry[]>(response);
}
