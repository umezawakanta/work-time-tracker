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
