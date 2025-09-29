// バッジシステムの型定義

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // 絵文字またはアイコン
  imageUrl?: string; // バッジ画像のURL
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'registration' | 'achievement' | 'milestone' | 'special';
  unlockCondition: string;
  unlockedAt?: Date;
  shareText: string; // シェア用のテキスト
  shareImageUrl?: string; // シェア用の画像URL
  xpReward: number; // 獲得時の経験値
}

export interface UserBadge {
  badgeId: string;
  unlockedAt: Date;
  isNew: boolean; // 新しく獲得したバッジかどうか
}

export interface BadgeProgress {
  badgeId: string;
  progress: number; // 0-100
  isUnlocked: boolean;
}

export interface BadgeShareData {
  badge: Badge;
  user: {
    name: string;
    displayName?: string;
  };
  shareUrl: string;
  shareText: string;
  shareImageUrl?: string;
}
