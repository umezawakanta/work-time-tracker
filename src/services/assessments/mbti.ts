export type MBTIDimension = 'EI' | 'SN' | 'TF' | 'JP';
export type MBTILetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export interface MBTIAnswerInput {
  questionId: string;
  dimension: MBTIDimension;
  towards: MBTILetter; // letter the agreement leans toward
  choice: 1 | 2 | 3 | 4 | 5; // 1=Strongly Disagree ... 5=Strongly Agree
}

export interface MBTIResult {
  type: string; // e.g., INTP
  scores: {
    EI: number;
    SN: number;
    TF: number;
    JP: number;
  };
  dominant: {
    EI: 'E' | 'I';
    SN: 'S' | 'N';
    TF: 'T' | 'F';
    JP: 'J' | 'P';
  };
}

/**
 * Convert Likert(1..5) into a signed weight: -2..+2 (3 -> 0)
 */
function likertToWeight(choice: 1 | 2 | 3 | 4 | 5): number {
  return (choice as number) - 3;
}

/**
 * Derive MBTI type by aggregating signed weights per dimension toward a letter.
 */
export function deriveMBTIType(answers: MBTIAnswerInput[]): MBTIResult {
  let ei = 0;
  let sn = 0;
  let tf = 0;
  let jp = 0;

  for (const a of answers) {
    const w = likertToWeight(a.choice);
    switch (a.dimension) {
      case 'EI':
        ei += a.towards === 'E' ? w : -w;
        break;
      case 'SN':
        sn += a.towards === 'S' ? w : -w;
        break;
      case 'TF':
        tf += a.towards === 'T' ? w : -w;
        break;
      case 'JP':
        jp += a.towards === 'J' ? w : -w;
        break;
    }
  }

  const dominant = {
    EI: ei >= 0 ? 'E' : 'I',
    SN: sn >= 0 ? 'S' : 'N',
    TF: tf >= 0 ? 'T' : 'F',
    JP: jp >= 0 ? 'J' : 'P',
  } as const;

  const type = `${dominant.EI}${dominant.SN}${dominant.TF}${dominant.JP}`;
  return {
    type,
    scores: { EI: ei, SN: sn, TF: tf, JP: jp },
    dominant: dominant as MBTIResult['dominant'],
  };
}
