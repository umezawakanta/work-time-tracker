import { deriveMBTIType, type MBTIAnswerInput } from '@/services/assessments/mbti';

describe('deriveMBTIType - type computation', () => {
  const mk = (dimension: MBTIAnswerInput['dimension'], towards: any, choice: any) =>
    ({
      questionId: `${dimension}-${towards}-${choice}`,
      dimension,
      towards,
      choice,
    }) as MBTIAnswerInput;

  test('neutral answers (all 3) bias to first letter by >= 0 rule', () => {
    const res = deriveMBTIType([
      mk('EI', 'E', 3),
      mk('SN', 'S', 3),
      mk('TF', 'T', 3),
      mk('JP', 'J', 3),
    ]);
    expect(res.type).toBe('ESTJ');
    expect(res.scores).toEqual({ EI: 0, SN: 0, TF: 0, JP: 0 });
  });

  test('strongly toward I,N,F,P (5) should produce INFP', () => {
    const res = deriveMBTIType([
      mk('EI', 'I', 5),
      mk('SN', 'N', 5),
      mk('TF', 'F', 5),
      mk('JP', 'P', 5),
    ]);
    expect(res.type).toBe('INFP');
    expect(res.dominant).toEqual({ EI: 'I', SN: 'N', TF: 'F', JP: 'P' });
  });

  test('mixed weights - sums determine dominance', () => {
    const res = deriveMBTIType([
      mk('EI', 'E', 4), // +1 to E
      mk('EI', 'I', 2), // +1 to I (subtract -> -1 to E)
      mk('EI', 'E', 4), // +1 to E → net +1
      mk('SN', 'S', 4), // +1 to S
      mk('SN', 'N', 4), // -1 to S → net 0 => S selected by >= 0 rule
      mk('TF', 'F', 5), // -2 to T → favors F
      mk('JP', 'J', 1), // -2 to J → favors P
      mk('JP', 'P', 4), // -1 to J → favors P more
    ]);
    expect(res.type).toBe('ESFP');
  });
});
