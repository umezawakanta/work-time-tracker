import { useState, useEffect } from 'react';
import { calculateDuration } from '../utils/dateUtils';
import { WorkTimeEntry } from '@/types/workTimeEntry';

export function useWorkTime() {
  const [workTimeEntries, setWorkTimeEntries] = useState<WorkTimeEntry[]>([]);

  useEffect(() => {
    // LocalStorageから作業時間エントリーを読み込む
    const storedEntries = localStorage.getItem('workTimeEntries');
    if (storedEntries) {
      try {
        setWorkTimeEntries(JSON.parse(storedEntries));
      } catch (error) {
        console.error('Failed to parse stored work time entries:', error);
        // 無効なJSONの場合は空配列で初期化
        setWorkTimeEntries([]);
        localStorage.removeItem('workTimeEntries');
      }
    }
  }, []);

  useEffect(() => {
    // 作業時間エントリーが更新されたらLocalStorageに保存
    try {
      localStorage.setItem('workTimeEntries', JSON.stringify(workTimeEntries));
    } catch (error) {
      console.error('Failed to save work time entries to localStorage:', error);
      // LocalStorageエラーでもアプリケーションは続行
    }
  }, [workTimeEntries]);

  const addWorkTimeEntry = (entry: Omit<WorkTimeEntry, '_id' | 'duration'>) => {
    const startDateTime = new Date(entry.startTime);
    const endDateTime = new Date(entry.endTime);
    const duration = calculateDuration(startDateTime, endDateTime);

    const newEntry: WorkTimeEntry = {
      ...entry,
      _id: Date.now().toString(),
      duration,
      date: startDateTime.toISOString().split('T')[0], // YYYY-MM-DD形式の日付
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    setWorkTimeEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const updateWorkTimeEntry = (id: string, updatedEntry: Partial<WorkTimeEntry>) => {
    setWorkTimeEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry._id === id) {
          const updatedStartDateTime = new Date(updatedEntry.startTime || entry.startTime);
          const updatedEndDateTime = new Date(updatedEntry.endTime || entry.endTime);
          const updatedDuration = calculateDuration(updatedStartDateTime, updatedEndDateTime);

          return {
            ...entry,
            ...updatedEntry,
            startTime: updatedStartDateTime.toISOString(),
            endTime: updatedEndDateTime.toISOString(),
            duration: updatedDuration,
            date: updatedStartDateTime.toISOString().split('T')[0], // YYYY-MM-DD形式の日付
          };
        }
        return entry;
      })
    );
  };

  const deleteWorkTimeEntry = (id: string) => {
    setWorkTimeEntries((prevEntries) => prevEntries.filter((entry) => entry._id !== id));
  };

  const getWorkTimeEntryById = (id: string) => {
    return workTimeEntries.find((entry) => entry._id === id);
  };

  const getTotalWorkTime = () => {
    return workTimeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  const getWorkTimeEntriesByDate = (date: string) => {
    return workTimeEntries.filter((entry) => entry.date === date);
  };

  return {
    workTimeEntries,
    addWorkTimeEntry,
    updateWorkTimeEntry,
    deleteWorkTimeEntry,
    getWorkTimeEntryById,
    getTotalWorkTime,
    getWorkTimeEntriesByDate,
  };
}
