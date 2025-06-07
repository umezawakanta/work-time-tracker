export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
  username?: string;
  isAdmin?: boolean;
  uid?: string; // Firebase UID
  displayName?: string; // 表示名
  loginCount?: number;
  subscriptionStatus?: 'active' | 'canceled' | 'expired' | 'none';
  hasActiveSubscription?: boolean; // アクティブなサブスクリプション状態
  isPremium?: boolean; // プレミアムユーザー状態
  trialActivated?: boolean; // トライアル有効化状態
  trialExpiryDate?: string; // トライアル有効期限
  lastLoginAt?: string; // 最終ログイン日時
}
