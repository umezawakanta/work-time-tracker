export interface IQAnswer {
  questionId: string;
  correct: boolean;
}

export interface IQScoreResult {
  rawScore: number; // number of correct answers
  total: number;
  scaledIQ: number; // pseudo IQ scaled to mean 100, sd 15 (heuristic)
  percentile: number; // rough percentile estimate
}

/**
 * Calculate a simple IQ-like score from answers.
 * Heuristic: scaledIQ = 100 + 15 * z, z = (raw/total - 0.5) / 0.2 (so 50% -> 100)
 */
export function calculateIQScore(answers: IQAnswer[], totalQuestions: number): IQScoreResult {
  const correct = answers.filter((a) => a.correct).length;
  const p = totalQuestions > 0 ? correct / totalQuestions : 0;
  const z = (p - 0.5) / 0.2;
  const scaled = Math.round(100 + 15 * z);
  const clamped = Math.max(55, Math.min(145, scaled));
  const percentile = Math.round(100 * 0.5 * (1 + Math.tanh(z)));
  return { rawScore: correct, total: totalQuestions, scaledIQ: clamped, percentile };
}
