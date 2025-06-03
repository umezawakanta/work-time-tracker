import { useAuth } from '@/context/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export function useAdminCheck() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast.error('ログインが必要です');
        navigate('/login');
        return;
      }

      if (!user?.isAdmin) {
        toast.error('管理者権限が必要です');
        navigate('/');
        return;
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  return {
    isAdmin: user?.isAdmin || false,
    loading,
    isAuthenticated,
  };
}
