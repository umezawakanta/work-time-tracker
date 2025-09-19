import React, { useState } from 'react';
import './ErrorReportingModal.css';

interface ErrorReportingModalProps {
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

const ErrorReportingModal: React.FC<ErrorReportingModalProps> = ({
  isOpen,
  onClose,
  error,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    
    try {
      // エラーの詳細情報を構築
      let errorDetails = '';
      if (error) {
        errorDetails = `${error.name}: ${error.message}\n`;
        if (error.stack) {
          errorDetails += `Stack Trace:\n${error.stack}\n`;
        }
        
        // 追加のエラー情報がある場合
        if ((error as any).errorInfo) {
          const errorInfo = (error as any).errorInfo;
          errorDetails += `\n詳細情報:\n`;
          errorDetails += `タイプ: ${errorInfo.type}\n`;
          errorDetails += `ファイル: ${errorInfo.filename}\n`;
          errorDetails += `行: ${errorInfo.lineno}\n`;
          errorDetails += `列: ${errorInfo.colno}\n`;
          errorDetails += `URL: ${errorInfo.url}\n`;
          errorDetails += `タイムスタンプ: ${errorInfo.timestamp}\n`;
        }
      }

      const errorReport = {
        title: title.trim(),
        content: content.trim(),
        errorDetails: errorDetails,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      await onSubmit(errorReport);
      
      // フォームをリセット
      setTitle('');
      setContent('');
      onClose();
    } catch (err) {
      console.error('エラー報告の送信に失敗しました:', err);
      alert('エラー報告の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="error-modal-overlay">
      <div className="error-modal-content">
        <div className="error-modal-header">
          <h2>
            <i className="bi bi-exclamation-triangle"></i>
            エラー報告
          </h2>
          <button
            className="error-modal-close"
            onClick={handleClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="error-modal-body">
          <div className="error-info">
            <h3>発生したエラー</h3>
            <div className="error-details">
              <p><strong>エラー名:</strong> {error?.name || '不明'}</p>
              <p><strong>エラーメッセージ:</strong> {error?.message || '不明'}</p>
              
              {/* 追加のエラー情報を表示 */}
              {(error as any)?.errorInfo && (
                <div className="error-additional-info">
                  <h4>詳細情報</h4>
                  <p><strong>タイプ:</strong> {(error as any).errorInfo.type}</p>
                  <p><strong>ファイル:</strong> {(error as any).errorInfo.filename}</p>
                  <p><strong>行:</strong> {(error as any).errorInfo.lineno}</p>
                  <p><strong>列:</strong> {(error as any).errorInfo.colno}</p>
                  <p><strong>URL:</strong> {(error as any).errorInfo.url}</p>
                  <p><strong>発生時刻:</strong> {(error as any).errorInfo.timestamp}</p>
                </div>
              )}
              
              {error?.stack && (
                <details>
                  <summary>スタックトレース</summary>
                  <pre className="error-stack">{error.stack}</pre>
                </details>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="error-report-form">
            <div className="form-group">
              <label htmlFor="errorTitle">タイトル *</label>
              <input
                type="text"
                id="errorTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="エラーの概要を入力してください"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="errorContent">詳細説明 *</label>
              <textarea
                id="errorContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="エラーが発生した状況や再現手順を詳しく説明してください"
                rows={6}
                required
                maxLength={1000}
              />
              <div className="character-count">
                {content.length}/1000文字
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                />
                このエラーを公開メモとして投稿し、開発者に報告します
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting ? (
                  <>
                    <i className="bi bi-hourglass-split"></i>
                    送信中...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i>
                    エラーを報告
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

export default ErrorReportingModal;
