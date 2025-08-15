/**
 * メール通知設定の型定義
 */

export interface NotificationSettings {
  id?: string;
  userId: string;
  enabled: boolean;
  emailAddress: string;

  // メールサービス設定（ユーザーごと）
  emailService?: 'gmail' | 'hotmail' | 'yahoo' | 'outlook' | 'custom';
  emailUser?: string; // 送信元メールアドレス
  emailPass?: string; // アプリパスワード（暗号化して保存）
  smtpHost?: string; // カスタムSMTPホスト
  smtpPort?: number; // カスタムSMTPポート
  smtpSecure?: boolean; // SSL/TLS使用

  // 通知タイミング設定
  notifyOnTaskAdd: boolean;
  notifyOnTaskComplete: boolean;
  notifyOnDeadlineApproaching: boolean;
  deadlineWarningHours: number; // 何時間前に通知するか（デフォルト: 24）

  // 定期レポート設定
  dailyDigest: boolean;
  dailyDigestTime: string; // HH:MM形式（例: "09:00"）
  weeklyReport: boolean;
  weeklyReportDay: number; // 0=日曜日, 6=土曜日
  monthlyReport: boolean;
  monthlyReportDay: number; // 1-31

  // 通知フィルター
  minPriorityForNotification: number; // この優先度以上のタスクのみ通知（1-5）
  notificationCategories: string[]; // 通知対象のカテゴリー

  // その他の設定
  language: 'ja' | 'en';
  timezone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailNotification {
  id?: string;
  userId: string;
  type: NotificationType;
  recipient: string;
  subject: string;
  content: string;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  metadata?: Record<string, any>;
}

export type NotificationType =
  | 'task_added'
  | 'task_completed'
  | 'deadline_approaching'
  | 'daily_digest'
  | 'weekly_report'
  | 'monthly_report'
  | 'custom';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;
}

// デフォルト設定
export const DEFAULT_NOTIFICATION_SETTINGS: Partial<NotificationSettings> = {
  enabled: false,
  notifyOnTaskAdd: true,
  notifyOnTaskComplete: false,
  notifyOnDeadlineApproaching: true,
  deadlineWarningHours: 24,
  dailyDigest: false,
  dailyDigestTime: '09:00',
  weeklyReport: false,
  weeklyReportDay: 1, // Monday
  monthlyReport: false,
  monthlyReportDay: 1,
  minPriorityForNotification: 3,
  notificationCategories: [],
  language: 'ja',
  timezone: 'Asia/Tokyo',
};
