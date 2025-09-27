import React, { useEffect, useRef } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);
  // モーダル表示時の処理
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // 現在のスクロール位置を保存
      const scrollY = window.scrollY;
      
      // スクロールを無効化（body要素の位置は変更しない）
      document.body.style.overflow = 'hidden';
      
      // モーダルを現在の表示位置に配置
      const modalElement = modalRef.current;
      modalElement.style.position = 'fixed';
      modalElement.style.top = '0';
      modalElement.style.left = '0';
      modalElement.style.width = '100vw';
      modalElement.style.height = '100vh';
      modalElement.style.transform = `translateY(${scrollY}px)`;
      
      return () => {
        // モーダル閉じる時にスクロールを復元
        document.body.style.overflow = '';
        
        // スクロール位置を復元
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
    <div ref={modalRef} className="delete-confirm-overlay">
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
