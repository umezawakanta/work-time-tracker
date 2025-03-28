export interface Subscription {
  _id: string;
  name: string;
  billingDate: string;
  type: string;
  amount: number;
  paymentMethod?: string; // "credit", "bank", "paypal", "apple", "google"
  bankAccount?: string | null; // 銀行口座ID
  checkedMonths?: string[]; // 確認済み月のリスト ["2024/01", "2024/02", ...]
  isActive: boolean;
  expiresAt: string; // ISO形式の日付文字列
  // 以下のプロパティを追加
  billingCycle?: string; // "monthly", "yearly", "quarterly" など
  currency?: string; // "JPY", "USD" など
  autoRenew?: boolean; // 自動更新するかどうか
  notificationEnabled?: boolean; // 通知を有効にするかどうか
  notificationDays?: number; // 更新前の通知日数
  category?: string; // カテゴリ（動画ストリーミング、音楽など）
  notes?: string; // メモ
  url?: string; // サービスのURL
  startDate?: string; // 契約開始日
}