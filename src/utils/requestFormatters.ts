// 更新要望・不具合報告のコンテンツフォーマット用ユーティリティ

export interface UpdateRequestData {
  title: string;
  content: string;
  category: string;
  priority: string;
}

export interface BugReportData {
  title: string;
  content: string;
  category: string;
  severity: string;
  steps: string;
  expectedBehavior: string;
  actualBehavior: string;
}

// 更新要望カテゴリラベルのマッピング
export const UPDATE_REQUEST_CATEGORY_LABELS = {
  ui: 'UI/UX改善',
  feature: '新機能追加',
  performance: 'パフォーマンス改善',
  bugfix: 'バグ修正',
  accessibility: 'アクセシビリティ',
  other: 'その他',
} as const;

// 不具合報告カテゴリラベルのマッピング
export const BUG_REPORT_CATEGORY_LABELS = {
  ui: 'UI/UX問題',
  functionality: '機能不具合',
  performance: 'パフォーマンス問題',
  data: 'データ関連',
  login: 'ログイン・認証',
  api: 'API関連',
  other: 'その他',
} as const;

// 優先度ラベルのマッピング
const PRIORITY_LABELS = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
} as const;

// 重要度ラベルのマッピング
const SEVERITY_LABELS = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '緊急',
} as const;

/**
 * 更新要望のコンテンツをフォーマットする
 */
export const formatUpdateRequestContent = (data: UpdateRequestData): string => {
  const categoryLabel = UPDATE_REQUEST_CATEGORY_LABELS[data.category as keyof typeof UPDATE_REQUEST_CATEGORY_LABELS] || data.category;
  const priorityLabel = PRIORITY_LABELS[data.priority as keyof typeof PRIORITY_LABELS] || data.priority;
  
  return `**カテゴリ:** ${categoryLabel}
**優先度:** ${priorityLabel}

**詳細内容:**
${data.content}`;
};

/**
 * 不具合報告のコンテンツをフォーマットする
 */
export const formatBugReportContent = (data: BugReportData): string => {
  const categoryLabel = BUG_REPORT_CATEGORY_LABELS[data.category as keyof typeof BUG_REPORT_CATEGORY_LABELS] || data.category;
  const severityLabel = SEVERITY_LABELS[data.severity as keyof typeof SEVERITY_LABELS] || data.severity;
  
  return `**カテゴリ:** ${categoryLabel}
**重要度:** ${severityLabel}

**再現手順:**
${data.steps || '記載なし'}

**期待される動作:**
${data.expectedBehavior || '記載なし'}

**実際の動作:**
${data.actualBehavior || '記載なし'}

**詳細説明:**
${data.content}`;
};

/**
 * 更新要望のタグを取得する
 */
export const getUpdateRequestTags = (): string[] => {
  return ['更新要望', '改善提案', 'フィードバック'];
};

/**
 * 不具合報告のタグを取得する
 */
export const getBugReportTags = (): string[] => {
  return ['不具合報告', 'バグ', 'エラー'];
};

/**
 * 更新要望のタイトルをフォーマットする
 */
export const formatUpdateRequestTitle = (title: string): string => {
  return `[更新要望] ${title}`;
};

/**
 * 不具合報告のタイトルをフォーマットする
 */
export const formatBugReportTitle = (title: string): string => {
  return `[不具合報告] ${title}`;
};

/**
 * 更新要望のカテゴリ配列を取得する
 */
export const getUpdateRequestCategories = () => {
  return Object.entries(UPDATE_REQUEST_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
};

/**
 * 不具合報告のカテゴリ配列を取得する
 */
export const getBugReportCategories = () => {
  return Object.entries(BUG_REPORT_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
};

/**
 * メモ機能から除外するカテゴリの定数
 */
export const EXCLUDED_MEMO_CATEGORIES = [
  'エラー報告',        // "Error report" - synonym for bug report
  '更新リクエスト',    // "Update request" - user input variation
  '更新要望',         // "Update demand/request" - synonym for update request
  '要望、リクエスト',  // "Demand, request" - legacy/combined term
  '不具合報告',        // "Bug report" - standard term
  'バグ報告',         // "Bug report" - synonym for 不具合報告
  '改善要望',         // "Improvement request" - related category
  'フィードバック'     // "Feedback" - general feedback category
];
