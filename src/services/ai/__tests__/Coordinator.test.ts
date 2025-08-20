import { coordinateQuadrantAndAdvancedAnalysis } from '@/services/ai/Coordinator';

// Mock dependent services to validate I/F without invoking real logic
jest.mock('@/services/ai/QuadrantClassificationService', () => ({
  __esModule: true,
  default: {
    classify: jest.fn(),
  },
}));

jest.mock('@/services/ai/AdvancedAIService', () => ({
  __esModule: true,
  default: {
    analyzeProductivity: jest.fn(),
    generateResponse: jest.fn(),
    getCurrentProvider: jest.fn(),
  },
}));

describe('Coordinator I/F', () => {
  it('returns a typed shell result with meta and empty data by default', async () => {
    const started = Date.now();
    const result = await coordinateQuadrantAndAdvancedAnalysis([], {
      hybrid: false,
      performProductivityAnalysis: false,
    });

    expect(Array.isArray(result.quadrants)).toBe(true);
    expect(result.quadrants.length).toBe(0);
    expect(result.productivity).toBeUndefined();

    expect(typeof result.meta.startedAt).toBe('number');
    expect(typeof result.meta.durationMs).toBe('number');
    expect(result.meta.startedAt).toBeGreaterThanOrEqual(started);
    expect(result.meta.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.meta.usedHybrid).toBe(false);
  });

  it('respects the hybrid option in meta.usedHybrid', async () => {
    const result = await coordinateQuadrantAndAdvancedAnalysis([], { hybrid: true });
    expect(result.meta.usedHybrid).toBe(true);
  });

  it('does not call dependent services in the placeholder implementation', async () => {
    const { default: QuadrantClassificationService } = await import(
      '@/services/ai/QuadrantClassificationService'
    );
    const { default: AdvancedAIService } = await import('@/services/ai/AdvancedAIService');

    await coordinateQuadrantAndAdvancedAnalysis([], {
      hybrid: true,
      performProductivityAnalysis: true,
    });

    expect(QuadrantClassificationService.classify).not.toHaveBeenCalled();
    expect(AdvancedAIService.analyzeProductivity).not.toHaveBeenCalled();
    expect(AdvancedAIService.generateResponse).not.toHaveBeenCalled();
  });
});
