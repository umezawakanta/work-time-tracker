import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { useSurveyData } from '../useSurveyData';

// モック設定
jest.mock('react-hot-toast');

// APIモックを関数内で定義
jest.mock('@/services/api/surveyApi', () => ({
  surveyApi: {
    getAll: jest.fn(),
  },
}));

jest.mock('@/services/api/partyApi', () => ({
  partyApi: {
    getAll: jest.fn(),
  },
}));

// モックをimportで取得
import { surveyApi } from '@/services/api/surveyApi';
import { partyApi } from '@/services/api/partyApi';

const mockSurveyApi = surveyApi as jest.Mocked<typeof surveyApi>;
const mockPartyApi = partyApi as jest.Mocked<typeof partyApi>;
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

    mockSurveyApi.getAll.mockResolvedValue({ data: mockSurveyData });
    mockPartyApi.getAll.mockResolvedValue({ data: mockPartyData });

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
    mockSurveyApi.getAll.mockRejectedValue(new Error('API Error'));
    mockPartyApi.getAll.mockRejectedValue(new Error('API Error'));

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

    mockSurveyApi.getAll.mockResolvedValue({ data: mockData });
    mockPartyApi.getAll.mockResolvedValue({ data: mockParties });

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

    expect(mockSurveyApi.getAll).toHaveBeenCalledTimes(2);
    expect(mockPartyApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('HTMLレスポンスが返された場合にモックデータを使用する', async () => {
    const htmlResponse = '<!doctype html><html><head></head><body></body></html>';
    mockSurveyApi.getAll.mockResolvedValue({ data: htmlResponse });
    mockPartyApi.getAll.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useSurveyData());

    result.current.fetchSurveyData();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockToast.success).toHaveBeenCalledWith('デモデータを表示しています');
    expect(result.current.parties).toHaveLength(6); // モックデータの政党数
  });
});
