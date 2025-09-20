import React, { useState, useEffect } from 'react';
import './NotificationComponent.css';

interface Notification {
  _id: string;
  type: 'memo_response' | 'status_update' | 'admin_message' | 'memo_reply';
  title: string;
  message: string;
  relatedMemoId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationComponentProps {
  className?: string;
  onNavigateToMemo?: (memoId: string) => void;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ className = '', onNavigateToMemo }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 通知を取得
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('通知の取得に失敗しました');
      }

      const data = await response.json();
      console.log('Notifications loaded:', data);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('通知取得エラー:', error);
      setError(error instanceof Error ? error.message : '通知の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 通知を既読にする
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('既読処理エラー:', error);
    }
  };

  // すべての通知を既読にする
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notif => markAsRead(notif._id))
      );
    } catch (error) {
      console.error('一括既読処理エラー:', error);
    }
  };

  // 通知クリック時の処理
  const handleNotificationClick = (notification: Notification) => {
    // 既読にする
    markAsRead(notification._id);
    
    // メモ関連の通知の場合はメモセクションに移動
    if ((notification.type === 'memo_response' || notification.type === 'memo_reply') && notification.relatedMemoId && onNavigateToMemo) {
      onNavigateToMemo(notification.relatedMemoId);
      setIsOpen(false);
    }
  };

  // コンポーネントマウント時に通知を取得
  useEffect(() => {
    loadNotifications();
    
    // 5分ごとに通知を更新（頻度を下げる）
    const interval = setInterval(loadNotifications, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // 通知ドロップダウン外をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.notification-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // ESCキーで通知ドロップダウンを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  // 通知の種類に応じたアイコンを取得
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'memo_response':
        return 'bi-reply';
      case 'memo_reply':
        return 'bi-chat-dots';
      case 'status_update':
        return 'bi-arrow-repeat';
      case 'admin_message':
        return 'bi-megaphone';
      default:
        return 'bi-bell';
    }
  };

  // 通知の種類に応じた色を取得
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'memo_response':
        return '#28a745';
      case 'memo_reply':
        return '#007bff';
      case 'status_update':
        return '#17a2b8';
      case 'admin_message':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className={`notification-container ${className}`}>
      <button
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="通知"
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>通知</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-button"
                  onClick={markAllAsRead}
                  title="すべて既読にする"
                >
                  <i className="bi bi-check-all"></i>
                </button>
              )}
              <button
                className="refresh-button"
                onClick={loadNotifications}
                title="更新"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              <button
                className="close-notification-button"
                onClick={() => setIsOpen(false)}
                title="閉じる"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          </div>

          <div className="notification-content">
            {loading ? (
              <div className="loading-message">
                <i className="bi bi-hourglass-split"></i>
                通知を読み込み中...
              </div>
            ) : error ? (
              <div className="error-message">
                <i className="bi bi-exclamation-triangle"></i>
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <i className="bi bi-bell-slash"></i>
                通知はありません
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      <i 
                        className={`bi ${getNotificationIcon(notification.type)} notification-type-icon`}
                        data-type={notification.type}
                      ></i>
                    </div>
                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-date">
                        {new Date(notification.createdAt).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;
