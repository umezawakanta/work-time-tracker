import { renderHook, act } from '@testing-library/react';
import { useWorkTime } from '../useWorkTime';
import { WorkTimeEntry } from '../../types/workTimeEntry';
import * as dateUtils from '../../utils/dateUtils';

// Mock dependencies
jest.mock('../../utils/dateUtils');
const mockCalculateDuration = dateUtils.calculateDuration as jest.MockedFunction<
  typeof dateUtils.calculateDuration
>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useWorkTime', () => {
  const mockWorkTimeEntry: WorkTimeEntry = {
    _id: '1',
    date: '2024-01-01',
    startTime: '2024-01-01T09:00:00.000Z',
    endTime: '2024-01-01T17:00:00.000Z',
    duration: 8,
    description: 'テスト作業',
    projectName: 'テストプロジェクト',
    userId: 'test-user-id',
  };

  const mockEntriesData = [mockWorkTimeEntry];

  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateDuration.mockReturnValue(8);
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});

    // Date.nowをモック
    jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01T00:00:00.000Z
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('初期化', () => {
    it('LocalStorageからデータを読み込む', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));

      const { result } = renderHook(() => useWorkTime());

      expect(localStorageMock.getItem).toHaveBeenCalledWith('workTimeEntries');
      expect(result.current.workTimeEntries).toEqual(mockEntriesData);
    });

    it('LocalStorageが空の場合は空配列で初期化', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useWorkTime());

      expect(result.current.workTimeEntries).toEqual([]);
    });

    it('無効なJSONの場合は空配列で初期化', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useWorkTime());

      expect(result.current.workTimeEntries).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('addWorkTimeEntry', () => {
    it('新しい作業時間エントリーを追加する', () => {
      const { result } = renderHook(() => useWorkTime());

      const newEntryData = {
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T17:00:00.000Z',
        description: '新しい作業',
        projectName: '新しいプロジェクト',
        userId: 'test-user-id',
        date: '2024-01-01',
      };

      act(() => {
        result.current.addWorkTimeEntry(newEntryData);
      });

      expect(mockCalculateDuration).toHaveBeenCalledWith(
        new Date('2024-01-01T09:00:00.000Z'),
        new Date('2024-01-01T17:00:00.000Z')
      );

      expect(result.current.workTimeEntries).toHaveLength(1);
      expect(result.current.workTimeEntries[0]).toMatchObject({
        ...newEntryData,
        _id: '1640995200000',
        duration: 8,
        date: '2024-01-01',
      });
    });

    it('複数のエントリーを追加できる', () => {
      const { result } = renderHook(() => useWorkTime());

      act(() => {
        result.current.addWorkTimeEntry({
          startTime: '2024-01-01T09:00:00.000Z',
          endTime: '2024-01-01T17:00:00.000Z',
          description: '作業1',
          projectName: 'プロジェクト1',
          userId: 'test-user-id',
          date: '2024-01-01',
        });
      });

      act(() => {
        result.current.addWorkTimeEntry({
          startTime: '2024-01-02T10:00:00.000Z',
          endTime: '2024-01-02T18:00:00.000Z',
          description: '作業2',
          projectName: 'プロジェクト2',
          userId: 'test-user-id',
          date: '2024-01-02',
        });
      });

      expect(result.current.workTimeEntries).toHaveLength(2);
    });

    it('LocalStorageに保存される', () => {
      const { result } = renderHook(() => useWorkTime());

      act(() => {
        result.current.addWorkTimeEntry({
          startTime: '2024-01-01T09:00:00.000Z',
          endTime: '2024-01-01T17:00:00.000Z',
          description: 'テスト作業',
          projectName: 'テストプロジェクト',
          userId: 'test-user-id',
          date: '2024-01-01',
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'workTimeEntries',
        expect.stringContaining('テスト作業')
      );
    });
  });

  describe('updateWorkTimeEntry', () => {
    it('既存のエントリーを更新する', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));
      const { result } = renderHook(() => useWorkTime());

      const updates = {
        description: '更新された作業',
        projectName: '更新されたプロジェクト',
      };

      act(() => {
        result.current.updateWorkTimeEntry('1', updates);
      });

      expect(result.current.workTimeEntries[0]).toMatchObject(updates);
    });

    it('時間を更新すると期間が再計算される', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));
      const { result } = renderHook(() => useWorkTime());

      mockCalculateDuration.mockReturnValue(6);

      act(() => {
        result.current.updateWorkTimeEntry('1', {
          endTime: '2024-01-01T15:00:00.000Z',
        });
      });

      expect(mockCalculateDuration).toHaveBeenCalledWith(
        new Date('2024-01-01T09:00:00.000Z'),
        new Date('2024-01-01T15:00:00.000Z')
      );
      expect(result.current.workTimeEntries[0].duration).toBe(6);
    });

    it('存在しないIDで更新を試みても影響しない', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));
      const { result } = renderHook(() => useWorkTime());

      const originalEntry = { ...result.current.workTimeEntries[0] };

      act(() => {
        result.current.updateWorkTimeEntry('nonexistent', {
          description: '更新',
        });
      });

      expect(result.current.workTimeEntries[0]).toEqual(originalEntry);
    });
  });

  describe('deleteWorkTimeEntry', () => {
    it('指定したIDのエントリーを削除する', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));
      const { result } = renderHook(() => useWorkTime());

      expect(result.current.workTimeEntries).toHaveLength(1);

      act(() => {
        result.current.deleteWorkTimeEntry('1');
      });

      expect(result.current.workTimeEntries).toHaveLength(0);
    });

    it('存在しないIDで削除を試みても影響しない', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));
      const { result } = renderHook(() => useWorkTime());

      expect(result.current.workTimeEntries).toHaveLength(1);

      act(() => {
        result.current.deleteWorkTimeEntry('nonexistent');
      });

      expect(result.current.workTimeEntries).toHaveLength(1);
    });
  });

  describe('getWorkTimeEntryById', () => {
    it('指定したIDのエントリーを取得する', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));
      const { result } = renderHook(() => useWorkTime());

      const entry = result.current.getWorkTimeEntryById('1');

      expect(entry).toEqual(mockWorkTimeEntry);
    });

    it('存在しないIDの場合はundefinedを返す', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));
      const { result } = renderHook(() => useWorkTime());

      const entry = result.current.getWorkTimeEntryById('nonexistent');

      expect(entry).toBeUndefined();
    });
  });

  describe('getTotalWorkTime', () => {
    it('全エントリーの合計時間を計算する', () => {
      const multipleEntries = [
        { ...mockWorkTimeEntry, _id: '1', duration: 8 },
        { ...mockWorkTimeEntry, _id: '2', duration: 6 },
        { ...mockWorkTimeEntry, _id: '3', duration: 4 },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(multipleEntries));
      const { result } = renderHook(() => useWorkTime());

      const total = result.current.getTotalWorkTime();

      expect(total).toBe(18);
    });

    it('エントリーがない場合は0を返す', () => {
      const { result } = renderHook(() => useWorkTime());

      const total = result.current.getTotalWorkTime();

      expect(total).toBe(0);
    });

    it('durationがundefinedのエントリーは0として扱う', () => {
      const entriesWithUndefined = [
        { ...mockWorkTimeEntry, _id: '1', duration: 8 },
        { ...mockWorkTimeEntry, _id: '2', duration: undefined as any },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(entriesWithUndefined));
      const { result } = renderHook(() => useWorkTime());

      const total = result.current.getTotalWorkTime();

      expect(total).toBe(8);
    });
  });

  describe('getWorkTimeEntriesByDate', () => {
    it('指定した日付のエントリーを取得する', () => {
      const multipleEntries = [
        { ...mockWorkTimeEntry, _id: '1', date: '2024-01-01' },
        { ...mockWorkTimeEntry, _id: '2', date: '2024-01-02' },
        { ...mockWorkTimeEntry, _id: '3', date: '2024-01-01' },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(multipleEntries));
      const { result } = renderHook(() => useWorkTime());

      const entriesForDate = result.current.getWorkTimeEntriesByDate('2024-01-01');

      expect(entriesForDate).toHaveLength(2);
      expect(entriesForDate.every((entry) => entry.date === '2024-01-01')).toBe(true);
    });

    it('該当する日付のエントリーがない場合は空配列を返す', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockEntriesData));
      const { result } = renderHook(() => useWorkTime());

      const entriesForDate = result.current.getWorkTimeEntriesByDate('2024-12-31');

      expect(entriesForDate).toEqual([]);
    });
  });

  describe('LocalStorage同期', () => {
    it('エントリーが更新されるたびにLocalStorageに保存される', () => {
      const { result } = renderHook(() => useWorkTime());

      // 初期状態では保存されない
      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      // エントリー追加時に保存される
      act(() => {
        result.current.addWorkTimeEntry({
          startTime: '2024-01-01T09:00:00.000Z',
          endTime: '2024-01-01T17:00:00.000Z',
          description: 'テスト',
          projectName: 'プロジェクト',
          userId: 'test-user-id',
          date: '2024-01-01',
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('workTimeEntries', expect.any(String));
    });
  });

  describe('エラーハンドリング', () => {
    it('LocalStorageエラー時もアプリケーションが続行する', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useWorkTime());

      expect(() => {
        act(() => {
          result.current.addWorkTimeEntry({
            startTime: '2024-01-01T09:00:00.000Z',
            endTime: '2024-01-01T17:00:00.000Z',
            description: 'テスト',
            projectName: 'プロジェクト',
            userId: 'test-user-id',
            date: '2024-01-01',
          });
        });
      }).not.toThrow();

      expect(result.current.workTimeEntries).toHaveLength(1);
    });
  });
});
