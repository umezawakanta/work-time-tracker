// src/api/debtApi.ts
import { AxiosResponse } from 'axios';
import { api } from './apiConfig';
import { DebtEntry } from '@/types';

interface DebtApiResponse {
  message: string;
  debt: DebtEntry;
}

export const debtApi = {
  getAll: (): Promise<AxiosResponse<DebtEntry[]>> => {
    console.log('Fetching all debt entries');
    return api.get<DebtEntry[]>('/debt').then((response) => {
      console.log('Received debt entries:', response.data);
      return response;
    });
  },
  create: (entry: Omit<DebtEntry, '_id'>): Promise<AxiosResponse<DebtApiResponse>> => {
    console.log('Creating new debt entry:', entry);
    return api.post<DebtApiResponse>('/debt', entry).then((response) => {
      console.log('Created debt entry:', response.data);
      return response;
    });
  },
  update: (_id: string, entry: Partial<DebtEntry>): Promise<AxiosResponse<DebtApiResponse>> => {
    console.log('Updating debt entry:', _id, entry);
    return api.put<DebtApiResponse>(`/debt/${_id}`, entry).then((response) => {
      console.log('Updated debt entry:', response.data);
      return response;
    });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log('Deleting debt entry:', _id);
    return api
      .delete(`/debt/${_id}`)
      .then((response) => {
        console.log('Deleted debt entry:', _id);
        return response;
      })
      .catch((error) => {
        console.error('Error deleting debt entry:', error);
        if ((error as any).response) {
          console.error('Server responded with:', (error as any).response.data);
        }
        throw error;
      });
  },
};
