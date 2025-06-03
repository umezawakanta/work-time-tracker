export interface User {
  id: string;
  _id?: string; // MongoDB ID
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  isAdmin?: boolean; // 管理者フラグを追加
  hasActiveSubscription?: boolean; // サブスクリプション状態
  trialActivated?: boolean; // トライアル状態
  trialExpiryDate?: string; // トライアル期限日
  createdAt?: Date;
  updatedAt?: Date;
}
