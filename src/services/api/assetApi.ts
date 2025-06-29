// src/api/assetApi.ts
import { AxiosResponse } from 'axios';
import { api, USE_MOCK_DATA } from './apiConfig';
import { AssetEntry } from '@/types';

const mockAssetData: AssetEntry[] = [
  {
    _id: '1',
    date: new Date().toISOString().split('T')[0],
    value: 1000000,
    account: '銀行A',
  },
  {
    _id: '2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    value: 500000,
    account: '銀行B',
  },
];

interface AssetApiResponse {
  message: string;
  asset: AssetEntry;
}

export const assetApi = {
  getAll: (): Promise<AxiosResponse<AssetEntry[]>> => {
    console.log('Fetching all asset entries');
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockAssetData } as AxiosResponse<AssetEntry[]>)
      : api.get<AssetEntry[]>('/asset').then((response) => {
          console.log('Received asset entries:', response.data);
          return response;
        });
  },
  create: (entry: Omit<AssetEntry, '_id'>): Promise<AxiosResponse<AssetApiResponse>> => {
    console.log('Creating new asset entry:', entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: '資産情報が正常に記録されました',
            asset: { ...entry, _id: String(mockAssetData.length + 1) },
          },
        } as AxiosResponse<AssetApiResponse>)
      : api.post<AssetApiResponse>('/asset', entry).then((response) => {
          console.log('Created asset entry:', response.data);
          return response;
        });
  },
  update: (_id: string, entry: Partial<AssetEntry>): Promise<AxiosResponse<AssetApiResponse>> => {
    console.log('Updating asset entry:', _id, entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: '資産情報が正常に更新されました',
            asset: {
              ...mockAssetData.find((e) => e._id === _id),
              ...entry,
              _id: _id,
            },
          },
        } as AxiosResponse<AssetApiResponse>)
      : api.put<AssetApiResponse>(`/asset/${_id}`, entry).then((response) => {
          console.log('Updated asset entry:', response.data);
          return response;
        });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log('Deleting asset entry:', _id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api
          .delete(`/asset/${_id}`)
          .then((response) => {
            console.log('Deleted asset entry:', _id);
            return response;
          })
          .catch((error) => {
            console.error('Error deleting asset entry:', error);
            if (error.response) {
              console.error('Server responded with:', error.response.data);
            }
            throw error;
          });
  },
};
