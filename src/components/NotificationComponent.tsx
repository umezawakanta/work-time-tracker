import React, { useState, useEffect, useMemo } from 'react';
import './NotificationComponent.css';
import NotificationDetailModal from './NotificationDetailModal';
import { Notification } from '../types/notification';

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
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    
    // 通知詳細モーダルを表示
    setSelectedNotification(notification);
    setShowDetailModal(true);
    setIsOpen(false);
  };

  // 通知詳細モーダルを閉じる
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  // メッセージの表示用テキストを生成する関数
  const renderNotificationMessage = (message: string) => {
    const isTruncated = message.length > 100;
    const displayMessage = isTruncated
      ? `${message.substring(0, 100)}...`
      : message;
    
    return (
      <>
        {displayMessage}
        {isTruncated && (
          <span className="read-more-link">続きを読む</span>
        )}
      </>
    );
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
      case 'admin_announcement':
        return 'bi-bullhorn';
      default:
        return 'bi-bell';
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
                      <p className="notification-message">
                        {renderNotificationMessage(notification.message)}
                      </p>
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

      {/* 通知詳細モーダル */}
      <NotificationDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        notification={selectedNotification}
        onNavigateToMemo={onNavigateToMemo}
      />
    </div>
  );
};

export default NotificationComponent;
