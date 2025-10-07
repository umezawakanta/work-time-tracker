import React, { useState, useEffect } from 'react';
import { MonthlyMemoProps } from '../../types/calendar.types';

const MonthlyMemo: React.FC<MonthlyMemoProps> = ({
  memo = '',
  isExpanded,
  onToggle,
  isEditing,
  onStartEditing,
  onCancelEditing,
  onSave,
  onChange,
  viewMode
}) => {
  const [localMemo, setLocalMemo] = useState(memo);

  useEffect(() => {
    setLocalMemo(memo);
  }, [memo]);

  const handleStartEditing = () => {
    setLocalMemo(memo);
    onStartEditing();
  };

  const handleCancelEditing = () => {
    setLocalMemo(memo);
    onCancelEditing();
  };

  const handleSave = () => {
    onChange(localMemo);
    onSave();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalMemo(e.target.value);
  };

  const viewModeText = viewMode === 'month' ? '月次' : '週次';

  return (
    <div className="monthly-memo">
      <div className="memo-header" onClick={!isEditing ? onToggle : undefined}>
        <h3>📝 {viewModeText}メモ</h3>
        <button className={`toggle-button ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="memo-content">
          {isEditing ? (
            <div className="memo-editor">
              <textarea
                value={localMemo}
                onChange={handleChange}
                placeholder={`${viewModeText}の振り返りやメモを入力してください...`}
                className="memo-textarea"
                rows={6}
              />
              <div className="memo-actions">
                <button className="save-button" onClick={handleSave}>
                  💾 保存
                </button>
                <button className="cancel-button" onClick={handleCancelEditing}>
                  ❌ キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="memo-display">
              {memo ? (
                <div className="memo-text">
                  {memo.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              ) : (
                <div className="memo-placeholder">
                  <p>まだメモがありません</p>
                  <p className="placeholder-hint">
                    {viewModeText}の振り返りやメモを追加してみましょう
                  </p>
                </div>
              )}
              <div className="memo-actions">
                <button className="edit-button" onClick={handleStartEditing}>
                  ✏️ 編集
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyMemo;
