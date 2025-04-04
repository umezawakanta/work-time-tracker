/**
 * 日付と時刻を指定されたロケールと書式でフォーマットします。
 * @param date - フォーマットする日付（Date オブジェクトまたは ISO 8601 文字列）
 * @param locale - ロケール（例: 'ja-JP', 'en-US'）
 * @param options - Intl.DateTimeFormatOptions オブジェクト
 * @returns フォーマットされた日付と時刻の文字列
 */
export function formatDateAndTime(
  date: Date | string,
  locale: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * 時刻をHH:MM形式の文字列に変換します。
 * @param date - 変換する日付
 * @param locale - ロケール（例: 'ja-JP', 'en-US'）
 * @returns HH:MM形式の文字列
 */
export function formatTime(date: Date, locale: string): string {
  return formatDateAndTime(date, locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
export function minutesToHoursAndMinutes(minutes: number): {
  hours: number;
  minutes: number;
} {
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
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = timeString.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * 日付を指定されたロケールの形式に変換します。
 * @param date - 変換する日付
 * @param locale - ロケール（例: 'ja-JP', 'en-US'）
 * @returns ロケールに応じた形式の日付文字列
 */
export function formatDate(date: Date, locale: string): string {
  return formatDateAndTime(date, locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 2つの日付の間の日数を計算します。
 * @param start - 開始日
 * @param end - 終了日
 * @returns 日数
 */
export function calculateDaysBetween(start: Date, end: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // 1日のミリ秒数
  const diffDays = Math.round(
    Math.abs((start.getTime() - end.getTime()) / oneDay)
  );
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

/**
 * 秒数を時間、分、秒の文字列に変換します。
 * @param seconds - 合計秒数
 * @returns フォーマットされた時間文字列
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = []; // 型を明示的に宣言
  if (hours > 0) parts.push(`${hours}時間`);
  if (minutes > 0) parts.push(`${minutes}分`);
  if (remainingSeconds > 0 || parts.length === 0)
    parts.push(`${remainingSeconds}秒`);

  return parts.join(" ");
}

/**
 * 数値型の日付を "YYYY/MM/DD" 形式の文字列に変換します
 */
export const convertNumericToDateString = (numericDate: number): string => {
  const dateStr = String(numericDate);
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  }
  return dateStr;
};

/**
 * 日付から年月のフォーマット（YYYY/MM）を取得
 */
export const getYearMonth = (date: number): string => {
  const dateStr = String(date);
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}`;
  }
  return '';
};

/**
 * 引き落とし日のフォーマット関数
 * 数値型や文字列型の日付を "YYYY/MM/DD" 形式に変換します
 */
export const formatBillingDate = (date: number | string | null | undefined): string => {
  if (date == null) return "";
  
  // 数値または文字列を文字列に変換
  const dateStr = String(date);
  
  // 日付形式の判定
  if (dateStr.length === 8 && !dateStr.includes('/')) {
    // YYYYMMDDフォーマットの場合 (例: 20240115)
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  } else if (dateStr.includes('/')) {
    // 既にスラッシュが含まれている場合はそのまま返す
    return dateStr;
  }

  // その他の場合は単純に文字列化
  return dateStr;
};

/**
 * 文字列形式の日付を数値型に変換します
 * 例: "2024/01/15" → 20240115
 */
export const convertDateStringToNumber = (dateStr: string): number => {
  // スラッシュや他の区切り文字を削除して数値に変換
  return parseInt(dateStr.replace(/[/-]/g, ''), 10);
};

/**
 * 日付が "YYYY/MM/DD" 形式かどうかを検証します
 */
export const isValidDateFormat = (date: string): boolean => {
  const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
  return datePattern.test(date);
};

/**
 * 数値またはフォーマットされた日付文字列かをチェックします
 */
export const isValidBillingDate = (date: string | number): boolean => {
  if (typeof date === 'number') {
    // 数値型の場合、8桁であればOK
    return String(date).length === 8;
  }
  
  // 文字列の場合、YYYY/MM/DD形式かチェック
  return isValidDateFormat(date);
};

/**
 * 日付文字列をフォーマットして表示用の文字列に変換します
 */
export const formatDisplayDate = (dateStr: string): string => {
  // YYYY/MM/DD形式の場合はそのまま返す
  if (isValidDateFormat(dateStr)) {
    return dateStr;
  }
  
  // 数値文字列の場合（例：20240115）
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  }
  
  // 他の形式（例：2024-01-15）
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr.replace(/-/g, '/');
  }
  
  // その他の場合はそのまま返す
  return dateStr;
};