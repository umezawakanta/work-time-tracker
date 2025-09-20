import React, { useState, useEffect } from 'react';
import './ErrorReportingModal.css';

interface ErrorReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: {
    title: string;
    content: string;
    errorDetails: string;
    userAgent: string;
    timestamp: string;
  }) => Promise<void>;
  initialCategory?: string;
  initialContent?: string;
}

const ErrorReportingModal: React.FC<ErrorReportingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCategory = '',
  initialContent = ''
}) => {
  const [selectedFeature, setSelectedFeature] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 機能選択肢
  const featureOptions = [
    { value: '', label: '対象機能を選択してください', disabled: true },
    { value: 'time_tracking', label: '時間記録機能' },
    { value: 'work_records', label: 'おしごと記録機能' },
    { value: 'memos', label: 'メモ機能' },
    { value: 'notifications', label: '通知機能' },
    { value: 'admin_panel', label: '管理者パネル' },
    { value: 'authentication', label: '認証機能' },
    { value: 'ui_ux', label: 'UI/UX' },
    { value: 'performance', label: 'パフォーマンス' },
    { value: 'other', label: 'その他' }
  ];

  // モーダルが開かれた時の初期化
  useEffect(() => {
    if (isOpen) {
      setSelectedFeature('');
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  const handleSubmit = async (type: 'error_report' | 'update_request') => {
    if (!selectedFeature || !content.trim()) {
      alert('対象機能と内容を入力してください。');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const report = {
        title: type === 'error_report' ? '不具合報告' : '改善要望',
        content: content.trim(),
        errorDetails: `対象機能: ${featureOptions.find(f => f.value === selectedFeature)?.label || selectedFeature}`,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      await onSubmit(report);
      
      // フォームをリセット
      setSelectedFeature('');
      setContent('');
      onClose();
    } catch (err) {
      console.error('報告の送信に失敗しました:', err);
      alert('報告の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFeature('');
    setContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="error-reporting-overlay">
      <div className="error-reporting-modal">
        <div className="error-reporting-header">
          <h3>
            <i className="bi bi-exclamation-triangle"></i>
            不具合報告・改善要望
          </h3>
          <button
            className="error-reporting-close"
            onClick={handleClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="error-reporting-body">
          <div className="instruction-guide">
            <h5>送信手順：</h5>
            <div className="instruction-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <strong>対象機能を選択</strong>
                  <p>不具合や改善要望が発生した機能を選択してください（必須）</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <strong>詳細を記入</strong>
                  <p>不具合の場合は再現手順、改善要望の場合は具体的な内容を記入してください（必須）</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <strong>送信ボタンをクリック</strong>
                  <p>「不具合報告を送信」または「改善要望を送信」ボタンをクリックしてください</p>
                </div>
              </div>
            </div>
          </div>

          <div className="error-reporting-form">
            <div className="form-group">
              <label htmlFor="selectedFeature">対象機能 <span className="required">*</span></label>
              <select
                id="selectedFeature"
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className={!selectedFeature ? 'error' : ''}
              >
                {featureOptions.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="reportContent">内容 <span className="required">*</span></label>
              <textarea
                id="reportContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="不具合の詳細や改善要望を記入してください..."
                rows={4}
                className={!content.trim() ? 'error' : ''}
              />
            </div>
            
            <div className="submit-buttons">
              <button
                type="button"
                className="submit-button bug-report"
                onClick={() => handleSubmit('error_report')}
                disabled={!selectedFeature || !content.trim() || isSubmitting}
                title="不具合報告を送信"
              >
                <i className="bi bi-bug"></i>
                <span>{isSubmitting ? '送信中...' : '不具合報告を送信'}</span>
              </button>
              <button
                type="button"
                className="submit-button update-request"
                onClick={() => handleSubmit('update_request')}
                disabled={!selectedFeature || !content.trim() || isSubmitting}
                title="改善要望を送信"
              >
                <i className="bi bi-lightbulb"></i>
                <span>{isSubmitting ? '送信中...' : '改善要望を送信'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorReportingModal;