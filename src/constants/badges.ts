// バッジの定数データ

import { Badge } from '../types/badge';

export const BADGES: Badge[] = [
  {
    id: 'welcome',
    name: 'ようこそ！',
    description: 'Work Time Trackerに登録しました',
    icon: '🎉',
    rarity: 'common',
    category: 'registration',
    unlockCondition: 'ユーザー登録を完了する',
    shareText: 'Work Time Trackerに登録しました！時間管理を始めます 🎉 #WorkTimeTracker #時間管理',
    xpReward: 50
  },
  {
    id: 'login_bonus',
    name: 'ログインボーナス',
    description: 'ログインしました',
    icon: '🌟',
    rarity: 'common',
    category: 'daily',
    unlockCondition: 'ログインする',
    shareText: 'ログインボーナスを獲得しました！今日も頑張ります 🌟 #WorkTimeTracker #ログイン',
    xpReward: 10
  },
  {
    id: 'logout_achievement',
    name: 'お疲れ様',
    description: 'ログアウトしました',
    icon: '👋',
    rarity: 'common',
    category: 'daily',
    unlockCondition: 'ログアウトする',
    shareText: 'お疲れ様でした！今日も頑張りました 👋 #WorkTimeTracker #ログアウト',
    xpReward: 5
  },
  // 新しいバッジタイプ - 作業時間関連
  {
    id: 'work_hours_1',
    name: '作業開始',
    description: '1時間の作業を完了しました',
    icon: '⏰',
    rarity: 'common',
    category: 'work',
    unlockCondition: '1時間の作業を完了する',
    shareText: '1時間の作業を完了しました！集中力が身についてきました ⏰ #WorkTimeTracker #作業時間',
    xpReward: 20
  },
  {
    id: 'work_hours_5',
    name: '集中力向上',
    description: '5時間の作業を完了しました',
    icon: '🎯',
    rarity: 'common',
    category: 'work',
    unlockCondition: '5時間の作業を完了する',
    shareText: '5時間の作業を完了しました！集中力が向上しています 🎯 #WorkTimeTracker #集中力',
    xpReward: 50
  },
  {
    id: 'work_hours_10',
    name: '作業マスター',
    description: '10時間の作業を完了しました',
    icon: '💪',
    rarity: 'rare',
    category: 'work',
    unlockCondition: '10時間の作業を完了する',
    shareText: '10時間の作業を完了しました！作業マスターの称号を獲得 💪 #WorkTimeTracker #作業マスター',
    xpReward: 100
  },
  {
    id: 'work_hours_25',
    name: '作業の達人',
    description: '25時間の作業を完了しました',
    icon: '🏆',
    rarity: 'epic',
    category: 'work',
    unlockCondition: '25時間の作業を完了する',
    shareText: '25時間の作業を完了しました！作業の達人になりました 🏆 #WorkTimeTracker #達人',
    xpReward: 250
  },
  {
    id: 'work_hours_50',
    name: '作業の神',
    description: '50時間の作業を完了しました',
    icon: '👑',
    rarity: 'legendary',
    category: 'work',
    unlockCondition: '50時間の作業を完了する',
    shareText: '50時間の作業を完了しました！作業の神になりました 👑 #WorkTimeTracker #神',
    xpReward: 500
  },
  // 連続作業関連
  {
    id: 'work_streak_3',
    name: '継続の始まり',
    description: '3日連続で作業しました',
    icon: '🔥',
    rarity: 'common',
    category: 'streak',
    unlockCondition: '3日連続で作業する',
    shareText: '3日連続で作業しました！継続の始まりです 🔥 #WorkTimeTracker #継続',
    xpReward: 30
  },
  {
    id: 'work_streak_14',
    name: '習慣の力',
    description: '14日連続で作業しました',
    icon: '⚡',
    rarity: 'rare',
    category: 'streak',
    unlockCondition: '14日連続で作業する',
    shareText: '14日連続で作業しました！習慣の力が身についています ⚡ #WorkTimeTracker #習慣',
    xpReward: 150
  },
  {
    id: 'work_streak_30',
    name: '継続の王',
    description: '30日連続で作業しました',
    icon: '👑',
    rarity: 'epic',
    category: 'streak',
    unlockCondition: '30日連続で作業する',
    shareText: '30日連続で作業しました！継続の王になりました 👑 #WorkTimeTracker #継続の王',
    xpReward: 300
  },
  {
    id: 'work_streak_100',
    name: '継続の神',
    description: '100日連続で作業しました',
    icon: '🌟',
    rarity: 'legendary',
    category: 'streak',
    unlockCondition: '100日連続で作業する',
    shareText: '100日連続で作業しました！継続の神になりました 🌟 #WorkTimeTracker #継続の神',
    xpReward: 1000
  },
  // 時間管理関連
  {
    id: 'perfect_timing',
    name: '完璧なタイミング',
    description: '予定通りの時間で作業を完了しました',
    icon: '⏱️',
    rarity: 'rare',
    category: 'timing',
    unlockCondition: '予定通りの時間で作業を完了する',
    shareText: '完璧なタイミングで作業を完了しました！時間管理が上手になりました ⏱️ #WorkTimeTracker #時間管理',
    xpReward: 75
  },
  {
    id: 'early_bird',
    name: '早起きの達人',
    description: '朝早くから作業を開始しました',
    icon: '🌅',
    rarity: 'common',
    category: 'timing',
    unlockCondition: '朝6時前に作業を開始する',
    shareText: '早起きの達人になりました！朝の時間を有効活用しています 🌅 #WorkTimeTracker #早起き',
    xpReward: 40
  },
  {
    id: 'night_owl',
    name: '夜型の達人',
    description: '夜遅くまで作業を続けました',
    icon: '🦉',
    rarity: 'common',
    category: 'timing',
    unlockCondition: '夜11時以降まで作業を続ける',
    shareText: '夜型の達人になりました！夜の時間を有効活用しています 🦉 #WorkTimeTracker #夜型',
    xpReward: 40
  },
  // ソーシャル関連
  {
    id: 'social_butterfly',
    name: 'ソーシャルバタフライ',
    description: 'キャラクターを5回シェアしました',
    icon: '🦋',
    rarity: 'rare',
    category: 'social',
    unlockCondition: 'キャラクターを5回シェアする',
    shareText: 'ソーシャルバタフライになりました！多くの人にキャラクターをシェアしています 🦋 #WorkTimeTracker #シェア',
    xpReward: 100
  },
  {
    id: 'influencer',
    name: 'インフルエンサー',
    description: 'バッジを10回シェアしました',
    icon: '📱',
    rarity: 'epic',
    category: 'social',
    unlockCondition: 'バッジを10回シェアする',
    shareText: 'インフルエンサーになりました！多くの人に影響を与えています 📱 #WorkTimeTracker #インフルエンサー',
    xpReward: 200
  },
  // 特別なバッジ
  {
    id: 'first_blood',
    name: 'ファーストブラッド',
    description: '初めてのバッジを獲得しました',
    icon: '🩸',
    rarity: 'common',
    category: 'special',
    unlockCondition: '初めてのバッジを獲得する',
    shareText: 'ファーストブラッド！初めてのバッジを獲得しました 🩸 #WorkTimeTracker #初回',
    xpReward: 25
  },
  {
    id: 'collector',
    name: 'コレクター',
    description: '10個のバッジを獲得しました',
    icon: '📚',
    rarity: 'rare',
    category: 'special',
    unlockCondition: '10個のバッジを獲得する',
    shareText: 'コレクターになりました！10個のバッジを集めました 📚 #WorkTimeTracker #コレクター',
    xpReward: 150
  },
  {
    id: 'master_collector',
    name: 'マスターコレクター',
    description: '25個のバッジを獲得しました',
    icon: '🏆',
    rarity: 'epic',
    category: 'special',
    unlockCondition: '25個のバッジを獲得する',
    shareText: 'マスターコレクターになりました！25個のバッジを集めました 🏆 #WorkTimeTracker #マスターコレクター',
    xpReward: 300
  },
  {
    id: 'legendary_collector',
    name: 'レジェンダリーコレクター',
    description: '50個のバッジを獲得しました',
    icon: '👑',
    rarity: 'legendary',
    category: 'special',
    unlockCondition: '50個のバッジを獲得する',
    shareText: 'レジェンダリーコレクターになりました！50個のバッジを集めました 👑 #WorkTimeTracker #レジェンダリー',
    xpReward: 500
  },
  {
    id: 'first_work',
    name: '初めての作業',
    description: '初めて作業を開始しました',
    icon: '🚀',
    rarity: 'common',
    category: 'achievement',
    unlockCondition: '初めて作業を開始する',
    shareText: '初めての作業を開始しました！集中して頑張ります 🚀 #WorkTimeTracker #作業開始',
    xpReward: 25
  },
  {
    id: 'work_streak_7',
    name: '継続の力',
    description: '7日連続で作業を記録しました',
    icon: '🔥',
    rarity: 'rare',
    category: 'milestone',
    unlockCondition: '7日連続で作業を記録する',
    shareText: '7日連続で作業を記録しました！継続は力なり 🔥 #WorkTimeTracker #継続',
    xpReward: 100
  },
  {
    id: 'work_streak_30_milestone',
    name: '習慣の達人',
    description: '30日連続で作業を記録しました',
    icon: '💪',
    rarity: 'epic',
    category: 'milestone',
    unlockCondition: '30日連続で作業を記録する',
    shareText: '30日連続で作業を記録しました！習慣化に成功 💪 #WorkTimeTracker #習慣化',
    xpReward: 300
  },
  {
    id: 'time_master',
    name: '時間管理マスター',
    description: '累計100時間の作業を記録しました',
    icon: '⏰',
    rarity: 'epic',
    category: 'milestone',
    unlockCondition: '累計100時間の作業を記録する',
    shareText: '累計100時間の作業を記録しました！時間管理マスターです ⏰ #WorkTimeTracker #時間管理',
    xpReward: 250
  },
  {
    id: 'diary_writer',
    name: '記録の達人',
    description: '10回の日記を書きました',
    icon: '📝',
    rarity: 'rare',
    category: 'achievement',
    unlockCondition: '10回の日記を書く',
    shareText: '10回の日記を書きました！振り返りの習慣が身につきました 📝 #WorkTimeTracker #振り返り',
    xpReward: 75
  },
  {
    id: 'goal_achiever',
    name: '目標達成者',
    description: '初めての目標を達成しました',
    icon: '🎯',
    rarity: 'rare',
    category: 'achievement',
    unlockCondition: '初めての目標を達成する',
    shareText: '初めての目標を達成しました！設定した目標をクリア 🎯 #WorkTimeTracker #目標達成',
    xpReward: 100
  },
  {
    id: 'early_bird_special',
    name: '早起きの達人',
    description: '朝6時前に作業を開始しました',
    icon: '🌅',
    rarity: 'rare',
    category: 'special',
    unlockCondition: '朝6時前に作業を開始する',
    shareText: '朝6時前に作業を開始しました！早起きは三文の徳 🌅 #WorkTimeTracker #早起き',
    xpReward: 50
  },
  {
    id: 'night_owl_special',
    name: '夜型の達人',
    description: '夜22時以降に作業を開始しました',
    icon: '🦉',
    rarity: 'rare',
    category: 'special',
    unlockCondition: '夜22時以降に作業を開始する',
    shareText: '夜22時以降に作業を開始しました！夜型の集中力 🦉 #WorkTimeTracker #夜型',
    xpReward: 50
  },
  {
    id: 'perfect_day',
    name: '完璧な一日',
    description: '1日で8時間の作業を記録しました',
    icon: '⭐',
    rarity: 'epic',
    category: 'special',
    unlockCondition: '1日で8時間の作業を記録する',
    shareText: '1日で8時間の作業を記録しました！完璧な一日でした ⭐ #WorkTimeTracker #完璧な一日',
    xpReward: 150
  }
];

// バッジのレアリティ別色
export const BADGE_RARITY_COLORS = {
  common: '#95a5a6',
  rare: '#3498db',
  epic: '#9b59b6',
  legendary: '#f39c12'
};

// バッジのレアリティ別グラデーション
export const BADGE_RARITY_GRADIENTS = {
  common: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
  rare: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
  epic: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
  legendary: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
};
