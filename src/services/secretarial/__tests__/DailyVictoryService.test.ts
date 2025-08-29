import '@testing-library/jest-dom';
import { dailyVictoryService } from '../DailyVictoryService';

// Mock API client under the hood by intercepting fetch via axios mock adapter if needed.
// Here we stub service methods directly to keep the test fast and deterministic.

jest.mock('../PersonalAIAssistantService', () => {
  return {
    personalAIAssistantService: {
      getTodayOutcome: jest.fn().mockResolvedValue(null),
      setTodayWinCondition: jest.fn().mockImplementation(async (input: any) => ({
        ...input,
        result: 'pending',
      })),
      markTodayResult: jest.fn().mockImplementation(async (result: 'win' | 'lose') => ({
        date: new Date().toISOString().slice(0, 10),
        winCondition: '60分の集中作業を達成する',
        criteria: ['25+25+10分の集中', '休憩も記録'],
        result,
      })),
    },
  };
});

jest.mock('@/services/api/workTimeApi', () => {
  return {
    workTimeApi: {
      getAll: jest.fn().mockResolvedValue({ data: [] }),
    },
  };
});

describe('DailyVictoryService', () => {
  it('ensureTodayWinCondition creates a default condition when none exists', async () => {
    const rec = await dailyVictoryService.ensureTodayWinCondition();
    expect(rec.date).toBeDefined();
    expect(rec.winCondition.length).toBeGreaterThan(0);
    expect(rec.result).toBe('pending');
  });

  it('markResult updates today result', async () => {
    const rec = await dailyVictoryService.markResult('win');
    expect(rec.result).toBe('win');
  });
});
