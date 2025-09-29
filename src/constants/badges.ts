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
    id: 'work_streak_30',
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
    id: 'early_bird',
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
    id: 'night_owl',
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
