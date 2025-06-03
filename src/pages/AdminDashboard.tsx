import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const AdminDashboard: React.FC = () => {
  const user = useMemo(
    () => ({
      loginCount: 5,
      subscriptionStatus: 'active',
    }),
    []
  );

  return (
    <div className="flex justify-between">
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-gray-500">ログイン回数:</span>
          <span>{user.loginCount || 0}回</span>
        </div>
      </div>

      {user.subscriptionStatus && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">サブスクリプション</h4>
            <Badge
              variant={
                user.subscriptionStatus === 'active'
                  ? 'default'
                  : user.subscriptionStatus === 'canceled'
                    ? 'destructive'
                    : 'outline'
              }
            >
              {user.subscriptionStatus === 'active'
                ? 'アクティブ'
                : user.subscriptionStatus === 'canceled'
                  ? 'キャンセル済み'
                  : user.subscriptionStatus === 'expired'
                    ? '期限切れ'
                    : 'なし'}
            </Badge>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
