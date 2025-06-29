// src/components/notifications/NotificationItem.tsx
import React from 'react';
import { UserNotification } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, BarChart2, AlertCircle, CheckCircle, Bell, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface NotificationItemProps {
  notification: UserNotification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

// 通知タイプに応じたアイコンを取得する関数
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reminder':
      return <Clock size={16} className="text-amber-500" />;
    case 'report':
      return <BarChart2 size={16} className="text-blue-500" />;
    case 'alert':
      return <AlertCircle size={16} className="text-red-500" />;
    case 'success':
      return <CheckCircle size={16} className="text-green-500" />;
    default:
      return <Bell size={16} className="text-gray-500" />;
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  // 相対的な時間表示（例: 「3時間前」）
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors duration-200',
        notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
      )}
    >
      <div className="flex items-start">
        <div className="mt-1 mr-3">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <p className="text-xs text-gray-500 whitespace-nowrap ml-2">{timeAgo}</p>
          </div>
          <p className="text-sm mt-1 text-gray-700">{notification.message}</p>
          <div className="flex mt-2 justify-end space-x-2">
            {!notification.read && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check size={14} className="mr-1" />
                既読
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-gray-500 hover:text-red-500"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 size={14} className="mr-1" />
              削除
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
