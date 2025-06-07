import { createContext } from 'react';
import { User } from '@/types';

interface AuthContextType {
  // 基本認証状態
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;

  // 認証アクション
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  // セッション管理
  refreshAuth: () => Promise<void>;
  sessionExpired: boolean;

  // アカウント管理
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;

  // セキュリティ機能
  enableTwoFactor: () => Promise<string>; // QRコードURL
  verifyTwoFactor: (code: string) => Promise<void>;
  disableTwoFactor: (code: string) => Promise<void>;

  // アクティビティ監視
  lastActivity: Date | null;
  sessionTimeout: number;
  isOnline: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export type { AuthContextType };
