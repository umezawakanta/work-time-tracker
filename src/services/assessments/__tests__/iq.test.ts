import { calculateIQScore, type IQAnswer } from '@/services/assessments/iq';

describe('calculateIQScore boundary conditions', () => {
  it('handles zero questions gracefully', () => {
    const res = calculateIQScore([], 0);
    expect(res.rawScore).toBe(0);
    expect(res.total).toBe(0);
    expect(res.scaledIQ).toBeGreaterThanOrEqual(55);
    expect(res.scaledIQ).toBeLessThanOrEqual(145);
    expect(res.percentile).toBeGreaterThanOrEqual(0);
    expect(res.percentile).toBeLessThanOrEqual(100);
  });

  it('all incorrect answers yields low scaled IQ (clamped)', () => {
    const answers: IQAnswer[] = Array.from({ length: 20 }).map((_, i) => ({
      questionId: `q${i}`,
      correct: false,
    }));
    const res = calculateIQScore(answers, 20);
    expect(res.rawScore).toBe(0);
    expect(res.scaledIQ).toBeGreaterThanOrEqual(55);
  });

  it('all correct answers yields high scaled IQ (clamped)', () => {
    const answers: IQAnswer[] = Array.from({ length: 20 }).map((_, i) => ({
      questionId: `q${i}`,
      correct: true,
    }));
    const res = calculateIQScore(answers, 20);
    expect(res.rawScore).toBe(20);
    expect(res.scaledIQ).toBeLessThanOrEqual(145);
  });

  it('half correct should be around 100 scaled IQ', () => {
    const answers: IQAnswer[] = Array.from({ length: 10 })
      .map((_, i) => ({
        questionId: `qT${i}`,
        correct: true,
      }))
      .concat(Array.from({ length: 10 }).map((_, i) => ({ questionId: `qF${i}`, correct: false })));
    const res = calculateIQScore(answers, 20);
    // Heuristic centers near 100
    expect(Math.abs(res.scaledIQ - 100)).toBeLessThanOrEqual(2);
  });
});
