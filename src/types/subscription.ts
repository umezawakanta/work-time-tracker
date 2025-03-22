export interface Subscription {
  _id: string;
  name: string;
  billingDate: string;
  type: string;
  amount: number;
  paymentMethod?: string; // "credit", "bank", "paypal", "apple", "google"
  bankAccount?: string | null; // 銀行口座ID
  checkedMonths?: string[]; // 確認済み月のリスト ["2024/01", "2024/02", ...]
}