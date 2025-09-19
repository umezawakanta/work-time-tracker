import React, { useState, useEffect } from 'react';
import './SimpleErrorReportingModal.css';

interface SimpleErrorReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: Error | null;
  onSubmit: (errorReport: {
    title: string;
    content: string;
    errorDetails: string;
    userAgent: string;
    timestamp: string;
  }) => void;
}

const SimpleErrorReportingModal: React.FC<SimpleErrorReportingModalProps> = ({
  isOpen,
  onClose,
  error,
  onSubmit
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      // エラーの詳細情報を簡潔に構築
      let errorDetails = '';
      if (error) {
        errorDetails = `${error.name}: ${error.message}`;
        if ((error as any).errorInfo) {
          const errorInfo = (error as any).errorInfo;
          errorDetails += `\n場所: ${errorInfo.filename}:${errorInfo.lineno}`;
        }
      }

      const errorReport = {
        title: `エラー報告: ${new Date().toLocaleString('ja-JP')}`,
        content: message.trim(),
        errorDetails: errorDetails,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      await onSubmit(errorReport);
      
      // フォームをリセット
      setMessage('');
      onClose();
    } catch (err) {
      console.error('エラー報告の送信に失敗しました:', err);
      alert('エラー報告の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="simple-error-modal-overlay">
      <div className="simple-error-modal-content">
        <div className="simple-error-modal-header">
          <h3>
            <i className="bi bi-exclamation-triangle"></i>
            エラーが発生しました
          </h3>
          <button
            className="simple-error-modal-close"
            onClick={handleClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="simple-error-modal-body">
          <div className="error-preview">
            <p><strong>エラー:</strong> {error?.message || '不明なエラー'}</p>
          </div>

          <form onSubmit={handleSubmit} className="simple-error-form">
            <div className="form-group">
              <label htmlFor="errorMessage">何が起こりましたか？</label>
              <textarea
                id="errorMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="エラーの状況や再現手順を簡単に教えてください"
                rows={4}
                required
                maxLength={500}
              />
              <div className="character-count">
                {message.length}/500文字
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-btn"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? (
                  <>
                    <i className="bi bi-hourglass-split"></i>
                    送信中...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i>
                    報告する
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleErrorReportingModal;
