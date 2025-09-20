// アプリケーションのバージョン情報
export const APP_VERSION = "1.0.2";

// 更新履歴の型定義
export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  type: 'bugfix' | 'feature' | 'improvement' | 'breaking';
}

// 更新履歴
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.2",
    date: "2025-01-21",
    changes: [
      "おしごと記録の編集・削除時の即時反映問題を修正",
      "カレンダーと一覧表示の両方が即座に更新されるように改善",
      "非同期処理の適切な待機によりデータ整合性を向上",
      "WorkRecordsComponentの自動更新機能を追加"
    ],
    type: "bugfix"
  },
  {
    version: "1.0.1",
    date: "2025-01-21",
    changes: [
      "エラーハンドリング機能の改善",
      "APIコールのセキュリティ強化（クエリパラメータの適切なエンコーディング）",
      "コードの最適化（動的インポートの削除、型安全性の向上）",
      "SimpleErrorReportingModalの堅牢性向上"
    ],
    type: "bugfix"
  },
  {
    version: "1.0.0",
    date: "2025-01-20",
    changes: [
      "初回リリース",
      "勤務時間追跡機能",
      "プロジェクト管理機能",
      "日記・メモ機能",
      "タイマー機能",
      "エラー報告機能"
    ],
    type: "feature"
  }
];

// 最新の更新履歴を取得
export const getLatestChangelog = (): ChangelogEntry | undefined => {
  return CHANGELOG[0];
};

// 指定されたバージョンの更新履歴を取得
export const getChangelogByVersion = (version: string): ChangelogEntry | undefined => {
  return CHANGELOG.find(entry => entry.version === version);
};

// 更新履歴の表示用テキストを生成
export const formatChangelogEntry = (entry: ChangelogEntry): string => {
  const typeLabels = {
    bugfix: "🐛 バグ修正",
    feature: "✨ 新機能",
    improvement: "⚡ 改善",
    breaking: "💥 破壊的変更"
  };

  return `## ${entry.version} (${entry.date})
${typeLabels[entry.type]}

${entry.changes.map(change => `- ${change}`).join('\n')}`;
};
