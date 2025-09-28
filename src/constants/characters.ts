// キャラクターデータの定数とサンプルデータ

import { Character, CharacterAchievement } from '../types/character';

// サンプルキャラクターデータ
export const SAMPLE_CHARACTERS: Character[] = [
  {
    id: 'default-cute-001',
    name: 'ぽんちゃん',
    type: 'cute',
    level: 1,
    experience: 0,
    unlocked: true,
    customization: {
      color: '#FFB6C1',
      accessories: [],
      outfit: 'default',
      size: 'medium'
    },
    animations: {
      idle: 'bounce',
      working: 'concentrate',
      celebrating: 'jump',
      sleeping: 'sleep',
      thinking: 'tilt',
      excited: 'wave'
    },
    personality: {
      traits: ['friendly', 'cheerful', 'caring'],
      messages: {
        encouragement: [
          '一緒に頑張ろう！',
          'あなたならできるよ！',
          '一歩ずつ進んでいこう！',
          '今日も素晴らしい一日にしよう！'
        ],
        celebration: [
          'やったね！お疲れ様！',
          'すごい！よく頑張ったね！',
          '完璧！最高の結果だよ！',
          'おめでとう！本当に素晴らしい！'
        ],
        reminder: [
          'そろそろ休憩したらどう？',
          '無理しないでね！',
          '水分補給を忘れずに！',
          '目を休める時間だよ！'
        ],
        greeting: [
          'おはよう！今日も一緒に頑張ろう！',
          'こんにちは！調子はどう？',
          'お疲れ様！今日もお疲れ様でした！',
          'こんばんは！今日も一日お疲れ様！'
        ],
        farewell: [
          'また明日！お疲れ様でした！',
          'ゆっくり休んでね！',
          'また会おうね！',
          'お疲れ様！また明日！'
        ]
      },
      voice: 'cheerful'
    },
    description: '可愛らしくて親しみやすいキャラクター。いつもあなたを応援してくれます。',
    rarity: 'common',
    unlockConditions: []
  },
  {
    id: 'cool-001',
    name: 'レオン',
    type: 'cool',
    level: 1,
    experience: 0,
    unlocked: false,
    customization: {
      color: '#4169E1',
      accessories: [],
      outfit: 'default',
      size: 'medium'
    },
    animations: {
      idle: 'pose',
      working: 'focus',
      celebrating: 'nod',
      sleeping: 'rest',
      thinking: 'cross_arms',
      excited: 'thumbs_up'
    },
    personality: {
      traits: ['confident', 'mysterious', 'elegant'],
      messages: {
        encouragement: [
          '君の実力なら問題ない',
          '集中して取り組もう',
          '完璧を目指そう',
          '冷静に判断して進めよう'
        ],
        celebration: [
          '素晴らしい成果だ',
          '期待通りの結果だ',
          '完璧な仕事だった',
          '君の実力が証明された'
        ],
        reminder: [
          '効率を考えて休憩しよう',
          '適度な休息も重要だ',
          '集中力の維持を心がけよう',
          'バランスを保つことが大切だ'
        ],
        greeting: [
          '今日も最高のパフォーマンスを',
          '準備はできているか？',
          '今日も一緒に頑張ろう',
          '新しい挑戦の始まりだ'
        ],
        farewell: [
          '今日もお疲れ様だった',
          '明日も期待している',
          '良い休息を',
          'また明日会おう'
        ]
      },
      voice: 'calm'
    },
    description: 'クールでスタイリッシュなキャラクター。冷静で的確なアドバイスをしてくれます。',
    rarity: 'rare',
    unlockConditions: ['work_hours_10', 'consecutive_days_3']
  },
  {
    id: 'mysterious-001',
    name: 'ルナ',
    type: 'mysterious',
    level: 1,
    experience: 0,
    unlocked: false,
    customization: {
      color: '#8A2BE2',
      accessories: [],
      outfit: 'default',
      size: 'medium'
    },
    animations: {
      idle: 'float',
      working: 'meditate',
      celebrating: 'sparkle',
      sleeping: 'dream',
      thinking: 'mysterious',
      excited: 'magic'
    },
    personality: {
      traits: ['mysterious', 'wise', 'enigmatic'],
      messages: {
        encouragement: [
          '時は流れ、答えは見つかる',
          '内なる力を信じよう',
          '宇宙のエネルギーが君を支えている',
          '真実は常に近くにある'
        ],
        celebration: [
          '星々が君の成功を祝福している',
          '運命の糸が結ばれた',
          '宇宙の調和が保たれた',
          '真の力が解き放たれた'
        ],
        reminder: [
          '宇宙のリズムに合わせて休もう',
          '内なる声に耳を傾けよう',
          'エネルギーの流れを感じよう',
          '静寂の中に答えがある'
        ],
        greeting: [
          '星々の導きで今日も会えた',
          '宇宙のエネルギーが君を包んでいる',
          '今日も神秘的な一日を',
          '運命の糸が再び結ばれた'
        ],
        farewell: [
          '星々の下で安らかに眠れ',
          '宇宙の夢の中で会おう',
          '運命の糸は永遠に続く',
          'また星々の導きで会おう'
        ]
      },
      voice: 'mysterious'
    },
    description: '神秘的で魅力的なキャラクター。深い洞察力と知恵を持っています。',
    rarity: 'epic',
    unlockConditions: ['work_hours_50', 'level_reach_5', 'achievement_3']
  },
  {
    id: 'energetic-001',
    name: 'スパーク',
    type: 'energetic',
    level: 1,
    experience: 0,
    unlocked: false,
    customization: {
      color: '#FFD700',
      accessories: [],
      outfit: 'default',
      size: 'medium'
    },
    animations: {
      idle: 'bounce_high',
      working: 'energetic_work',
      celebrating: 'explosion',
      sleeping: 'power_nap',
      thinking: 'rapid_think',
      excited: 'super_excited'
    },
    personality: {
      traits: ['energetic', 'enthusiastic', 'motivated'],
      messages: {
        encouragement: [
          'やる気満々！一緒に頑張ろう！',
          'エネルギー全開で行こう！',
          '最高のパフォーマンスを見せよう！',
          '情熱を燃やして取り組もう！'
        ],
        celebration: [
          'やったー！最高の結果だ！',
          'すごい！すごい！すごい！',
          '完璧！完璧！完璧！',
          'ファンタスティック！'
        ],
        reminder: [
          'ちょっと休んでエネルギー充電しよう！',
          'パワーアップの時間だ！',
          'リフレッシュしてまた頑張ろう！',
          'エネルギーのバランスを保とう！'
        ],
        greeting: [
          'おはよう！今日も最高の一日にしよう！',
          'やる気スイッチオン！',
          '今日も一緒にパワー全開で！',
          'エネルギー充電完了！'
        ],
        farewell: [
          '今日も最高だった！また明日！',
          'お疲れ様！明日もパワー全開で！',
          'エネルギーを保ってね！',
          'また明日、一緒に頑張ろう！'
        ]
      },
      voice: 'energetic'
    },
    description: '元気で活発なキャラクター。いつもエネルギッシュでモチベーションを高めてくれます。',
    rarity: 'rare',
    unlockConditions: ['work_hours_25', 'consecutive_days_7']
  }
];

