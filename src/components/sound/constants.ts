// 音アプリの定数定義
export const IDEAL_BALANCE_RATIOS = {
  staple: 0.4,
  side: 0.3,
  miso: 0.1,
  meat: 0.1,
  fish: 0.05,
  vegetable: 0.05,
} as const;

export const PLAYBACK_DURATION = 15000;
export const TEMPO_RANGE = { MIN: 60, MAX: 200 } as const;
export const REPEAT_OPTIONS = {
  NONE: 0,
  ONCE: 1,
  TWICE: 2,
  THREE_TIMES: 3,
  LOOP: -1,
} as const;
