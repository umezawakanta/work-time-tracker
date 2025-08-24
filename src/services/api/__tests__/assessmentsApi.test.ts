import { saveIQResult, saveMBTIResult, saveProgress } from '@/services/api/assessmentsApi';
import { api } from '@/services/api/apiConfig';

jest.mock('@/services/api/apiConfig', () => {
  const actual = jest.requireActual('@/services/api/apiConfig');
  return {
    ...actual,
    api: {
      post: jest.fn(),
    },
  };
});

describe('assessmentsApi POST calls', () => {
  beforeEach(() => {
    (api.post as jest.Mock).mockReset();
  });

  test('saveIQResult success', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    const res = await saveIQResult({ score: 10, total: 20, scaledIQ: 105, percentile: 70 });
    expect(api.post).toHaveBeenCalledWith('/user/assessments/iq', {
      score: 10,
      total: 20,
      scaledIQ: 105,
      percentile: 70,
    });
    expect(res).toEqual({ success: true });
  });

  test('saveIQResult failure propagates', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(
      saveIQResult({ score: 1, total: 2, scaledIQ: 90, percentile: 10 })
    ).rejects.toThrow('fail');
  });

  test('saveMBTIResult success', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    const res = await saveMBTIResult({ type: 'INTJ', scores: { EI: -1, SN: -2, TF: 2, JP: 1 } });
    expect(api.post).toHaveBeenCalledWith('/user/assessments/mbti', {
      type: 'INTJ',
      scores: { EI: -1, SN: -2, TF: 2, JP: 1 },
    });
    expect(res).toEqual({ success: true });
  });

  test('saveProgress success', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    const res = await saveProgress('biz-101', 50);
    expect(api.post).toHaveBeenCalledWith('/user/learning/progress', {
      courseId: 'biz-101',
      progress: 50,
    });
    expect(res).toEqual({ success: true });
  });
});
