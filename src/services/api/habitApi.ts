import { api } from './apiConfig';

interface HabitData {
  _id: string;
  userId: string;
  name: string;
  data: {
    [key: string]: boolean[];
  };
  createdAt: string;
  updatedAt: string;
}

export const getTweets = async () => {
  try {
    const response = await api.get<HabitData[]>('/habits');
    return response.data;
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

export const getHabits = async () => {
  try {
    const response = await api.get<HabitData[]>('/habits');
    return response.data;
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

export const initializeHabits = async (habits: string[]) => {
  try {
    const response = await api.post<HabitData[]>('/habits/initialize', { habits });
    return response.data;
  } catch (error) {
    console.error('Error initializing habits:', error);
    throw error;
  }
};

export const updateHabit = async (habitId: string, monthKey: string, data: boolean[]) => {
  try {
    // リクエスト前のバリデーション
    if (!habitId || typeof habitId !== 'string') {
      throw new Error('Invalid habitId');
    }

    if (!monthKey || typeof monthKey !== 'string') {
      throw new Error('Invalid monthKey');
    }

    if (!Array.isArray(data) || !data.every((item) => typeof item === 'boolean')) {
      throw new Error('Invalid data format');
    }

    console.log('Sending update request:', { habitId, monthKey, data });
    const response = await api.put<HabitData>(`/habits/${habitId}`, { monthKey, data });
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};
