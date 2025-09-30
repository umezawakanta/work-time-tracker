// バッジの定数データ

import { Badge } from '../types/badge';

// 型定義の確認用 - 実際の型定義と一致していることを確認
type BadgeCategory = 'registration' | 'achievement' | 'milestone' | 'special' | 'daily' | 'work' | 'streak' | 'timing' | 'social' | 'contribution' | 'writing' | 'reorder';

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
  },
  // 不具合報告関連バッジ
  {
    id: 'bug_reporter',
    name: 'バグハンター',
    description: '初めての不具合を報告しました',
    icon: '🐛',
    rarity: 'common',
    category: 'contribution',
    unlockCondition: '初めての不具合を報告する',
    shareText: 'バグハンターになりました！初めての不具合を報告しました 🐛 #WorkTimeTracker #バグ報告',
    xpReward: 30
  },
  {
    id: 'bug_hunter',
    name: 'バグハンター',
    description: '5個の不具合を報告しました',
    icon: '🔍',
    rarity: 'rare',
    category: 'contribution',
    unlockCondition: '5個の不具合を報告する',
    shareText: 'バグハンターになりました！5個の不具合を報告しました 🔍 #WorkTimeTracker #バグハンター',
    xpReward: 100
  },
  {
    id: 'feature_advocate',
    name: '機能提案者',
    description: '初めての機能提案をしました',
    icon: '💡',
    rarity: 'common',
    category: 'contribution',
    unlockCondition: '初めての機能提案をする',
    shareText: '機能提案者になりました！初めての機能提案をしました 💡 #WorkTimeTracker #機能提案',
    xpReward: 40
  },
  {
    id: 'improvement_suggester',
    name: '改善提案者',
    description: '初めての改善提案をしました',
    icon: '⚡',
    rarity: 'common',
    category: 'contribution',
    unlockCondition: '初めての改善提案をする',
    shareText: '改善提案者になりました！初めての改善提案をしました ⚡ #WorkTimeTracker #改善提案',
    xpReward: 50
  },
  {
    id: 'community_helper',
    name: 'コミュニティヘルパー',
    description: '10個の報告・提案をしました',
    icon: '🤝',
    rarity: 'epic',
    category: 'contribution',
    unlockCondition: '10個の報告・提案をする',
    shareText: 'コミュニティヘルパーになりました！10個の報告・提案をしました 🤝 #WorkTimeTracker #コミュニティ',
    xpReward: 200
  },
  {
    id: 'quality_guardian',
    name: '品質ガーディアン',
    description: '25個の報告・提案をしました',
    icon: '🛡️',
    rarity: 'legendary',
    category: 'contribution',
    unlockCondition: '25個の報告・提案をする',
    shareText: '品質ガーディアンになりました！25個の報告・提案をしました 🛡️ #WorkTimeTracker #品質ガーディアン',
    xpReward: 500
  },
  // メモ投稿関連バッジ
  {
    id: 'first_memo',
    name: '初回メモ投稿者',
    description: '初めてのメモを投稿しました',
    icon: '📝',
    rarity: 'common',
    category: 'writing',
    unlockCondition: '初めてのメモを投稿する',
    shareText: '初回メモ投稿者になりました！初めてのメモを投稿しました 📝 #WorkTimeTracker #メモ投稿',
    xpReward: 25
  },
  {
    id: 'memo_writer',
    name: 'メモライター',
    description: '10個のメモを投稿しました',
    icon: '✍️',
    rarity: 'rare',
    category: 'writing',
    unlockCondition: '10個のメモを投稿する',
    shareText: 'メモライターになりました！10個のメモを投稿しました ✍️ #WorkTimeTracker #メモライター',
    xpReward: 100
  },
  {
    id: 'memo_master',
    name: 'メモマスター',
    description: '50個のメモを投稿しました',
    icon: '📚',
    rarity: 'epic',
    category: 'writing',
    unlockCondition: '50個のメモを投稿する',
    shareText: 'メモマスターになりました！50個のメモを投稿しました 📚 #WorkTimeTracker #メモマスター',
    xpReward: 300
  },
  {
    id: 'memo_legend',
    name: 'メモレジェンド',
    description: '100個のメモを投稿しました',
    icon: '🏆',
    rarity: 'legendary',
    category: 'writing',
    unlockCondition: '100個のメモを投稿する',
    shareText: 'メモレジェンドになりました！100個のメモを投稿しました 🏆 #WorkTimeTracker #メモレジェンド',
    xpReward: 500
  },
  {
    id: 'daily_writer',
    name: '日記ライター',
    description: '7日連続でメモを投稿しました',
    icon: '📅',
    rarity: 'rare',
    category: 'writing',
    unlockCondition: '7日連続でメモを投稿する',
    shareText: '日記ライターになりました！7日連続でメモを投稿しました 📅 #WorkTimeTracker #日記ライター',
    xpReward: 150
  },
  {
    id: 'thought_leader',
    name: '思考のリーダー',
    description: '公開メモを10個投稿しました',
    icon: '💭',
    rarity: 'epic',
    category: 'writing',
    unlockCondition: '公開メモを10個投稿する',
    shareText: '思考のリーダーになりました！公開メモを10個投稿しました 💭 #WorkTimeTracker #思考のリーダー',
    xpReward: 200
  },
  // 収入・支出関連バッジ
  {
    id: 'first_income',
    name: '初回収入記録',
    description: '初めての収入を記録しました',
    icon: '💰',
    rarity: 'common',
    category: 'finance',
    unlockCondition: '初めての収入を記録する',
    shareText: '初回収入記録を達成しました！お金の管理を始めます 💰 #WorkTimeTracker #収入記録',
    xpReward: 30
  },
  {
    id: 'first_expense',
    name: '初回支出記録',
    description: '初めての支出を記録しました',
    icon: '💸',
    rarity: 'common',
    category: 'finance',
    unlockCondition: '初めての支出を記録する',
    shareText: '初回支出記録を達成しました！支出管理を始めます 💸 #WorkTimeTracker #支出記録',
    xpReward: 25
  },
  {
    id: 'income_tracker',
    name: '収入トラッカー',
    description: '10回の収入を記録しました',
    icon: '📈',
    rarity: 'rare',
    category: 'finance',
    unlockCondition: '10回の収入を記録する',
    shareText: '収入トラッカーになりました！10回の収入を記録しました 📈 #WorkTimeTracker #収入管理',
    xpReward: 100
  },
  {
    id: 'expense_tracker',
    name: '支出トラッカー',
    description: '10回の支出を記録しました',
    icon: '📉',
    rarity: 'rare',
    category: 'finance',
    unlockCondition: '10回の支出を記録する',
    shareText: '支出トラッカーになりました！10回の支出を記録しました 📉 #WorkTimeTracker #支出管理',
    xpReward: 100
  },
  {
    id: 'financial_master',
    name: '財務マスター',
    description: '50回の収支を記録しました',
    icon: '🏦',
    rarity: 'epic',
    category: 'finance',
    unlockCondition: '50回の収支を記録する',
    shareText: '財務マスターになりました！50回の収支を記録しました 🏦 #WorkTimeTracker #財務管理',
    xpReward: 300
  },
  {
    id: 'big_earner',
    name: '大収入者',
    description: '10万円以上の収入を記録しました',
    icon: '💎',
    rarity: 'epic',
    category: 'finance',
    unlockCondition: '10万円以上の収入を記録する',
    shareText: '大収入者になりました！10万円以上の収入を記録しました 💎 #WorkTimeTracker #大収入',
    xpReward: 250
  },
  {
    id: 'budget_conscious',
    name: '予算意識者',
    description: '支出を10回記録しました',
    icon: '🎯',
    rarity: 'rare',
    category: 'finance',
    unlockCondition: '支出を10回記録する',
    shareText: '予算意識者になりました！支出管理が身についています 🎯 #WorkTimeTracker #予算管理',
    xpReward: 80
  },
  {
    id: 'financial_analyst',
    name: '財務アナリスト',
    description: '100回の収支を記録しました',
    icon: '📊',
    rarity: 'legendary',
    category: 'finance',
    unlockCondition: '100回の収支を記録する',
    shareText: '財務アナリストになりました！100回の収支を記録しました 📊 #WorkTimeTracker #財務分析',
    xpReward: 500
  },
  {
    id: 'money_manager',
    name: 'マネーマネージャー',
    description: '月間収支を5回記録しました',
    icon: '💼',
    rarity: 'epic',
    category: 'finance',
    unlockCondition: '月間収支を5回記録する',
    shareText: 'マネーマネージャーになりました！月間収支を5回記録しました 💼 #WorkTimeTracker #マネー管理',
    xpReward: 200
  },
  {
    id: 'financial_planner',
    name: 'ファイナンシャルプランナー',
    description: '年間収支を記録しました',
    icon: '📋',
    rarity: 'legendary',
    category: 'finance',
    unlockCondition: '年間収支を記録する',
    shareText: 'ファイナンシャルプランナーになりました！年間収支を記録しました 📋 #WorkTimeTracker #ファイナンシャルプランニング',
    xpReward: 400
  },
  // いいね関連バッジ
  {
    id: 'first_like',
    name: '初回いいね',
    description: '初めてのいいねを獲得しました',
    icon: '👍',
    rarity: 'common',
    category: 'social',
    unlockCondition: '初めてのいいねを獲得する',
    shareText: '初回いいねを獲得しました！誰かがあなたのメモを気に入ってくれました 👍 #WorkTimeTracker #いいね',
    xpReward: 20
  },
  {
    id: 'liked_writer',
    name: '人気ライター',
    description: '10個のいいねを獲得しました',
    icon: '❤️',
    rarity: 'rare',
    category: 'social',
    unlockCondition: '10個のいいねを獲得する',
    shareText: '人気ライターになりました！10個のいいねを獲得しました ❤️ #WorkTimeTracker #人気ライター',
    xpReward: 100
  },
  {
    id: 'popular_author',
    name: '人気作家',
    description: '50個のいいねを獲得しました',
    icon: '🌟',
    rarity: 'epic',
    category: 'social',
    unlockCondition: '50個のいいねを獲得する',
    shareText: '人気作家になりました！50個のいいねを獲得しました 🌟 #WorkTimeTracker #人気作家',
    xpReward: 300
  },
  {
    id: 'viral_creator',
    name: 'バイラルクリエイター',
    description: '100個のいいねを獲得しました',
    icon: '🔥',
    rarity: 'legendary',
    category: 'social',
    unlockCondition: '100個のいいねを獲得する',
    shareText: 'バイラルクリエイターになりました！100個のいいねを獲得しました 🔥 #WorkTimeTracker #バイラル',
    xpReward: 500
  },
  {
    id: 'like_magnet',
    name: 'いいねマグネット',
    description: '1つのメモで10個のいいねを獲得しました',
    icon: '🧲',
    rarity: 'epic',
    category: 'social',
    unlockCondition: '1つのメモで10個のいいねを獲得する',
    shareText: 'いいねマグネットになりました！1つのメモで10個のいいねを獲得しました 🧲 #WorkTimeTracker #いいねマグネット',
    xpReward: 200
  },
  {
    id: 'community_favorite',
    name: 'コミュニティの寵児',
    description: '5つのメモでそれぞれ5個以上のいいねを獲得しました',
    icon: '👑',
    rarity: 'legendary',
    category: 'social',
    unlockCondition: '5つのメモでそれぞれ5個以上のいいねを獲得する',
    shareText: 'コミュニティの寵児になりました！5つのメモでそれぞれ5個以上のいいねを獲得しました 👑 #WorkTimeTracker #コミュニティ',
    xpReward: 400
  },
  // 並べ替え関連のバッジ
  {
    id: 'first_reorder',
    name: '初めての並べ替え',
    description: '初めて機能の並べ替えを行いました',
    icon: '🔄',
    rarity: 'common',
    category: 'reorder',
    unlockCondition: '初めて機能の並べ替えを行う',
    shareText: '初めて機能の並べ替えを行いました！カスタマイズの第一歩です 🔄 #WorkTimeTracker #カスタマイズ',
    xpReward: 15
  },
  {
    id: 'reorder_5',
    name: '並べ替えマスター',
    description: '5回機能の並べ替えを行いました',
    icon: '📋',
    rarity: 'common',
    category: 'reorder',
    unlockCondition: '5回機能の並べ替えを行う',
    shareText: '5回機能の並べ替えを行いました！カスタマイズが上手になってきました 📋 #WorkTimeTracker #カスタマイズ',
    xpReward: 30
  },
  {
    id: 'reorder_10',
    name: '並べ替えエキスパート',
    description: '10回機能の並べ替えを行いました',
    icon: '⚙️',
    rarity: 'rare',
    category: 'reorder',
    unlockCondition: '10回機能の並べ替えを行う',
    shareText: '10回機能の並べ替えを行いました！カスタマイズのエキスパートです ⚙️ #WorkTimeTracker #カスタマイズ',
    xpReward: 60
  },
  {
    id: 'reorder_25',
    name: '並べ替えの達人',
    description: '25回機能の並べ替えを行いました',
    icon: '🎯',
    rarity: 'epic',
    category: 'reorder',
    unlockCondition: '25回機能の並べ替えを行う',
    shareText: '25回機能の並べ替えを行いました！並べ替えの達人になりました 🎯 #WorkTimeTracker #カスタマイズ',
    xpReward: 120
  },
  {
    id: 'reorder_streak_3',
    name: '連続並べ替え',
    description: '3日連続で機能の並べ替えを行いました',
    icon: '🔥',
    rarity: 'rare',
    category: 'reorder',
    unlockCondition: '3日連続で機能の並べ替えを行う',
    shareText: '3日連続で機能の並べ替えを行いました！カスタマイズの習慣が身につきました 🔥 #WorkTimeTracker #カスタマイズ',
    xpReward: 80
  },
  {
    id: 'perfect_reorder',
    name: '完璧な並べ替え',
    description: 'すべての機能を並べ替えました',
    icon: '✨',
    rarity: 'epic',
    category: 'reorder',
    unlockCondition: 'すべての機能を並べ替える',
    shareText: '完璧な並べ替えを達成しました！すべての機能をカスタマイズしました ✨ #WorkTimeTracker #カスタマイズ',
    xpReward: 100
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
