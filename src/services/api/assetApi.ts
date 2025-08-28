// src/api/assetApi.ts
import { AxiosResponse } from 'axios';
import { api } from './apiConfig';
import { AssetEntry } from '@/types';

interface AssetApiResponse {
  message: string;
  asset: AssetEntry;
}

export const assetApi = {
  getAll: (): Promise<AxiosResponse<AssetEntry[]>> => {
    console.log('Fetching all asset entries');
    return api.get<AssetEntry[]>('/asset').then((response) => {
      console.log('Received asset entries:', response.data);
      return response;
    });
  },
  create: (entry: Omit<AssetEntry, '_id'>): Promise<AxiosResponse<AssetApiResponse>> => {
    console.log('Creating new asset entry:', entry);
    return api.post<AssetApiResponse>('/asset', entry).then((response) => {
      console.log('Created asset entry:', response.data);
      return response;
    });
  },
  update: (_id: string, entry: Partial<AssetEntry>): Promise<AxiosResponse<AssetApiResponse>> => {
    console.log('Updating asset entry:', _id, entry);
    return api.put<AssetApiResponse>(`/asset/${_id}`, entry).then((response) => {
      console.log('Updated asset entry:', response.data);
      return response;
    });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log('Deleting asset entry:', _id);
    return api
      .delete(`/asset/${_id}`)
      .then((response) => {
        console.log('Deleted asset entry:', _id);
        return response;
      })
      .catch((error) => {
        console.error('Error deleting asset entry:', error);
        if ((error as any).response) {
          console.error('Server responded with:', (error as any).response.data);
        }
        throw error;
      });
  },
};
