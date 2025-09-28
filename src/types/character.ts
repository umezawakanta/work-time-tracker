// キャラクター機能の型定義

export interface Character {
  id: string;
  name: string;
  type: 'cute' | 'cool' | 'mysterious' | 'energetic';
  level: number;
  experience: number;
  unlocked: boolean;
  customization: CharacterCustomization;
  animations: CharacterAnimations;
  personality: CharacterPersonality;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockConditions?: string[];
}

export interface CharacterCustomization {
  color: string;
  accessories: string[];
  outfit: string;
  size: 'small' | 'medium' | 'large';
}

export interface CharacterAnimations {
  idle: string;
  working: string;
  celebrating: string;
  sleeping: string;
  thinking: string;
  excited: string;
}

export interface CharacterPersonality {
  traits: string[];
  messages: {
    encouragement: string[];
    celebration: string[];
    reminder: string[];
    greeting: string[];
    farewell: string[];
  };
  voice: 'cheerful' | 'calm' | 'energetic' | 'mysterious';
}

export interface UserCharacterSettings {
  selectedCharacterId: string;
  customizations: CharacterCustomization;
  preferences: {
    animationSpeed: 'slow' | 'normal' | 'fast';
    showAnimations: boolean;
    soundEffects: boolean;
    autoInteract: boolean;
  };
  achievements: string[];
  unlockedCharacters: string[];
  totalExperience: number;
  playTime: number; // 分単位
}

export interface CharacterAchievement {
  id: string;
  name: string;
  description: string;
  condition: {
    type: 'work_hours' | 'consecutive_days' | 'level_reach' | 'character_unlock' | 'custom';
    value: number;
    customCondition?: () => boolean;
  };
  reward: {
    experience: number;
    characterId?: string;
    customization?: Partial<CharacterCustomization>;
    title?: string;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface CharacterInteraction {
  id: string;
  characterId: string;
  type: 'click' | 'work_start' | 'work_end' | 'level_up' | 'achievement' | 'idle';
  message: string;
  animation: string;
  soundEffect?: string;
  cooldown?: number; // ミリ秒
  lastTriggered?: Date;
}

export interface CharacterCollection {
  totalCharacters: number;
  unlockedCharacters: number;
  completionRate: number;
  characters: {
    [characterId: string]: {
      unlocked: boolean;
      unlockedAt?: Date;
      timesUsed: number;
      totalPlayTime: number;
      favorite: boolean;
    };
  };
}

// デフォルト設定
export const DEFAULT_CHARACTER_SETTINGS: UserCharacterSettings = {
  selectedCharacterId: 'default-cute-001',
  customizations: {
    color: '#FFB6C1',
    accessories: [],
    outfit: 'default',
    size: 'medium'
  },
  preferences: {
    animationSpeed: 'normal',
    showAnimations: true,
    soundEffects: true,
    autoInteract: false
  },
  achievements: [],
  unlockedCharacters: ['default-cute-001'],
  totalExperience: 0,
  playTime: 0
};

// キャラクタータイプの定義
export const CHARACTER_TYPES = {
  cute: {
    name: 'キュート',
    description: '可愛らしく親しみやすいキャラクター',
    color: '#FFB6C1',
    traits: ['friendly', 'cheerful', 'caring']
  },
  cool: {
    name: 'クール',
    description: 'かっこよくスタイリッシュなキャラクター',
    color: '#4169E1',
    traits: ['confident', 'mysterious', 'elegant']
  },
  mysterious: {
    name: 'ミステリアス',
    description: '神秘的で魅力的なキャラクター',
    color: '#8A2BE2',
    traits: ['mysterious', 'wise', 'enigmatic']
  },
  energetic: {
    name: 'エネルギッシュ',
    description: '元気で活発なキャラクター',
    color: '#FFD700',
    traits: ['energetic', 'enthusiastic', 'motivated']
  }
} as const;

// レアリティの定義
export const CHARACTER_RARITY = {
  common: {
    name: 'コモン',
    color: '#808080',
    dropRate: 0.6,
    experienceMultiplier: 1.0
  },
  rare: {
    name: 'レア',
    color: '#00BFFF',
    dropRate: 0.25,
    experienceMultiplier: 1.2
  },
  epic: {
    name: 'エピック',
    color: '#9370DB',
    dropRate: 0.12,
    experienceMultiplier: 1.5
  },
  legendary: {
    name: 'レジェンダリー',
    color: '#FFD700',
    dropRate: 0.03,
    experienceMultiplier: 2.0
  }
} as const;
