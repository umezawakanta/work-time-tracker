import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isFeatureAccessible } from '@/config/features';
import { toast } from 'react-hot-toast';

export const FeatureAccessGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const res = isFeatureAccessible(location.pathname);
    if (!res.allowed) {
      try {
        toast.error(res.reason || '現在アクセスできません');
      } catch {}
      navigate('/features', { replace: true });
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default FeatureAccessGuard;
