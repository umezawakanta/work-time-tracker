// キャラクター役割システムの型定義

export interface CharacterRole {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  unlockLevel: number;
  unlockBadges: string[];
  unlockWorkCoins: number;
}

export interface CharacterInteraction {
  fromCharacter: string;
  toCharacter: string;
  interactionType: 'encourage' | 'celebrate' | 'support' | 'motivate';
  message: string;
  triggerCondition: {
    type: 'level_up' | 'badge_earned' | 'work_coin_earned' | 'time_tracked' | 'memo_created';
    value?: number;
  };
  animation: string;
  sound?: string;
}

export interface CharacterReaction {
  characterId: string;
  reactionType: 'happy' | 'excited' | 'proud' | 'encouraging' | 'celebrating';
  trigger: {
    type: 'user_achievement' | 'system_event' | 'time_based';
    condition: any;
  };
  animation: string;
  duration: number;
  message?: string;
}

// キャラクター役割の定義
export const CHARACTER_ROLES: CharacterRole[] = [
  {
    id: 'main_character',
    name: 'メインキャラクター',
    description: 'ユーザーの成長を直接サポートするメインキャラクター',
    responsibilities: ['レベル表示', '経験値管理', 'バッジ表示', '進捗報告'],
    unlockLevel: 1,
    unlockBadges: [],
    unlockWorkCoins: 0
  },
  {
    id: 'running_character',
    name: '走行キャラクター',
    description: '作業の活発さを表現する走行キャラクター',
    responsibilities: ['作業時間の可視化', 'エネルギーレベル表示', '作業モチベーション'],
    unlockLevel: 1,
    unlockBadges: [],
    unlockWorkCoins: 0
  },
  {
    id: 'hetama_character',
    name: 'ヘタマキャラクター',
    description: '活動と学習をサポートするヘタマキャラクター',
    responsibilities: ['学習進捗の応援', '新しい機能の案内', 'ヒント提供'],
    unlockLevel: 3,
    unlockBadges: ['first_learning'],
    unlockWorkCoins: 50
  },
  {
    id: 'dog_character',
    name: '犬キャラクター',
    description: '作業の継続性をサポートする忠実な犬キャラクター',
    responsibilities: ['作業継続の励まし', '休憩の提案', 'ストレス軽減'],
    unlockLevel: 5,
    unlockBadges: ['work_streak_7'],
    unlockWorkCoins: 100
  },
  {
    id: 'logo_character',
    name: 'ロゴキャラクター',
    description: 'アプリの顔となる特別なロゴキャラクター',
    responsibilities: ['ウェルカムメッセージ', '特別なイベント表示', 'アプリ紹介'],
    unlockLevel: 1,
    unlockBadges: [],
    unlockWorkCoins: 0
  }
];

// キャラクター間の相互作用定義
export const CHARACTER_INTERACTIONS: CharacterInteraction[] = [
  {
    fromCharacter: 'hetama_character',
    toCharacter: 'main_character',
    interactionType: 'encourage',
    message: '頑張ってるね！一緒に成長しよう！',
    triggerCondition: {
      type: 'level_up'
    },
    animation: 'wave_and_sparkle'
  },
  {
    fromCharacter: 'dog_character',
    toCharacter: 'running_character',
    interactionType: 'motivate',
    message: '走り続けてるね！僕も応援してるよ！',
    triggerCondition: {
      type: 'time_tracked',
      value: 60 // 1時間以上
    },
    animation: 'bark_and_tail_wag'
  },
  {
    fromCharacter: 'main_character',
    toCharacter: 'logo_character',
    interactionType: 'celebrate',
    message: '新しいバッジを獲得したよ！',
    triggerCondition: {
      type: 'badge_earned'
    },
    animation: 'celebration_dance'
  }
];

// キャラクター反応定義
export const CHARACTER_REACTIONS: CharacterReaction[] = [
  {
    characterId: 'main_character',
    reactionType: 'happy',
    trigger: {
      type: 'user_achievement',
      condition: { type: 'level_up' }
    },
    animation: 'bounce_and_sparkle',
    duration: 2000,
    message: 'レベルアップおめでとう！'
  },
  {
    characterId: 'running_character',
    reactionType: 'excited',
    trigger: {
      type: 'user_achievement',
      condition: { type: 'time_tracked', value: 120 } // 2時間以上
    },
    animation: 'run_faster',
    duration: 3000,
    message: 'すごい集中力だね！'
  },
  {
    characterId: 'hetama_character',
    reactionType: 'proud',
    trigger: {
      type: 'user_achievement',
      condition: { type: 'badge_earned' }
    },
    animation: 'wings_spread',
    duration: 2500,
    message: '新しいバッジだね！素晴らしい！'
  },
  {
    characterId: 'dog_character',
    reactionType: 'encouraging',
    trigger: {
      type: 'system_event',
      condition: { type: 'work_streak', value: 3 } // 3日連続
    },
    animation: 'tail_wag_enthusiastic',
    duration: 2000,
    message: '連続作業すごいね！僕も嬉しいよ！'
  }
];
