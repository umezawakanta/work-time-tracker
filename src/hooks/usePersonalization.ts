import { useMemo } from 'react';
import { User } from '@/types';

export interface PersonalizationFlags {
  isIntrovert: boolean;
  prefersPlanning: boolean;
  prefersIntuition: boolean;
  prefersThinking: boolean;
}

export function usePersonalization(user?: User | null): PersonalizationFlags {
  return useMemo(() => {
    const mbti = (user?.traits?.mbti || '').toUpperCase();
    const isIntrovert = mbti.startsWith('I');
    const prefersPlanning = mbti.endsWith('J');
    const prefersIntuition = mbti.includes('N');
    const prefersThinking = mbti.includes('T');
    return { isIntrovert, prefersPlanning, prefersIntuition, prefersThinking };
  }, [user?.traits?.mbti]);
}
