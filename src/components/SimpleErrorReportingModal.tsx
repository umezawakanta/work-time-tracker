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
  buttonPosition?: { x: number; y: number };
}

const SimpleErrorReportingModal: React.FC<SimpleErrorReportingModalProps> = ({
  isOpen,
  onClose,
  error,
  onSubmit,
  buttonPosition
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // モーダル表示時の処理
  useEffect(() => {
    if (isOpen) {
      // スクロール制御は行わず、モーダルを画面内に表示
      // 必要に応じてスクロール位置を調整
      if (buttonPosition) {
        const modalHeight = 400; // モーダルの推定高さ
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const buttonY = buttonPosition.y + scrollY;
        
        // ボタンが画面下部にある場合は上にスクロール
        if (buttonY + modalHeight > viewportHeight + scrollY) {
          const targetScrollY = Math.max(0, buttonY - viewportHeight + modalHeight + 20);
          window.scrollTo({
            top: targetScrollY,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [isOpen, buttonPosition]);

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

  // ボタン位置に基づくモーダルの位置計算
  const getModalStyle = () => {
    if (!buttonPosition) {
      return {}; // デフォルトの中央表示
    }

    const modalWidth = 500;
    const modalHeight = 400;
    const padding = 20;
    
    // ビューポート内に収まるように位置を調整
    let left = buttonPosition.x - modalWidth / 2;
    let top = buttonPosition.y - modalHeight / 2;
    
    // 左端からはみ出さないように調整
    if (left < padding) {
      left = padding;
    }
    
    // 右端からはみ出さないように調整
    if (left + modalWidth > window.innerWidth - padding) {
      left = window.innerWidth - modalWidth - padding;
    }
    
    // 上端からはみ出さないように調整
    if (top < padding) {
      top = padding;
    }
    
    // 下端からはみ出さないように調整
    if (top + modalHeight > window.innerHeight - padding) {
      top = window.innerHeight - modalHeight - padding;
    }
    
    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none',
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    };
  };

  return (
    <div 
      className="simple-error-modal-overlay"
      style={getModalStyle()}
    >
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
