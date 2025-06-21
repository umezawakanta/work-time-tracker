import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { useSurveyData } from '../useSurveyData';

// モック設定
jest.mock('react-hot-toast');
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

const mockToast = toast as jest.Mocked<typeof toast>;
const mockSurveyApi = {
  getAll: jest.fn(),
};
const mockPartyApi = {
  getAll: jest.fn(),
};

describe('useSurveyData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockParties = [
    { _id: '1', name: '自由民主党', shortName: '自民', colorCode: '#3498db' },
    { _id: '2', name: '立憲民主党', shortName: '立民', colorCode: '#e74c3c' },
  ];

  const mockSurveyData = {
    surveys: [
      {
        _id: 'survey1',
        mediaOutlet: 'NHK',
        surveyEndDate: '2024-10-01',
      },
    ],
    supportRates: [
      {
        surveyId: 'survey1',
        partyId: { _id: '1', name: '自由民主党', shortName: '自民' },
        supportRate: 35.5,
      },
    ],
  };

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useSurveyData());

    expect(result.current.chartData).toEqual({});
    expect(result.current.mediaList).toEqual([]);
    expect(result.current.parties).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.missingData).toEqual({});
  });

  it('有効なAPIレスポンスでデータが正しく処理される', async () => {
    mockSurveyApi.getAll.mockResolvedValue({ data: mockSurveyData });
    mockPartyApi.getAll.mockResolvedValue({ data: mockParties });

    const { result } = renderHook(() => useSurveyData());

    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.parties).toEqual(mockParties);
    expect(result.current.mediaList).toContain('各社平均');
    expect(result.current.mediaList).toContain('NHK');
    expect(result.current.chartData).toHaveProperty('各社平均');
  });

  it('APIエラー時にモックデータにフォールバックする', async () => {
    mockSurveyApi.getAll.mockRejectedValue(new Error('API Error'));
    mockPartyApi.getAll.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useSurveyData());

    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('APIエラーのため、デモデータを表示しています');
    expect(result.current.parties).toHaveLength(6); // モックデータの政党数
    expect(result.current.mediaList).toContain('各社平均');
    expect(result.current.mediaList).toContain('NHK');
  });

  it('HTMLレスポンスが返された場合にモックデータを使用する', async () => {
    const htmlResponse = '<!doctype html><html><head></head><body></body></html>';
    mockSurveyApi.getAll.mockResolvedValue({ data: htmlResponse });
    mockPartyApi.getAll.mockResolvedValue({ data: htmlResponse });

    const { result } = renderHook(() => useSurveyData());

    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockToast.success).toHaveBeenCalledWith('デモデータを表示しています');
    expect(result.current.parties).toHaveLength(6); // モックデータの政党数
  });

  it('不正なデータ構造の場合にエラーハンドリングが機能する', async () => {
    mockSurveyApi.getAll.mockResolvedValue({ data: { invalid: 'data' } });
    mockPartyApi.getAll.mockResolvedValue({ data: mockParties });

    const { result } = renderHook(() => useSurveyData());

    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('APIエラーのため、デモデータを表示しています');
    expect(result.current.parties).toHaveLength(6); // モックデータにフォールバック
  });

  it('モックデータが正しい構造で生成される', async () => {
    mockSurveyApi.getAll.mockRejectedValue(new Error('API Error'));
    mockPartyApi.getAll.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useSurveyData());

    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // モックデータの検証
    expect(result.current.parties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          shortName: expect.any(String),
          colorCode: expect.any(String),
        }),
      ])
    );

    expect(result.current.mediaList).toEqual([
      '各社平均',
      'NHK',
      '読売新聞',
      '朝日新聞',
      '毎日新聞',
      '日経新聞',
      '共同通信',
    ]);

    // チャートデータの構造検証
    expect(result.current.chartData).toHaveProperty('各社平均');
    expect(result.current.chartData).toHaveProperty('NHK');

    const averageData = result.current.chartData['各社平均'];
    expect(averageData).toBeInstanceOf(Array);

    if (averageData.length > 0) {
      expect(averageData[0]).toEqual(
        expect.objectContaining({
          surveyId: expect.any(String),
          date: expect.any(String),
          fullDate: expect.any(String),
          monthDate: expect.any(String),
          mediaOutlet: '各社平均',
        })
      );
    }
  });

  it('月次データが正しく計算される', async () => {
    const multiSurveyData = {
      surveys: [
        {
          _id: 'survey1',
          mediaOutlet: 'NHK',
          surveyEndDate: '2024-10-01',
        },
        {
          _id: 'survey2',
          mediaOutlet: '読売新聞',
          surveyEndDate: '2024-10-15',
        },
      ],
      supportRates: [
        {
          surveyId: 'survey1',
          partyId: { _id: '1', shortName: '自民' },
          supportRate: 35.0,
        },
        {
          surveyId: 'survey2',
          partyId: { _id: '1', shortName: '自民' },
          supportRate: 37.0,
        },
      ],
    };

    mockSurveyApi.getAll.mockResolvedValue({ data: multiSurveyData });
    mockPartyApi.getAll.mockResolvedValue({ data: mockParties });

    const { result } = renderHook(() => useSurveyData());

    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const averageData = result.current.chartData['各社平均'];
    expect(averageData).toBeInstanceOf(Array);

    // 平均値の計算確認（35.0 + 37.0 / 2 = 36.0）
    if (averageData.length > 0) {
      expect(averageData[0]['自民']).toBe(36.0);
    }
  });

  it('欠損データが正しく検出される', async () => {
    const incompleteData = {
      surveys: [
        {
          _id: 'survey1',
          mediaOutlet: 'NHK',
          surveyEndDate: '2024-09-01', // 9月のデータのみ
        },
      ],
      supportRates: [],
    };

    mockSurveyApi.getAll.mockResolvedValue({ data: incompleteData });
    mockPartyApi.getAll.mockResolvedValue({ data: mockParties });

    const { result } = renderHook(() => useSurveyData());

    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 10月以降のデータが欠損として検出されるべき
    expect(result.current.missingData).toHaveProperty('NHK');
    expect(result.current.missingData['NHK']).toBeInstanceOf(Array);
    expect(result.current.missingData['NHK'].length).toBeGreaterThan(0);
  });

  it('fetchSurveyDataが複数回呼び出されても正常に動作する', async () => {
    mockSurveyApi.getAll.mockResolvedValue({ data: mockSurveyData });
    mockPartyApi.getAll.mockResolvedValue({ data: mockParties });

    const { result } = renderHook(() => useSurveyData());

    // 最初の呼び出し
    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstParties = result.current.parties;

    // 2回目の呼び出し
    await waitFor(() => {
      result.current.fetchSurveyData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.parties).toEqual(firstParties);
    expect(mockSurveyApi.getAll).toHaveBeenCalledTimes(2);
    expect(mockPartyApi.getAll).toHaveBeenCalledTimes(2);
  });
});
