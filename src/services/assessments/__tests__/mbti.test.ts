import { deriveMBTIType, type MBTIAnswerInput } from '@/services/assessments/mbti';

describe('deriveMBTIType type derivation', () => {
  it('neutral choices should bias to first letter by >= 0 rule', () => {
    const answers: MBTIAnswerInput[] = [
      { questionId: '1', dimension: 'EI', towards: 'E', choice: 3 },
      { questionId: '2', dimension: 'SN', towards: 'S', choice: 3 },
      { questionId: '3', dimension: 'TF', towards: 'T', choice: 3 },
      { questionId: '4', dimension: 'JP', towards: 'J', choice: 3 },
    ];
    const res = deriveMBTIType(answers);
    expect(res.type).toBe('ESTJ');
    expect(res.dominant).toEqual({ EI: 'E', SN: 'S', TF: 'T', JP: 'J' });
  });

  it('strongly toward I, N, F, P should produce INFP', () => {
    const answers: MBTIAnswerInput[] = [
      { questionId: '1', dimension: 'EI', towards: 'I', choice: 5 },
      { questionId: '2', dimension: 'SN', towards: 'N', choice: 5 },
      { questionId: '3', dimension: 'TF', towards: 'F', choice: 5 },
      { questionId: '4', dimension: 'JP', towards: 'P', choice: 5 },
    ];
    const res = deriveMBTIType(answers);
    expect(res.type).toBe('INFP');
    expect(res.dominant).toEqual({ EI: 'I', SN: 'N', TF: 'F', JP: 'P' });
    expect(res.scores.EI).toBeLessThan(0);
    expect(res.scores.SN).toBeLessThan(0);
    expect(res.scores.TF).toBeLessThan(0);
    expect(res.scores.JP).toBeLessThan(0);
  });

  it('mixed weights aggregate per dimension', () => {
    const answers: MBTIAnswerInput[] = [
      { questionId: '1', dimension: 'EI', towards: 'E', choice: 4 }, // +1 E
      { questionId: '2', dimension: 'EI', towards: 'I', choice: 4 }, // -1 E (toward I)
      { questionId: '3', dimension: 'SN', towards: 'S', choice: 2 }, // -1 S
      { questionId: '4', dimension: 'SN', towards: 'N', choice: 4 }, // -1 S (toward N)
      { questionId: '5', dimension: 'TF', towards: 'T', choice: 5 }, // +2 T
      { questionId: '6', dimension: 'TF', towards: 'F', choice: 2 }, // -1 T (toward F) => net +1
      { questionId: '7', dimension: 'JP', towards: 'J', choice: 1 }, // -2 J
      { questionId: '8', dimension: 'JP', towards: 'P', choice: 1 }, // +2 P => net 0, bias J
    ];
    const res = deriveMBTIType(answers);
    expect(res.dominant.EI).toBe('E');
    expect(res.dominant.SN).toBe('N');
    expect(res.dominant.TF).toBe('T');
    expect(res.dominant.JP).toBe('J');
    expect(res.type).toBe('ENTJ');
  });
});
