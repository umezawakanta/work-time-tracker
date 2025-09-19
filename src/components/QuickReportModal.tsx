import React, { useState, useEffect } from 'react';
import './QuickReportModal.css';

interface QuickReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: {
    title: string;
    content: string;
    type: 'bug' | 'feature';
  }) => void;
  buttonPosition?: { x: number; y: number };
}

const QuickReportModal: React.FC<QuickReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  buttonPosition
}) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'bug' | 'feature'>('bug');

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      const report = {
        title: type === 'bug' ? '不具合報告' : '機能要望',
        content: message.trim(),
        type: type
      };

      await onSubmit(report);
      
      // フォームをリセット
      setMessage('');
      setType('bug');
      onClose();
    } catch (err) {
      console.error('報告の送信に失敗しました:', err);
      alert('報告の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setType('bug');
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
      className="quick-report-overlay"
      style={getModalStyle()}
    >
      <div className="quick-report-content">
        <div className="quick-report-header">
          <h3>
            <i className={`bi ${type === 'bug' ? 'bi-bug' : 'bi-lightbulb'}`}></i>
            {type === 'bug' ? '不具合報告' : '機能要望'}
          </h3>
          <button
            className="quick-report-close"
            onClick={handleClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="quick-report-body">
          <div className="type-selector">
            <button
              type="button"
              className={`type-btn ${type === 'bug' ? 'active' : ''}`}
              onClick={() => setType('bug')}
            >
              <i className="bi bi-bug"></i>
              不具合報告
            </button>
            <button
              type="button"
              className={`type-btn ${type === 'feature' ? 'active' : ''}`}
              onClick={() => setType('feature')}
            >
              <i className="bi bi-lightbulb"></i>
              機能要望
            </button>
          </div>

          <form onSubmit={handleSubmit} className="quick-report-form">
            <div className="form-group">
              <label htmlFor="reportMessage">
                {type === 'bug' ? 'どのような不具合が発生しましたか？' : 'どのような機能を追加してほしいですか？'}
              </label>
              <textarea
                id="reportMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={type === 'bug' 
                  ? '不具合の状況や再現手順を教えてください' 
                  : '欲しい機能の詳細を教えてください'
                }
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
                    投稿する
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

export default QuickReportModal;
