import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading, sessionExpired, refreshAuth, user } = useAuth();
  const location = useLocation();

  // デバッグログ (React Strict Mode による重複実行を考慮)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PrivateRoute Debug:', {
        isAuthenticated,
        loading,
        sessionExpired,
        user: user ? { id: user.id || user._id, name: user.name, email: user.email } : null,
        location: location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isAuthenticated, loading, sessionExpired, user, location.pathname]);

  // ローディング状態
  if (loading) {
    console.log('PrivateRoute: Loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">認証確認中</h3>
            <p className="text-gray-600 text-center">認証状態を確認しています...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // セッション期限切れの場合
  if (sessionExpired && !isAuthenticated) {
    console.log('PrivateRoute: Session expired');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              セッションが期限切れです
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              セキュリティのため、一定時間操作がない場合は自動的にログアウトされます。
              継続するには再度ログインしてください。
            </p>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => (window.location.href = '/login')}>
                <LogIn className="h-4 w-4 mr-2" />
                ログインページへ
              </Button>
              <Button variant="outline" className="w-full" onClick={() => refreshAuth()}>
                認証状態を再確認
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 認証されていない場合はログインページへリダイレクト
  if (!isAuthenticated) {
    console.log('PrivateRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('PrivateRoute: Authenticated, rendering Outlet');
  return <Outlet />;
};

export default PrivateRoute;
