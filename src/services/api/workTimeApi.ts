// src/api/workTimeApi.ts
import { AxiosResponse } from 'axios';
import { WorkTimeEntry } from '../../types/workTimeEntry';
import { api, USE_MOCK_DATA } from './apiConfig';
import { WorkState, WorkStateApiResponse, WorkTimeApiResponse } from '@/types';

const mockWorkTimeData: WorkTimeEntry[] = [
  {
    _id: '1',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    duration: 28800,
    projectName: 'Project A',
    description: 'Worked on feature X',
    userId: 'mock-user-id',
  },
  {
    _id: '2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '18:00',
    duration: 28800,
    projectName: 'Project B',
    description: 'Fixed bug Y',
    userId: 'mock-user-id',
  },
];

// ローカルストレージからAPI作成エントリを取得
const getLocalApiEntries = (): WorkTimeEntry[] => {
  try {
    const stored = localStorage.getItem('mock-api-work-entries');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load local API entries:', error);
    return [];
  }
};

// ローカルストレージにAPI作成エントリを保存
const saveLocalApiEntry = (entry: WorkTimeEntry): void => {
  try {
    const existing = getLocalApiEntries();
    const updated = [entry, ...existing];
    localStorage.setItem('mock-api-work-entries', JSON.stringify(updated));
    console.log('💾 Saved entry to local API storage:', entry);
  } catch (error) {
    console.error('Failed to save local API entry:', error);
  }
};

// 全エントリを取得（モック + ローカル作成分）
const getAllEntries = (): WorkTimeEntry[] => {
  const localEntries = getLocalApiEntries();
  const allEntries = [...localEntries, ...mockWorkTimeData];

  // 重複除去（_idベース）
  const uniqueEntries = allEntries.filter(
    (entry, index, arr) => arr.findIndex((e) => e._id === entry._id) === index
  );

  // 日付順でソート（新しい順）
  return uniqueEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const workTimeApi = {
  getAll: (): Promise<AxiosResponse<WorkTimeEntry[]>> => {
    console.log('Fetching all work time entries');
    if (USE_MOCK_DATA) {
      const allEntries = getAllEntries();
      console.log('📊 Mock API returning entries:', {
        total: allEntries.length,
        mock: mockWorkTimeData.length,
        local: getLocalApiEntries().length,
      });
      return Promise.resolve({ data: allEntries } as AxiosResponse<WorkTimeEntry[]>);
    } else {
      return api.get<WorkTimeEntry[]>('/worktime').then((response) => {
        console.log('Received work time entries:', response.data);
        return response;
      });
    }
  },

  create: (
    entry: Omit<WorkTimeEntry, '_id' | 'userId'>
  ): Promise<AxiosResponse<WorkTimeApiResponse>> => {
    console.log('Creating new work time entry:', entry);
    if (USE_MOCK_DATA) {
      const newEntry: WorkTimeEntry = {
        ...entry,
        _id: `mock-${Date.now()}`,
        userId: 'demo@example.com',
      };

      // ローカルストレージに保存
      saveLocalApiEntry(newEntry);

      return Promise.resolve({
        data: {
          message: '作業時間が正常に記録されました',
          workTime: newEntry,
        },
      } as AxiosResponse<WorkTimeApiResponse>);
    } else {
      return api.post<WorkTimeApiResponse>('/worktime', entry).then((response) => {
        console.log('Created work time entry:', response.data);
        return response;
      });
    }
  },

  update: (
    _id: string,
    entry: Partial<WorkTimeEntry>
  ): Promise<AxiosResponse<WorkTimeApiResponse>> => {
    console.log('Updating work time entry:', _id, entry);
    if (USE_MOCK_DATA) {
      // ローカルエントリから検索して更新
      const localEntries = getLocalApiEntries();
      const localIndex = localEntries.findIndex((e) => e._id === _id);

      if (localIndex !== -1) {
        const updatedEntry = { ...localEntries[localIndex], ...entry };
        localEntries[localIndex] = updatedEntry;
        localStorage.setItem('mock-api-work-entries', JSON.stringify(localEntries));

        return Promise.resolve({
          data: {
            message: '作業時間が正常に更新されました',
            workTime: updatedEntry,
          },
        } as AxiosResponse<WorkTimeApiResponse>);
      }

      // モックデータから検索（読み取り専用）
      const mockEntry = mockWorkTimeData.find((e) => e._id === _id);
      return Promise.resolve({
        data: {
          message: '作業時間が正常に更新されました',
          workTime: { ...mockEntry, ...entry, _id: _id },
        },
      } as AxiosResponse<WorkTimeApiResponse>);
    } else {
      return api.put<WorkTimeApiResponse>(`/worktime/${_id}`, entry).then((response) => {
        console.log('Updated work time entry:', response.data);
        return response;
      });
    }
  },

  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log('Deleting work time entry:', _id);
    if (USE_MOCK_DATA) {
      // ローカルエントリから削除
      const localEntries = getLocalApiEntries();
      const filtered = localEntries.filter((e) => e._id !== _id);
      localStorage.setItem('mock-api-work-entries', JSON.stringify(filtered));
      console.log('🗑️ Deleted entry from local API storage:', _id);

      return Promise.resolve({} as AxiosResponse<void>);
    } else {
      return api.delete(`/worktime/${_id}`).then((response) => {
        console.log('Deleted work time entry:', _id);
        return response;
      });
    }
  },

  // 以下の関数を追加
  saveWorkState: (workState: WorkState): Promise<AxiosResponse<WorkStateApiResponse>> => {
    console.log('Saving work state:', workState);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: '作業状態が保存されました',
            workState,
          },
        } as AxiosResponse<WorkStateApiResponse>)
      : api.post<WorkStateApiResponse>('/worktime/state', workState).then((response) => {
          console.log('Saved work state:', response.data);
          return response;
        });
  },

  getWorkState: (userId: string): Promise<AxiosResponse<WorkState | null>> => {
    console.log('Getting work state for user:', userId);
    if (USE_MOCK_DATA) {
      const allEntries = getAllEntries();
      return Promise.resolve({
        data:
          allEntries.length > 0
            ? {
                isWorking: true,
                startTime: new Date().toISOString(),
                projectName: allEntries[0].projectName,
                description: allEntries[0].description,
                userId,
              }
            : null,
      } as AxiosResponse<WorkState | null>);
    } else {
      return api.get<WorkState | null>(`/worktime/state/${userId}`).then((response) => {
        console.log('Retrieved work state:', response.data);
        return response;
      });
    }
  },
};
