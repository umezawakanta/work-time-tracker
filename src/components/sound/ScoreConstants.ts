// ScoreDisplay用の定数定義

// 音符マッピングの定数
export const DEFAULT_NOTE_MAPPING = "C/3";

// 音符の長さを決定する閾値
export const NOTE_DURATION_THRESHOLDS = {
  LONG_DURATION: 0.6,    // これより長い場合は二分音符
  SHORT_DURATION: 0.3,   // これより短い場合は八分音符
} as const;

// 音符の長さの定数
export const NOTE_DURATIONS = {
  QUARTER: "q",    // 四分音符（デフォルト）
  HALF: "h",       // 二分音符
  EIGHTH: "8",     // 八分音符
} as const;

// 音符の長さを決定する関数
export const getNoteDuration = (soundDuration: number): string => {
  if (soundDuration > NOTE_DURATION_THRESHOLDS.LONG_DURATION) {
    return NOTE_DURATIONS.HALF;
  }
  if (soundDuration < NOTE_DURATION_THRESHOLDS.SHORT_DURATION) {
    return NOTE_DURATIONS.EIGHTH;
  }
  return NOTE_DURATIONS.QUARTER;
};
