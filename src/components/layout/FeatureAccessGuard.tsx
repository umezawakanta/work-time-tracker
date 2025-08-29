import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isFeatureAccessible } from '@/config/features';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export const FeatureAccessGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // 管理者は未完成機能にもアクセス可能（開発確認用）
    if (user?.isAdmin) return;
    const res = isFeatureAccessible(location.pathname);
    if (!res.allowed) {
      try {
        toast.error(res.reason || '現在アクセスできません');
      } catch {}
      navigate('/features', { replace: true });
    }
  }, [location.pathname, navigate, user?.isAdmin]);

  return <>{children}</>;
};

export default FeatureAccessGuard;
