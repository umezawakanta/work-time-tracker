import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { useSurveyData } from '../useSurveyData';

// モック設定
jest.mock('react-hot-toast');

// APIモックを先に定義
const mockSurveyGetAll = jest.fn();
const mockPartyGetAll = jest.fn();

jest.mock('@/services/api/surveyApi', () => ({
  surveyApi: {
    getAll: mockSurveyGetAll,
  },
}));

jest.mock('@/services/api/partyApi', () => ({
  partyApi: {
    getAll: mockPartyGetAll,
  },
}));

const mockToast = toast as jest.Mocked<typeof toast>;

describe('useSurveyData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useSurveyData());

    expect(result.current.chartData).toEqual({});
    expect(result.current.mediaList).toEqual([]);
    expect(result.current.parties).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.missingData).toEqual({});
    expect(typeof result.current.fetchSurveyData).toBe('function');
  });

  it('有効なAPIレスポンスでデータが正しく処理される', async () => {
    const mockSurveyData = {
      surveys: [{ _id: 'survey1', mediaOutlet: 'NHK', surveyEndDate: '2024-01-01' }],
      supportRates: [
        {
          surveyId: 'survey1',
          partyId: { _id: '1', name: '自民党', shortName: '自民' },
          supportRate: 35,
        },
      ],
    };
    const mockPartyData = [{ _id: '1', name: '自民党', shortName: '自民', colorCode: '#FF0000' }];

    mockSurveyGetAll.mockResolvedValue({ data: mockSurveyData });
    mockPartyGetAll.mockResolvedValue({ data: mockPartyData });

    const { result } = renderHook(() => useSurveyData());

    result.current.fetchSurveyData();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.parties).toEqual(mockPartyData);
    expect(result.current.mediaList).toContain('各社平均');
    expect(result.current.mediaList).toContain('NHK');
  });

  it('APIエラー時にモックデータにフォールバックする', async () => {
    mockSurveyGetAll.mockRejectedValue(new Error('API Error'));
    mockPartyGetAll.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useSurveyData());

    result.current.fetchSurveyData();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('APIエラーのため、デモデータを表示しています');
    expect(result.current.parties).toHaveLength(6); // モックデータの政党数
    expect(result.current.mediaList).toContain('各社平均');
  });

  it('fetchSurveyDataが複数回呼び出されても正常に動作する', async () => {
    const mockData = {
      surveys: [],
      supportRates: [],
    };
    const mockParties = [{ _id: '1', name: '自民党', shortName: '自民', colorCode: '#FF0000' }];

    mockSurveyGetAll.mockResolvedValue({ data: mockData });
    mockPartyGetAll.mockResolvedValue({ data: mockParties });

    const { result } = renderHook(() => useSurveyData());

    // 最初の呼び出し
    result.current.fetchSurveyData();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 2回目の呼び出し
    result.current.fetchSurveyData();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSurveyGetAll).toHaveBeenCalledTimes(2);
    expect(mockPartyGetAll).toHaveBeenCalledTimes(2);
  });

  it('HTMLレスポンスが返された場合にモックデータを使用する', async () => {
    const htmlResponse = '<!doctype html><html><head></head><body></body></html>';
    mockSurveyGetAll.mockResolvedValue({ data: htmlResponse });
    mockPartyGetAll.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useSurveyData());

    result.current.fetchSurveyData();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockToast.success).toHaveBeenCalledWith('デモデータを表示しています');
    expect(result.current.parties).toHaveLength(6); // モックデータの政党数
  });
});
