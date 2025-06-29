// src/services/api/partyApi.ts
import { AxiosResponse } from 'axios';
import { PoliticalParty } from '@/types/survey';
import { api } from './apiConfig';

interface PartyApiResponse {
  message: string;
  party: PoliticalParty;
}

export const partyApi = {
  getAll: (): Promise<AxiosResponse<PoliticalParty[]>> => {
    return api.get<PoliticalParty[]>('/parties');
  },

  create: (party: Omit<PoliticalParty, '_id'>): Promise<AxiosResponse<PartyApiResponse>> => {
    return api.post<PartyApiResponse>('/parties', party);
  },

  update: (
    _id: string,
    updates: Partial<PoliticalParty>
  ): Promise<AxiosResponse<PartyApiResponse>> => {
    return api.put<PartyApiResponse>(`/parties/${_id}`, updates);
  },

  delete: (_id: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/parties/${_id}`);
  },
};
