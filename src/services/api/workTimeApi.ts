// src/api/workTimeApi.ts
import { AxiosResponse } from 'axios';
import { WorkTimeEntry } from '../../types/workTimeEntry';
import { api } from './apiConfig';
import { WorkState, WorkStateApiResponse, WorkTimeApiResponse } from '@/types';

// モックデータは廃止

// ローカルストレージ利用のモックは廃止

// 旧モック合成は削除

export const workTimeApi = {
  getAll: (): Promise<AxiosResponse<WorkTimeEntry[]>> => {
    console.log('Fetching all work time entries');
    return api.get<WorkTimeEntry[]>('/worktime').then((response) => {
      console.log('Received work time entries:', response.data);
      return response;
    });
  },

  create: (
    entry: Omit<WorkTimeEntry, '_id' | 'userId'>
  ): Promise<AxiosResponse<WorkTimeApiResponse>> => {
    console.log('Creating new work time entry:', entry);
    return api.post<WorkTimeApiResponse>('/worktime', entry).then((response) => {
      console.log('Created work time entry:', response.data);
      return response;
    });
  },

  update: (
    _id: string,
    entry: Partial<WorkTimeEntry>
  ): Promise<AxiosResponse<WorkTimeApiResponse>> => {
    console.log('Updating work time entry:', _id, entry);
    return api.put<WorkTimeApiResponse>(`/worktime/${_id}`, entry).then((response) => {
      console.log('Updated work time entry:', response.data);
      return response;
    });
  },

  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log('Deleting work time entry:', _id);
    return api.delete(`/worktime/${_id}`).then((response) => {
      console.log('Deleted work time entry:', _id);
      return response;
    });
  },

  // 以下の関数を追加
  saveWorkState: (workState: WorkState): Promise<AxiosResponse<WorkStateApiResponse>> => {
    console.log('Saving work state:', workState);
    return api.post<WorkStateApiResponse>('/worktime/state', workState).then((response) => {
      console.log('Saved work state:', response.data);
      return response;
    });
  },

  getWorkState: (userId: string): Promise<AxiosResponse<WorkState | null>> => {
    console.log('Getting work state for user:', userId);
    return api.get<WorkState | null>(`/worktime/state/${userId}`).then((response) => {
      console.log('Retrieved work state:', response.data);
      return response;
    });
  },
};
