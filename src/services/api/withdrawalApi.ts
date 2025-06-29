import { AxiosResponse } from 'axios';
import { WithdrawalEntry } from '@/store/withdrawalSlice';
import { api, USE_MOCK_DATA } from './apiConfig';

const mockWithdrawalData: WithdrawalEntry[] = [
  {
    _id: '1',
    date: new Date().toISOString().split('T')[0],
    bank: '三井住友銀行',
    branch: '大塚支店',
    amount: 91000,
    description: 'アコムからの引き落とし',
  },
];

interface WithdrawalApiResponse {
  message: string;
  withdrawal: WithdrawalEntry;
}

export const withdrawalApi = {
  getAll: (): Promise<AxiosResponse<WithdrawalEntry[]>> => {
    console.log('Fetching all withdrawal entries');
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockWithdrawalData } as AxiosResponse<WithdrawalEntry[]>)
      : api.get<WithdrawalEntry[]>('/withdrawal').then((response) => {
          console.log('Received withdrawal entries:', response.data);
          return response;
        });
  },
  create: (entry: Omit<WithdrawalEntry, '_id'>): Promise<AxiosResponse<WithdrawalApiResponse>> => {
    console.log('Creating new withdrawal entry:', entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: '口座引き落とし情報が正常に記録されました',
            withdrawal: {
              ...entry,
              _id: String(mockWithdrawalData.length + 1),
            },
          },
        } as AxiosResponse<WithdrawalApiResponse>)
      : api.post<WithdrawalApiResponse>('/withdrawal', entry).then((response) => {
          console.log('Created withdrawal entry:', response.data);
          return response;
        });
  },
  update: (
    _id: string,
    entry: Partial<WithdrawalEntry>
  ): Promise<AxiosResponse<WithdrawalApiResponse>> => {
    console.log('Updating withdrawal entry:', _id, entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: '口座引き落とし情報が正常に更新されました',
            withdrawal: {
              ...mockWithdrawalData.find((e) => e._id === _id),
              ...entry,
              _id: _id,
            },
          },
        } as AxiosResponse<WithdrawalApiResponse>)
      : api.put<WithdrawalApiResponse>(`/withdrawal/${_id}`, entry).then((response) => {
          console.log('Updated withdrawal entry:', response.data);
          return response;
        });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log('Deleting withdrawal entry:', _id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api
          .delete(`/withdrawal/${_id}`)
          .then((response) => {
            console.log('Deleted withdrawal entry:', _id);
            return response;
          })
          .catch((error) => {
            console.error('Error deleting withdrawal entry:', error);
            if (error.response) {
              console.error('Server responded with:', error.response.data);
            }
            throw error;
          });
  },
};
