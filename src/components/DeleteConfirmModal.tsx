import React, { useEffect } from 'react';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  itemType: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemType
}) => {
  // モーダル表示時にスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      // 現在のスクロール位置を保存
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // モーダル閉じる時にスクロール位置を復元
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="delete-confirm-overlay">
      <div className="delete-confirm-content">
        <div className="delete-confirm-header">
          <h3>
            <i className="bi bi-exclamation-triangle"></i>
            {title}
          </h3>
          <button
            className="delete-confirm-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="delete-confirm-body">
          <div className="delete-warning">
            <i className="bi bi-exclamation-circle"></i>
            <p>{message}</p>
          </div>
          
          <div className="delete-item-info">
            <strong>{itemType}:</strong> {itemName}
          </div>
        </div>

        <div className="delete-confirm-actions">
          <button
            type="button"
            onClick={onClose}
            className="cancel-btn"
          >
            <i className="bi bi-x-circle"></i>
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="confirm-btn"
          >
            <i className="bi bi-trash"></i>
            削除する
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
