import React from 'react';
import { useMemoCounts } from '../hooks/useMemoCounts';
import './MemoCountDisplay.css';

interface MemoCountDisplayProps {
  showPersonal?: boolean;
  showPublic?: boolean;
  compact?: boolean;
}

const MemoCountDisplay: React.FC<MemoCountDisplayProps> = ({
  showPersonal = true,
  showPublic = true,
  compact = false
}) => {
  const { memoCounts, loading, error } = useMemoCounts();

  if (loading) {
    return (
      <div className={`memo-count-display ${compact ? 'compact' : ''}`}>
        <div className="memo-count-loading">
          <i className="bi bi-hourglass-split"></i>
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`memo-count-display ${compact ? 'compact' : ''}`}>
        <div className="memo-count-error">
          <i className="bi bi-exclamation-triangle"></i>
          <span>エラー</span>
        </div>
      </div>
    );
  }

  const totalCount = (showPersonal ? memoCounts.personal.total : 0) + 
                    (showPublic ? memoCounts.public.total : 0);

  return (
    <div className={`memo-count-display ${compact ? 'compact' : ''}`}>
      <div className="memo-count-header">
        <i className="bi bi-journal-text"></i>
        <span className="memo-count-title">メモ</span>
        <span className="memo-count-total">{totalCount}件</span>
      </div>
      
      {!compact && (
        <div className="memo-count-details">
          {showPersonal && (
            <div className="memo-count-section">
              <div className="memo-count-section-title">個人メモ</div>
              <div className="memo-count-items">
                <span className="memo-count-item general">
                  <i className="bi bi-journal-text"></i>
                  一般: {memoCounts.personal.general}件
                </span>
                <span className="memo-count-item error">
                  <i className="bi bi-bug"></i>
                  不具合: {memoCounts.personal.errorReports}件
                </span>
                <span className="memo-count-item update">
                  <i className="bi bi-lightbulb"></i>
                  要望: {memoCounts.personal.updateRequests}件
                </span>
              </div>
            </div>
          )}
          
          {showPublic && (
            <div className="memo-count-section">
              <div className="memo-count-section-title">公開メモ</div>
              <div className="memo-count-items">
                <span className="memo-count-item general">
                  <i className="bi bi-journal-text"></i>
                  一般: {memoCounts.public.general}件
                </span>
                <span className="memo-count-item error">
                  <i className="bi bi-bug"></i>
                  不具合: {memoCounts.public.errorReports}件
                </span>
                <span className="memo-count-item update">
                  <i className="bi bi-lightbulb"></i>
                  要望: {memoCounts.public.updateRequests}件
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoCountDisplay;
