import { api } from './apiConfig';

export interface SaveIQPayload {
  score: number;
  total: number;
  scaledIQ: number;
  percentile: number;
}

export interface SaveResponse {
  success: boolean;
}

export async function saveIQResult(payload: SaveIQPayload): Promise<SaveResponse> {
  const res = await api.post<SaveResponse>('/user/assessments/iq', payload);
  return res.data;
}

export interface SaveMBTIPayload {
  type: string;
  scores: { EI: number; SN: number; TF: number; JP: number };
}

export async function saveMBTIResult(payload: SaveMBTIPayload): Promise<SaveResponse> {
  const res = await api.post<SaveResponse>('/user/assessments/mbti', payload);
  return res.data;
}

export async function saveProgress(courseId: string, progress: number): Promise<SaveResponse> {
  const res = await api.post<SaveResponse>('/user/learning/progress', { courseId, progress });
  return res.data;
}
