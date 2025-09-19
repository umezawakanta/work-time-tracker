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
}

const QuickReportModal: React.FC<QuickReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'bug' | 'feature'>('bug');

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

  return (
    <div className="quick-report-overlay">
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
