import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Users } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="w-6 h-6 mr-2" /> ユーザー管理
          </h1>
          <p className="text-gray-600">登録ユーザーの一覧・検索・更新を行えます。</p>
        </div>
        <div>
          <Button variant="outline" size="sm" aria-label="再読み込み">
            再読み込み
          </Button>
        </div>
      </div>

      {error && (
        <Alert role="alert" aria-live="assertive" className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">エラーが発生しました</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="py-10 text-center text-gray-500">
          ユーザー一覧と検索UIはこの後に実装します。
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
