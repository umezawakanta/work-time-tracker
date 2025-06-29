// src/services/api/presetApi.ts
import { api } from './apiConfig';

interface WorkPreset {
  _id: string;
  name: string;
  description: string;
  projectId: string;
  duration: number; // 分単位
  userId: string;
}

interface CreatePresetParams {
  name: string;
  description: string;
  projectId: string;
  duration: number;
  userId: string;
}

const presetApi = {
  getUserPresets: async (userId: string) => {
    return api.get(`/presets/user/${userId}`);
  },

  createPreset: async (presetData: CreatePresetParams) => {
    return api.post('/presets', presetData);
  },

  updatePreset: async (presetId: string, presetData: Partial<WorkPreset>) => {
    return api.put(`/presets/${presetId}`, presetData);
  },

  deletePreset: async (presetId: string) => {
    return api.delete(`/presets/${presetId}`);
  },
};

export default presetApi;
