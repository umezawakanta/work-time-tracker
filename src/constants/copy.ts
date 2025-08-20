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

export const TRUST_COPY = {
  line: '通信は暗号化。データの第三者提供は一切ありません。',
};

export type TrustCopy = typeof TRUST_COPY;

export const FAQ_COPY = {
  items: [
    {
      q: 'AIに入力したデータは学習に使われますか？',
      a: 'いいえ。入力内容はモデル学習には利用しません。AIリクエストは必要最小限のデータのみ送信し、保存が必要な場合はローカル（IndexedDB）に限定します。',
    },
    {
      q: 'セキュリティとプライバシーはどう担保していますか？',
      a: '通信はTLSで暗号化。サーバー側では最小権限とアクセス制御を適用し、APIキーは環境変数で安全に管理します。第三者への提供は一切ありません。',
    },
    {
      q: '無料でどこまで使えますか？',
      a: '基本的なタスク管理・集中タイマー・週次レポート・AI提案（ローカルフォールバック）は無料で利用できます。外部AI APIを使用する高度機能はキー設定が必要です。',
    },
  ],
} as const;

export type FaqCopy = typeof FAQ_COPY;

export const WEEKLY_REPORT_COPY = {
  title: '週次レポート',
  description: '1週間の活動を自動集計。習慣スコアと改善点を提示し、翌週の時間配分を最適化します。',
  points: [
    '完了タスクの傾向と集中時間の可視化',
    '習慣スコア（0-100）で定着度を把握',
    '次週に向けた具体的な改善提案',
  ],
  placeholderAlt: '週次レポートのプレビュー',
} as const;

export type WeeklyReportCopy = typeof WEEKLY_REPORT_COPY;

export const USER_STORIES_COPY = {
  title: 'ユーザー事例',
  items: [
    {
      name: '健太',
      role: 'ソフトウェアエンジニア',
      quote: '毎朝のAI提案で迷いが消え、深い集中が増えました。',
      result: '週次レポートの改善提案を取り入れ、1ヶ月でアウトプット量+38%。',
    },
    {
      name: '美咲',
      role: '大学院生',
      quote: '研究と私生活のバランスが整い、締切前でも落ち着いて取り組めます。',
      result: '集中タイマーで学習時間が安定。計画倒れが激減しました。',
    },
  ],
} as const;

export type UserStoriesCopy = typeof USER_STORIES_COPY;
