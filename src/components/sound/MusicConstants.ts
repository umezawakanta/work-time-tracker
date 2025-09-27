// 音楽理論定数

// サポートされている調号
export const SUPPORTED_KEY_SIGNATURES = [
  // メジャーキー
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#',
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb',
  // マイナーキー
  'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m',
  'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm', 'Dbm', 'Gbm'
] as const;

// 調号の型定義
export type KeySignature = typeof SUPPORTED_KEY_SIGNATURES[number];

// 音程定数
export const INTERVALS = {
  UNISON: 0,
  MINOR_SECOND: 1,
  MAJOR_SECOND: 2,
  MINOR_THIRD: 3,
  MAJOR_THIRD: 4,
  PERFECT_FOURTH: 5,
  TRITONE: 6,
  PERFECT_FIFTH: 7,
  MINOR_SIXTH: 8,
  MAJOR_SIXTH: 9,
  MINOR_SEVENTH: 10,
  MAJOR_SEVENTH: 11,
  OCTAVE: 12
} as const;

// 音階定数
export const SCALES = {
  MAJOR: [0, 2, 4, 5, 7, 9, 11],
  MINOR: [0, 2, 3, 5, 7, 8, 10],
  PENTATONIC_MAJOR: [0, 2, 4, 7, 9],
  PENTATONIC_MINOR: [0, 3, 5, 7, 10],
  BLUES: [0, 3, 5, 6, 7, 10]
} as const;

// 拍子記号定数
export const TIME_SIGNATURES = [
  '4/4', '3/4', '2/4', '6/8', '9/8', '12/8'
] as const;

export type TimeSignature = typeof TIME_SIGNATURES[number];
