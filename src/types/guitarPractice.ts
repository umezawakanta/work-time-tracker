// ギター練習記録の型定義

export interface GuitarPracticeRecord {
  id: string;
  userId: string;
  practiceDate: Date;
  duration: number; // 練習時間（分）
  songTitle?: string; // 練習した曲名
  technique: string; // 練習したテクニック
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes?: string; // メモ
  rating: number; // 自己評価（1-5）
  createdAt: Date;
  updatedAt: Date;
}

export interface GuitarPracticeSummary {
  totalPracticeTime: number; // 総練習時間（分）
  totalSessions: number; // 総セッション数
  averageSessionTime: number; // 平均セッション時間
  thisWeekTime: number; // 今週の練習時間
  thisMonthTime: number; // 今月の練習時間
  lastPracticeDate?: Date; // 最後の練習日
  mostPracticedTechnique: string; // 最も練習したテクニック
  averageRating: number; // 平均評価
}

export interface GuitarPracticeAnalysis {
  weeklyProgress: Array<{
    week: string;
    totalTime: number;
    sessions: number;
  }>;
  techniqueBreakdown: Array<{
    technique: string;
    totalTime: number;
    sessions: number;
    averageRating: number;
  }>;
  difficultyDistribution: Array<{
    difficulty: string;
    count: number;
    percentage: number;
  }>;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

export const GUITAR_TECHNIQUES = [
  'コード練習',
  'スケール練習',
  'フィンガーピッキング',
  'ストローク',
  'バレーコード',
  'ハンマーオン・プルオフ',
  'スライド',
  'ベンド',
  'ビブラート',
  'アルペジオ',
  'ソロ演奏',
  'リズム練習',
  '耳コピ',
  '楽譜読み',
  'その他'
] as const;

export const GUITAR_DIFFICULTIES = [
  'beginner',
  'intermediate', 
  'advanced'
] as const;

export type GuitarTechnique = typeof GUITAR_TECHNIQUES[number];
export type GuitarDifficulty = typeof GUITAR_DIFFICULTIES[number];
