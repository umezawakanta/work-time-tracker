import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, AlertCircle } from 'lucide-react';

export default function FirebasePrivateRoute() {
  const { isAuthenticated, loading, sessionExpired } = useFirebaseAuth();
  const location = useLocation();

  // ロード中の表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="text-center">
                <h3 className="text-lg font-medium">認証状態を確認中</h3>
                <p className="text-sm text-gray-500 mt-1">しばらくお待ちください...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // セッション期限切れの場合
  if (sessionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">セッション期限切れ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              セッションが期限切れになりました。
              <br />
              再度ログインしてください。
            </p>
            <Button className="w-full" onClick={() => (window.location.href = '/firebase-login')}>
              ログイン画面へ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 未認証の場合
  if (!isAuthenticated) {
    return <Navigate to="/firebase-login" state={{ from: location.pathname }} replace />;
  }

  // 認証済みの場合は保護されたコンテンツを表示
  return <Outlet />;
}
