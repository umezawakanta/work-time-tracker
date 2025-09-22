// アプリケーションのバージョン情報
export const APP_VERSION = "1.0.10";

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
    version: "1.0.10",
    date: "2024-12-22",
    changes: [
      "セキュリティ修正：URL部分文字列サニタイゼーションの問題を解決",
      "CodeQLのHighレベルセキュリティアラートを修正",
      "errorMessage.includes('api.github.com')を正規表現に変更",
      "より安全なURL検証方法を実装",
      "セキュリティポリシーファイル（SECURITY.md）を追加",
      "GitHubのセキュリティ機能との連携を強化"
    ],
    type: "bugfix"
  },
  {
    version: "1.0.9",
    date: "2024-12-22",
    changes: [
      "work-records/diary APIの400エラーを修正（ログアウト後のログイン時）",
      "createUserIdParam関数でのuserId検証処理を改善",
      "JWT認証のセキュリティを強化（トークン検証、有効期限チェック）",
      "認証の優先順位を修正（JWT認証を優先、フォールバック制限）",
      "型安全性の向上（JWTPayloadインターフェースの定義）",
      "コードの重複を解消（createValidatedUserIdParamヘルパー関数）",
      "APIエンドポイントでの適切なエラーレスポンス（401 Unauthorized）",
      "ランタイムエラーの防止とセキュリティ向上"
    ],
    type: "bugfix"
  },
  {
    version: "1.0.8",
    date: "2024-12-22",
    changes: [
      "APIヘルスチェック機能を追加（管理者パネルにAPI一覧タブ）",
      "全APIエンドポイントのリアルタイムヘルスチェック機能",
      "レスポンス時間とエラー率の統計表示機能",
      "APIヘルスチェック用ユーティリティ（healthCheckUtils.js）",
      "APIエンドポイント設定ファイル（api-endpoints.js）で一元管理",
      "並列実行制限の実装（最大5個まで同時実行）",
      "APIエラー件数取得の最適化（ポーリング間隔を2分に延長）",
      "ソート機能の安定性向上（同値の場合の適切な処理）",
      "マージコンフリクトの解決と変数名重複問題の修正",
      "TypeScriptの型推論エラーの修正とコード品質の向上"
    ],
    type: "feature"
  },
  {
    version: "1.0.7",
    date: "2024-12-19",
    changes: [
      "通知詳細モーダル機能を追加（通知の詳細情報表示）",
      "通知メッセージのフルテキスト表示機能（100文字で省略、続きを読むリンク）",
      "通知タイプ別のアイコンとラベル表示機能",
      "メモ関連通知のメモ表示ボタン機能",
      "共有型定義の作成（Notification型の統一）",
      "通知コンポーネントのUI/UX向上（レスポンシブデザイン、ダークモード対応）",
      "コードの保守性向上（ユーティリティ関数の統合、JSDocコメントの改善）",
      "マージコンフリクトの解決とコード品質の向上"
    ],
    type: "feature"
  },
  {
    version: "1.0.6",
    date: "2024-12-19",
    changes: [
      "シェア機能にバージョン紹介文言を追加（10種類のランダムメッセージ）",
      "Twitter用短縮テキスト生成ロジックを関数化して可読性を向上",
      "パフォーマンス最適化（不要なuseMemoを削除）",
      "コードの保守性と一貫性を改善",
      "シェアメッセージの多様性とユーザーエクスペリエンスを向上"
    ],
    type: "feature"
  },
  {
    version: "1.0.5",
    date: "2025-01-21",
    changes: [
      "更新要望送信機能を追加（専用UIとモーダル）",
      "不具合報告機能を追加（詳細な報告フォーム）",
      "メモ機能から不具合報告・更新要望関連カテゴリを分離",
      "エラーハンドリングの改善（alertから個別フィールドエラー表示に変更）",
      "カテゴリ管理の一元化とコードの重複削除",
      "フォームバリデーションの強化とユーザビリティ向上",
      "コンテンツフォーマット用ユーティリティ関数の追加",
      "コードの保守性と一貫性を大幅に改善"
    ],
    type: "feature"
  },
  {
    version: "1.0.4",
    date: "2025-01-21",
    changes: [
      "収支記録の支出登録処理の不具合を修正",
      "データベースに常に正の値で保存し、表示時にtypeに基づいて正負を決定するように改善",
      "正規表現の最適化とパフォーマンス向上",
      "環境変数アクセスの安全性向上",
      "コードの可読性と保守性を大幅に改善",
      "重複するコメントとロジックをヘルパー関数に集約"
    ],
    type: "bugfix"
  },
  {
    version: "1.0.3",
    date: "2025-01-21",
    changes: [
      "管理者お知らせ通知機能の不具合を修正",
      "データベース名の不一致による通知表示問題を解決",
      "通知作成と取得で同じデータベースにアクセスするように改善",
      "ユーザーに管理者お知らせが正しく表示されるように修正"
    ],
    type: "bugfix"
  },
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
