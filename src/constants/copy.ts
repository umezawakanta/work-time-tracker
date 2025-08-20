// Centralized marketing copy strings
// Keep UI text here to enable reuse and easy updates

export const HERO_COPY = {
  title: '人生の舵を、今日から握り直す。',
  subtitle: 'AIパーソナル秘書が予定・集中・習慣を一元管理',
  ctaPrimary: '今すぐ始める',
  ctaSecondary: '3分でセットアップ',
};

export type HeroCopy = typeof HERO_COPY;

export const BENEFITS_COPY = {
  items: [
    {
      key: 'priorityTask',
      title: '最重要タスク提案',
      description: '履歴と目標から「今日の一歩」をAIが提案。迷わず着手できます。',
    },
    {
      key: 'focusTimer',
      title: '集中タイマー',
      description: 'ポモドーロで集中と休憩を切り替え。分散を防ぎ、成果を最大化。',
    },
    {
      key: 'weeklyReport',
      title: '週次レポート',
      description: '一週間の成果・傾向・改善点を可視化し、次週の時間配分を最適化。',
    },
  ],
};

export type BenefitsCopy = typeof BENEFITS_COPY;

export const HOW_IT_WORKS_COPY = {
  title: 'How It Works',
  items: [
    {
      key: 'goal',
      title: '目標を定める',
      description: '達成したいゴールを明確化。優先度と締切で実行可能に。',
    },
    {
      key: 'plan',
      title: '計画に落とす',
      description: 'AIが時間配分とタスクを提案。今日の行動計画へ。',
    },
    {
      key: 'execute',
      title: '実行・振り返り',
      description: '集中タイマーで実行し、週次レポートで改善を継続。',
    },
  ],
};

export type HowItWorksCopy = typeof HOW_IT_WORKS_COPY;