// アチーブメントデータ
export const CHARACTER_ACHIEVEMENTS: CharacterAchievement[] = [
  {
    id: 'first_work',
    name: '初めての作業',
    description: '初めて作業を開始しました',
    condition: {
      type: 'work_hours',
      value: 1
    },
    reward: {
      experience: 10,
      title: '初心者'
    },
    unlocked: false
  },
  {
    id: 'work_10_hours',
    name: '作業マスター',
    description: '合計10時間の作業を完了しました',
    condition: {
      type: 'work_hours',
      value: 10
    },
    reward: {
      experience: 50,
      characterId: 'cool-001'
    },
    unlocked: false
  },
  {
    id: 'work_50_hours',
    name: '作業エキスパート',
    description: '合計50時間の作業を完了しました',
    condition: {
      type: 'work_hours',
      value: 50
    },
    reward: {
      experience: 100,
      characterId: 'mysterious-001'
    },
    unlocked: false
  },
  {
    id: 'consecutive_3_days',
    name: '継続の力',
    description: '3日連続で作業しました',
    condition: {
      type: 'consecutive_days',
      value: 3
    },
    reward: {
      experience: 30,
      title: '継続者'
    },
    unlocked: false
  },
  {
    id: 'consecutive_7_days',
    name: '週間チャンピオン',
    description: '7日連続で作業しました',
    condition: {
      type: 'consecutive_days',
      value: 7
    },
    reward: {
      experience: 70,
      characterId: 'energetic-001'
    },
    unlocked: false
  },
  {
    id: 'level_5',
    name: 'レベルアップ',
    description: 'キャラクターがレベル5に到達しました',
    condition: {
      type: 'level_reach',
      value: 5
    },
    reward: {
      experience: 100,
      title: '成長者'
    },
    unlocked: false
  },
  {
    id: 'character_collector',
    name: 'キャラクターコレクター',
    description: '3体のキャラクターを解放しました',
    condition: {
      type: 'character_unlock',
      value: 3
    },
    reward: {
      experience: 150,
      title: 'コレクター'
    },
    unlocked: false
  }
];

// キャラクターのメッセージテンプレート
export const MESSAGE_TEMPLATES = {
  workStart: [
    '作業を開始しよう！',
    '集中して取り組もう！',
    '今日も頑張ろう！',
    '一緒に頑張ろう！'
  ],
  workEnd: [
    'お疲れ様でした！',
    'よく頑張ったね！',
    '完璧な作業だったよ！',
    '素晴らしい成果だ！'
  ],
  breakTime: [
    'そろそろ休憩しよう！',
    '無理しないでね！',
    '水分補給を忘れずに！',
    '目を休める時間だよ！'
  ],
  levelUp: [
    'レベルアップ！おめでとう！',
    '成長したね！すごい！',
    '新しい力が目覚めた！',
    '次のレベルを目指そう！'
  ],
  achievement: [
    'アチーブメント獲得！',
    '新しい称号を手に入れた！',
    '特別な報酬を獲得！',
    '素晴らしい達成だ！'
  ]
};

// アニメーション設定
export const ANIMATION_CONFIG = {
  durations: {
    idle: 2000,
    working: 1000,
    celebrating: 3000,
    sleeping: 4000,
    thinking: 1500,
    excited: 2500
  },
  speeds: {
    slow: 0.5,
    normal: 1.0,
    fast: 1.5
  }
};

// 経験値テーブル
export const EXPERIENCE_TABLE = {
  workHour: 10,
  consecutiveDayBonus: 5,
  levelUpMultiplier: 1.2,
  rarityMultiplier: {
    common: 1.0,
    rare: 1.2,
    epic: 1.5,
    legendary: 2.0
  }
};
