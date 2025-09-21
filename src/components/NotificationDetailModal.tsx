import React from 'react';
import './NotificationDetailModal.css';
import { Notification } from '../types/notification';

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

  // 通知の種類に応じた設定を取得
  const getNotificationConfig = (type: string) => {
    const configs = {
      memo_response: {
        icon: 'bi-reply',
        label: 'メモ返信'
      },
      memo_reply: {
        icon: 'bi-chat-dots',
        label: 'メモコメント'
      },
      status_update: {
        icon: 'bi-arrow-repeat',
        label: 'ステータス更新'
      },
      admin_message: {
        icon: 'bi-megaphone',
        label: '管理者メッセージ'
      },
      admin_announcement: {
        icon: 'bi-bullhorn',
        label: 'お知らせ'
      }
    };
    
    return configs[type as keyof typeof configs] || {
      icon: 'bi-bell',
      label: '通知'
    };
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
              className={`bi ${getNotificationConfig(notification.type).icon} notification-detail-icon`}
              data-type={notification.type}
            ></i>
            <span className="notification-detail-type-label">
              {getNotificationConfig(notification.type).label}
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
