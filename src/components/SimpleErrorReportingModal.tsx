import React, { useState, useEffect } from 'react';
import './SimpleErrorReportingModal.css';

// エラー情報の型定義
interface ErrorInfo {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  type?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  status?: number;
  statusText?: string;
  method?: string;
}

interface SimpleErrorReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: {
    title: string;
    content: string;
    errorDetails: string;
    userAgent: string;
    timestamp: string;
  }) => Promise<void>;
  errorInfo?: ErrorInfo;
}

const SimpleErrorReportingModal: React.FC<SimpleErrorReportingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  errorInfo
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
    if (isOpen && errorInfo) {
      // エラー情報から自動で内容を生成
      const statusInfo = errorInfo.status ? `ステータス: ${errorInfo.status} ${errorInfo.statusText || ''}` : '';
      const methodInfo = errorInfo.method ? `メソッド: ${errorInfo.method}` : '';
      const stackInfo = errorInfo.stack ? `スタックトレース:\n${errorInfo.stack}` : '';
      
      const autoContent = `
エラーが発生しました。

エラーメッセージ: ${errorInfo.message}
ファイル: ${errorInfo.filename || 'Unknown'}
行番号: ${errorInfo.lineno || 0}
列番号: ${errorInfo.colno || 0}
エラータイプ: ${errorInfo.type || 'Unknown'}
発生時刻: ${errorInfo.timestamp}
URL: ${errorInfo.url}${statusInfo ? `\n${statusInfo}` : ''}${methodInfo ? `\n${methodInfo}` : ''}

${stackInfo}

このエラーについて詳細を教えてください。
      `.trim();
      setContent(autoContent);
    }
  }, [isOpen, errorInfo]);

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
      
      // 送信成功時のみフォームをリセットしてモーダルを閉じる
      setSelectedFeature('');
      setContent('');
      onClose();
    } catch (err) {
      console.error('報告の送信に失敗しました:', err);
      alert('報告の送信に失敗しました。もう一度お試しください。');
      // エラー時はモーダルを閉じない
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFeature('');
    setContent('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="simple-error-reporting-overlay">
      <div className="simple-error-reporting-modal">
        <div className="simple-error-reporting-header">
          <h2>
            <i className="bi bi-exclamation-triangle"></i>
            エラーが発生しました
          </h2>
          <button
            onClick={handleClose}
            className="close-button"
            title="閉じる"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="simple-error-reporting-body">
          <div className="error-info">
            <p className="error-message">
              <i className="bi bi-bug"></i>
              申し訳ございません。エラーが発生しました。詳細を報告していただけると、迅速に修正いたします。
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="feature-select">対象機能</label>
            <select
              id="feature-select"
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="form-control"
              required
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
            <label htmlFor="content-textarea">エラーの詳細</label>
            <textarea
              id="content-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="エラーの詳細や再現手順を教えてください..."
              className="form-control"
              rows={8}
              required
            />
          </div>
        </div>

        <div className="simple-error-reporting-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleSubmit('error_report')}
            disabled={!selectedFeature || !content.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-hourglass-split"></i>
                送信中...
              </>
            ) : (
              <>
                <i className="bi bi-bug"></i>
                不具合報告を送信
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleErrorReportingModal;