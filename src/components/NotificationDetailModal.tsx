import React from 'react';
import './NotificationDetailModal.css';

interface Notification {
  _id: string;
  type: 'memo_response' | 'status_update' | 'admin_message' | 'memo_reply' | 'admin_announcement';
  title: string;
  message: string;
  relatedMemoId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
  onNavigateToMemo?: (memoId: string) => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  onClose,
  notification,
  onNavigateToMemo,
}) => {
  if (!isOpen || !notification) {
    return null;
  }

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

  // 通知の種類に応じたラベルを取得
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'memo_response':
        return 'メモ返信';
      case 'memo_reply':
        return 'メモコメント';
      case 'status_update':
        return 'ステータス更新';
      case 'admin_message':
        return '管理者メッセージ';
      case 'admin_announcement':
        return 'お知らせ';
      default:
        return '通知';
    }
  };

  const handleMemoNavigation = () => {
    if (notification.relatedMemoId && onNavigateToMemo) {
      onNavigateToMemo(notification.relatedMemoId);
      onClose();
    }
  };

  return (
    <div className="notification-detail-modal-overlay">
      <div className="notification-detail-modal">
        <div className="notification-detail-modal-header">
          <div className="notification-detail-type">
            <i 
              className={`bi ${getNotificationIcon(notification.type)} notification-detail-icon`}
              data-type={notification.type}
            ></i>
            <span className="notification-detail-type-label">
              {getNotificationTypeLabel(notification.type)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="notification-detail-close-button"
            title="閉じる"
            aria-label="モーダルを閉じる"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="notification-detail-content">
          <div className="notification-detail-title">
            {notification.title}
          </div>
          
          <div className="notification-detail-message">
            {notification.message}
          </div>

          <div className="notification-detail-meta">
            <div className="notification-detail-date">
              <i className="bi bi-clock"></i>
              {new Date(notification.createdAt).toLocaleString('ja-JP')}
            </div>
            {!notification.isRead && (
              <div className="notification-detail-unread">
                <i className="bi bi-circle-fill"></i>
                未読
              </div>
            )}
          </div>
        </div>

        <div className="notification-detail-actions">
          {(notification.type === 'memo_response' || notification.type === 'memo_reply') && notification.relatedMemoId && (
            <button
              onClick={handleMemoNavigation}
              className="notification-detail-action-button primary"
            >
              <i className="bi bi-chat-dots"></i>
              メモを表示
            </button>
          )}
          <button
            onClick={onClose}
            className="notification-detail-action-button secondary"
          >
            <i className="bi bi-check"></i>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
