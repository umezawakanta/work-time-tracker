import { useState, useEffect } from 'react';
import { checkAuth, getUserProfile } from '@/services/api/authApi';
import { User } from '@/types';

export function useAuthStatus() {  // 関数名も変更
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // 認証状態の確認
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus);

        // 認証されている場合はユーザープロファイルを取得
        if (authStatus) {
          const profile = await getUserProfile();
          setUser(profile.user);
          
          // 管理者は常にサブスクリプション有効として扱う
          // または、サブスクリプションが実際に有効なユーザー
          setIsSubscribed(profile.user.isAdmin || profile.subscription?.isActive || false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  return { user, isAuthenticated, isSubscribed, isLoading };
}