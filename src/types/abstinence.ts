export type AbstinenceType =
  | 'alcohol' // 禁酒
  | 'smoking' // 禁煙
  | 'gambling' // 禁ギャンブル
  | 'masturbation' // 禁オナニー
  | 'pornography' // 禁ポルノ
  | 'prostitution' // 禁風俗
  | 'shopping' // 禁無駄遣い
  | 'social_media' // SNS断ち
  | 'gaming' // ゲーム断ち
  | 'junk_food'; // ジャンクフード断ち

export interface AbstinenceChallenge {
  id: string;
  userId: string;
  type: AbstinenceType;
  title: string;
  description?: string;
  startDate: string;
  currentStreak: number; // 現在の連続日数
  longestStreak: number; // 最長記録
  level: number;
  experience: number;
  experienceToNext: number;
  isActive: boolean;
  difficultyMultiplier: number; // 難易度係数（経験値計算用）
  createdAt: string;
  updatedAt: string;
}

export interface AbstinenceLog {
  id: string;
  challengeId: string;
  userId: string;
  date: string;
  status: 'success' | 'failure' | 'reset';
  note?: string;
  experienceGained: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  type: AbstinenceType | 'general';
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'streak' | 'total_days' | 'level' | 'multiple_challenges';
    value: number;
    challengeTypes?: AbstinenceType[];
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  experienceReward: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  challengeId?: string;
}

export interface AbstinenceStats {
  totalDays: number;
  totalExperience: number;
  averageLevel: number;
  activeChallenges: number;
  completedChallenges: number;
  achievements: number;
  rank: string;
  nextRankProgress: number;
}

// RPG要素の設定
export const ABSTINENCE_CONFIG = {
  types: {
    alcohol: { name: '禁酒', icon: '🍺', difficulty: 1.2, color: '#F59E0B' },
    smoking: { name: '禁煙', icon: '🚬', difficulty: 1.5, color: '#6B7280' },
    gambling: { name: '禁ギャンブル', icon: '🎰', difficulty: 1.3, color: '#DC2626' },
    masturbation: { name: '禁オナニー', icon: '🚫', difficulty: 1.4, color: '#7C3AED' },
    pornography: { name: '禁ポルノ', icon: '📱', difficulty: 1.6, color: '#BE185D' },
    prostitution: { name: '禁風俗', icon: '🏠', difficulty: 1.8, color: '#B91C1C' },
    shopping: { name: '禁無駄遣い', icon: '💳', difficulty: 1.1, color: '#059669' },
    social_media: { name: 'SNS断ち', icon: '📱', difficulty: 1.0, color: '#3B82F6' },
    gaming: { name: 'ゲーム断ち', icon: '🎮', difficulty: 1.2, color: '#8B5CF6' },
    junk_food: { name: 'ジャンクフード断ち', icon: '🍔', difficulty: 1.1, color: '#F97316' },
  },
  experienceFormula: (days: number, difficulty: number) => Math.floor(days * 10 * difficulty),
  levelFormula: (experience: number) => Math.floor(Math.sqrt(experience / 100)) + 1,
  experienceToNextLevel: (level: number) => Math.pow(level, 2) * 100,
  ranks: [
    { name: '初心者', minLevel: 1, icon: '🥉' },
    { name: '駆け出し', minLevel: 5, icon: '🥈' },
    { name: '熟練者', minLevel: 10, icon: '🥇' },
    { name: '専門家', minLevel: 20, icon: '💎' },
    { name: 'マスター', minLevel: 35, icon: '👑' },
    { name: 'グランドマスター', minLevel: 50, icon: '🏆' },
    { name: '伝説', minLevel: 75, icon: '⭐' },
    { name: '神', minLevel: 100, icon: '🌟' },
  ],
};
