import { AxiosResponse } from 'axios';
import { WithdrawalEntry } from '@/store/withdrawalSlice';
import { api } from './apiConfig';

interface WithdrawalApiResponse {
  message: string;
  withdrawal: WithdrawalEntry;
}

export const withdrawalApi = {
  getAll: (): Promise<AxiosResponse<WithdrawalEntry[]>> => {
    console.log('Fetching all withdrawal entries');
    return api.get<WithdrawalEntry[]>('/withdrawal').then((response) => {
      console.log('Received withdrawal entries:', response.data);
      return response;
    });
  },
  create: (entry: Omit<WithdrawalEntry, '_id'>): Promise<AxiosResponse<WithdrawalApiResponse>> => {
    console.log('Creating new withdrawal entry:', entry);
    return api.post<WithdrawalApiResponse>('/withdrawal', entry).then((response) => {
      console.log('Created withdrawal entry:', response.data);
      return response;
    });
  },
  update: (
    _id: string,
    entry: Partial<WithdrawalEntry>
  ): Promise<AxiosResponse<WithdrawalApiResponse>> => {
    console.log('Updating withdrawal entry:', _id, entry);
    return api.put<WithdrawalApiResponse>(`/withdrawal/${_id}`, entry).then((response) => {
      console.log('Updated withdrawal entry:', response.data);
      return response;
    });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log('Deleting withdrawal entry:', _id);
    return api
      .delete(`/withdrawal/${_id}`)
      .then((response) => {
        console.log('Deleted withdrawal entry:', _id);
        return response;
      })
      .catch((error) => {
        console.error('Error deleting withdrawal entry:', error);
        if ((error as any).response) {
          console.error('Server responded with:', (error as any).response.data);
        }
        throw error;
      });
  },
};
