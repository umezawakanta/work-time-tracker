import type { Memo, User } from '../types';

// メモのタイトルを取得（タイトルがない場合は内容の最初の行を使用）
export const getMemoTitle = (memo: Memo): string => {
  if (memo.title && memo.title.trim()) {
    return memo.title;
  }
  return memo.content?.split("\n")[0]?.trim() || "無題のメモ";
};

// 日時をフォーマット
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '日付不明';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '無効な日付';
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// メモの所有者かどうかを判定
export const isMemoOwner = (memo: Memo, user: User | null): boolean => {
  if (!user) return false;
  return memo.author === user.email || memo.author === user.displayName;
};

// 公開メモの統計を取得
export const getPublicMemoCounts = (publicMemos: Memo[]) => {
  const totalMemos = publicMemos.length;
  const errorReports = publicMemos.filter(memo => memo.postType === 'error_report').length;
  const updateRequests = publicMemos.filter(memo => memo.postType === 'update_request').length;
  const generalMemos = publicMemos.filter(memo => !memo.postType || memo.postType === 'general').length;
  
  return { total: totalMemos, errorReports, updateRequests, general: generalMemos };
};

// メモのステータスを取得
export const getMemoStatus = (memo: Memo): string => {
  return memo.status || 'pending';
};

// メモのステータス表示用テキストを取得
export const getMemoStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return '保留中';
    case 'in_progress':
      return '対応中';
    case 'resolved':
      return '解決済み';
    case 'rejected':
      return '却下';
    default:
      return '不明';
  }
};

// メモのステータス表示用クラスを取得
export const getMemoStatusClass = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'in_progress':
      return 'status-in-progress';
    case 'resolved':
      return 'status-resolved';
    case 'rejected':
      return 'status-rejected';
    default:
      return 'status-unknown';
  }
};

// メモの投稿タイプ表示用テキストを取得
export const getPostTypeText = (postType: string): string => {
  switch (postType) {
    case 'error_report':
      return 'エラー報告';
    case 'update_request':
      return '更新依頼';
    case 'general':
      return '一般';
    default:
      return '不明';
  }
};

// メモの投稿タイプ表示用クラスを取得
export const getPostTypeClass = (postType: string): string => {
  switch (postType) {
    case 'error_report':
      return 'post-type-error';
    case 'update_request':
      return 'post-type-update';
    case 'general':
      return 'post-type-general';
    default:
      return 'post-type-unknown';
  }
};

// メモのタグを文字列に変換
export const tagsToString = (tags: string[]): string => {
  return tags.join(', ');
};

// 文字列をタグ配列に変換
export const stringToTags = (tagString: string): string[] => {
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

// メモの内容をプレビュー用に短縮
export const getMemoPreview = (content: string, maxLength: number = 100): string => {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...'
    : plainText;
};

// メモが最近更新されたかどうかを判定
export const isRecentlyUpdated = (memo: Memo, hours: number = 24): boolean => {
  if (!memo.updatedAt) return false;
  const updatedAt = new Date(memo.updatedAt);
  const now = new Date();
  const diffHours = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
  return diffHours <= hours;
};

// メモの優先度を取得
export const getMemoPriority = (memo: Memo): 'high' | 'medium' | 'low' => {
  if (memo.postType === 'error_report') return 'high';
  if (memo.postType === 'update_request') return 'medium';
  return 'low';
};

// メモの優先度表示用テキストを取得
export const getPriorityText = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '不明';
  }
};

// メモの優先度表示用クラスを取得
export const getPriorityClass = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return 'priority-high';
    case 'medium':
      return 'priority-medium';
    case 'low':
      return 'priority-low';
    default:
      return 'priority-unknown';
  }
};

