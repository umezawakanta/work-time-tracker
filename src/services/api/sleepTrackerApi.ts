import { AxiosResponse } from 'axios';
import { SleepRecord } from '@/store/sleepTrackerSlice';
import { api } from './apiConfig';

interface SleepTrackerApiResponse {
  message: string;
  sleepRecord: SleepRecord;
}

export const sleepTrackerApi = {
  getAll: (): Promise<AxiosResponse<SleepRecord[]>> => {
    return api.get<SleepRecord[]>('/sleep-records');
  },

  create: (record: Omit<SleepRecord, '_id'>): Promise<AxiosResponse<SleepTrackerApiResponse>> => {
    return api.post<SleepTrackerApiResponse>('/sleep-records', record);
  },

  update: (
    _id: string,
    updates: Partial<SleepRecord>
  ): Promise<AxiosResponse<SleepTrackerApiResponse>> => {
    return api.put<SleepTrackerApiResponse>(`/sleep-records/${_id}`, updates);
  },

  delete: (_id: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/sleep-records/${_id}`);
  },
};
