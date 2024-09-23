// utils/dateUtils.ts

/**
 * 日付をYYYY-MM-DD形式の文字列に変換します。
 * @param date - 変換する日付
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 時刻をHH:MM形式の文字列に変換します。
 * @param date - 変換する日付
 * @returns HH:MM形式の文字列
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 2つの日時の間の経過時間を計算します。
 * @param start - 開始日時
 * @param end - 終了日時
 * @returns 経過時間（分）
 */
export function calculateDuration(start: Date, end: Date): number {
  const durationMs = end.getTime() - start.getTime();
  return Math.round(durationMs / (1000 * 60));
}

/**
 * 分を時間と分に変換します。
 * @param minutes - 合計分数
 * @returns 時間と分のオブジェクト
 */
export function minutesToHoursAndMinutes(minutes: number): { hours: number; minutes: number } {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return { hours, minutes: remainingMinutes };
}

/**
 * 文字列をDate型に変換します。
 * @param dateString - YYYY-MM-DD形式の日付文字列
 * @param timeString - HH:MM形式の時刻文字列
 * @returns Date型のオブジェクト
 */
export function parseDateTime(dateString: string, timeString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * 日付を日本語形式（YYYY年MM月DD日）に変換します。
 * @param date - 変換する日付
 * @returns 日本語形式の日付文字列
 */
export function formatDateJapanese(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * 2つの日付の間の日数を計算します。
 * @param start - 開始日
 * @param end - 終了日
 * @returns 日数
 */
export function calculateDaysBetween(start: Date, end: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // 1日のミリ秒数
  const diffDays = Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay));
  return diffDays;
}

/**
 * 指定された日数を日付に加算します。
 * @param date - 基準日
 * @param days - 加算する日数
 * @returns 新しい日付
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}時間`);
  if (minutes > 0) parts.push(`${minutes}分`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}秒`);

  return parts.join(' ');
}