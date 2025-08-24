import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { userTrackingService } from '@/services/analytics/UserTrackingService';

/**
 * 🔍 ユーザートラッキングフック
 * 自動的にページビューやユーザー行動を記録
 */
export const useUserTracking = () => {
  const location = useLocation();
  const { user } = useAuth();

  // セッション初期化
  useEffect(() => {
    userTrackingService.initializeSession(user?.id);
  }, [user?.id]);

  // ページビュー記録
  useEffect(() => {
    const pageName = location.pathname;
    const pageTitle = document.title;
    const fullUrl = window.location.href;

    userTrackingService.trackPageView(pageName, fullUrl, pageTitle);
  }, [location]);

  // ユーザー属性更新
  useEffect(() => {
    if (user) {
      userTrackingService.updateUserAttributes({
        userId: user.id,
        role: (user as any).role || 'user',
        subscriptionPlan: (user as any).subscriptionPlan || 'free',
        preferences: (user as any).preferences,
      });
    }
  }, [user]);

  // ユーザーインタラクション記録関数を返す
  return {
    trackInteraction: userTrackingService.trackInteraction.bind(userTrackingService),
    trackAIUsage: userTrackingService.trackAIUsage.bind(userTrackingService),
    trackABTest: userTrackingService.trackABTest.bind(userTrackingService),
  };
};

export default useUserTracking;
