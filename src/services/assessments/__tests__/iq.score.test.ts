import { calculateIQScore, type IQAnswer } from '@/services/assessments/iq';

describe('calculateIQScore - boundary and typical cases', () => {
  const makeAnswers = (total: number, correct: number): IQAnswer[] => {
    return Array.from({ length: total }, (_, i) => ({
      questionId: `q${i + 1}`,
      correct: i < correct,
    }));
  };

  test('no questions → raw 0, total 0, scaledIQ within lower bound, percentile >= 0', () => {
    const res = calculateIQScore([], 0);
    expect(res.rawScore).toBe(0);
    expect(res.total).toBe(0);
    expect(res.scaledIQ).toBeGreaterThanOrEqual(55);
    expect(res.percentile).toBeGreaterThanOrEqual(0);
  });

  test('all wrong (0%) → scaledIQ near lower tail (>=55)', () => {
    const res = calculateIQScore(makeAnswers(20, 0), 20);
    expect(res.rawScore).toBe(0);
    expect(res.total).toBe(20);
    expect(res.scaledIQ).toBeGreaterThanOrEqual(55);
    expect(res.scaledIQ).toBeLessThanOrEqual(70);
  });

  test('half correct (50%) → around 100', () => {
    const res = calculateIQScore(makeAnswers(20, 10), 20);
    expect(res.rawScore).toBe(10);
    expect(res.total).toBe(20);
    // Heuristic should land near 100 (clamp not applied here)
    expect(Math.abs(res.scaledIQ - 100)).toBeLessThanOrEqual(2);
  });

  test('all correct (100%) → scaledIQ near upper tail (<=145)', () => {
    const res = calculateIQScore(makeAnswers(20, 20), 20);
    expect(res.rawScore).toBe(20);
    expect(res.total).toBe(20);
    expect(res.scaledIQ).toBeLessThanOrEqual(145);
    expect(res.scaledIQ).toBeGreaterThanOrEqual(130);
  });

  test('percentile increases with more correct answers', () => {
    const p0 = calculateIQScore(makeAnswers(20, 0), 20).percentile;
    const p10 = calculateIQScore(makeAnswers(20, 10), 20).percentile;
    const p20 = calculateIQScore(makeAnswers(20, 20), 20).percentile;
    expect(p0).toBeLessThanOrEqual(p10);
    expect(p10).toBeLessThanOrEqual(p20);
  });
});
