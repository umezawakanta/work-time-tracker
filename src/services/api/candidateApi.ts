import { AxiosResponse } from 'axios';
import { api } from './apiConfig';
import { Candidate } from '@/types';

interface SupportRatePoint {
  date: string;
  rate: number;
  source: string;
}

interface CandidateApiResponse {
  message: string;
  candidate: Candidate;
}

export const candidateApi = {
  getAll: (): Promise<AxiosResponse<Candidate[]>> => {
    console.log('Fetching all candidates');
    return api.get<Candidate[]>('/candidates').then((response) => {
      console.log('Received candidates:', response.data);
      return response;
    });
  },
  create: (candidate: Omit<Candidate, '_id'>): Promise<AxiosResponse<CandidateApiResponse>> => {
    console.log('Creating new candidate:', candidate);
    return api.post<CandidateApiResponse>('/candidates', candidate).then((response) => {
      console.log('Created candidate:', response.data);
      return response;
    });
  },
  update: (
    _id: string,
    candidate: Partial<Candidate>
  ): Promise<AxiosResponse<CandidateApiResponse>> => {
    console.log('Updating candidate:', _id, candidate);
    return api.put<CandidateApiResponse>(`/candidates/${_id}`, candidate).then((response) => {
      console.log('Updated candidate:', response.data);
      return response;
    });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log('Deleting candidate:', _id);
    return api.delete(`/candidates/${_id}`).then((response) => {
      console.log('Deleted candidate:', _id);
      return response;
    });
  },
  getCandidateSupportRate: (candidateId: string): Promise<AxiosResponse<SupportRatePoint[]>> => {
    console.log('Fetching support rate data for candidate:', candidateId);
    return api
      .get<SupportRatePoint[]>(`/candidates/${candidateId}/support-rate`)
      .then((response) => {
        console.log('Received support rate data:', response.data);
        return response;
      });
  },
};
