// src/services/ai/Coordinator.ts
// Coordinator placeholder that will connect QuadrantClassificationService and AdvancedAIService

import QuadrantClassificationService, {
  UnifiedTaskData,
  TaskQuadrantClassification,
} from './QuadrantClassificationService';
import AdvancedAIService, { AIAnalysisResult } from './AdvancedAIService';

export interface CoordinatorOptions {
  hybrid?: boolean; // whether to use hybrid quadrant analysis (multi-provider)
  performProductivityAnalysis?: boolean; // whether to run productivity analysis
}

export interface CoordinatorResult {
  quadrants: TaskQuadrantClassification[];
  productivity?: AIAnalysisResult;
  meta: {
    startedAt: number;
    durationMs: number;
    usedHybrid: boolean;
  };
}

/**
 * Coordinate future AI flows between QuadrantClassificationService and AdvancedAIService.
 * NOTE: This is a placeholder (no network work). It returns a typed shell result.
 */
export async function coordinateQuadrantAndAdvancedAnalysis(
  _tasks: UnifiedTaskData[],
  options?: CoordinatorOptions
): Promise<CoordinatorResult> {
  const startedAt = Date.now();
  const usedHybrid = Boolean(options?.hybrid);

  // Intentionally do not call downstream services here.
  // This establishes a typed, extensible contract for future orchestration.

  return {
    quadrants: [],
    productivity: undefined,
    meta: {
      startedAt,
      durationMs: Date.now() - startedAt,
      usedHybrid,
    },
  };
}

export default {
  coordinateQuadrantAndAdvancedAnalysis,
};
