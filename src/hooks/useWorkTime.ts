// hooks/useWorkTime.ts

import { useState, useEffect } from 'react';
import { calculateDuration, parseDateTime } from '../utils/dateUtils';

interface WorkTimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  duration: number;
}

export function useWorkTime() {
  const [workTimeEntries, setWorkTimeEntries] = useState<WorkTimeEntry[]>([]);

  useEffect(() => {
    // LocalStorageから作業時間エントリーを読み込む
    const storedEntries = localStorage.getItem('workTimeEntries');
    if (storedEntries) {
      setWorkTimeEntries(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    // 作業時間エントリーが更新されたらLocalStorageに保存
    localStorage.setItem('workTimeEntries', JSON.stringify(workTimeEntries));
  }, [workTimeEntries]);

  const addWorkTimeEntry = (entry: Omit<WorkTimeEntry, 'id' | 'duration'>) => {
    const startDateTime = parseDateTime(entry.date, entry.startTime);
    const endDateTime = parseDateTime(entry.date, entry.endTime);
    const duration = calculateDuration(startDateTime, endDateTime);

    const newEntry: WorkTimeEntry = {
      ...entry,
      id: Date.now().toString(),
      duration,
    };

    setWorkTimeEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const updateWorkTimeEntry = (id: string, updatedEntry: Partial<WorkTimeEntry>) => {
    setWorkTimeEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === id) {
          const updatedStartDateTime = parseDateTime(
            updatedEntry.date || entry.date,
            updatedEntry.startTime || entry.startTime
          );
          const updatedEndDateTime = parseDateTime(
            updatedEntry.date || entry.date,
            updatedEntry.endTime || entry.endTime
          );
          const updatedDuration = calculateDuration(updatedStartDateTime, updatedEndDateTime);

          return {
            ...entry,
            ...updatedEntry,
            duration: updatedDuration,
          };
        }
        return entry;
      })
    );
  };

  const deleteWorkTimeEntry = (id: string) => {
    setWorkTimeEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  };

  const getWorkTimeEntryById = (id: string) => {
    return workTimeEntries.find((entry) => entry.id === id);
  };

  const getTotalWorkTime = () => {
    return workTimeEntries.reduce((total, entry) => total + entry.duration, 0);
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
