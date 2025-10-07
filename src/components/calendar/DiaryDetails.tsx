import React from 'react';
import { DiaryDetailsProps } from '../../types/calendar.types';

const DiaryDetails: React.FC<DiaryDetailsProps> = ({
  diary,
  onEdit,
  onDelete
}) => {
  const handleEdit = () => {
    onEdit(diary);
  };

  const handleDelete = () => {
    onDelete(diary.id);
  };

  const getMoodEmoji = (mood: number): string => {
    if (mood >= 4) return '😊';
    if (mood >= 3) return '😐';
    if (mood >= 2) return '😕';
    return '😢';
  };

  const getMoodText = (mood: number): string => {
    if (mood >= 4) return 'とても良い';
    if (mood >= 3) return '良い';
    if (mood >= 2) return '普通';
    return '悪い';
  };

  const getProductivityText = (productivity: number): string => {
    if (productivity >= 4) return 'とても高い';
    if (productivity >= 3) return '高い';
    if (productivity >= 2) return '普通';
    return '低い';
  };

  return (
    <div className="diary-details">
      <div className="diary-details-header">
        <h3>📝 日記詳細</h3>
        <div className="diary-actions">
          <button className="edit-button" onClick={handleEdit}>
            ✏️ 編集
          </button>
          <button className="delete-button" onClick={handleDelete}>
            🗑️ 削除
          </button>
        </div>
      </div>
      
      <div className="diary-details-content">
        <div className="diary-field">
          <label>日付:</label>
          <span className="date">
            {new Date(diary.date).toLocaleDateString('ja-JP')}
          </span>
        </div>
        
        <div className="diary-field">
          <label>気分:</label>
          <span className="mood">
            {getMoodEmoji(diary.mood)} {getMoodText(diary.mood)} ({diary.mood}/5)
          </span>
        </div>
        
        <div className="diary-field">
          <label>勤務時間:</label>
          <span className="work-hours">
            {diary.workHours}時間
          </span>
        </div>
        
        <div className="diary-field">
          <label>生産性:</label>
          <span className="productivity">
            {getProductivityText(diary.productivity)} ({diary.productivity}/5)
          </span>
        </div>
        
        <div className="diary-field full-width">
          <label>内容:</label>
          <div className="content">
            {diary.content}
          </div>
        </div>
        
        {diary.achievements.length > 0 && (
          <div className="diary-field full-width">
            <label>達成したこと:</label>
            <ul className="achievements">
              {diary.achievements.map((achievement, index) => (
                <li key={index}>✅ {achievement}</li>
              ))}
            </ul>
          </div>
        )}
        
        {diary.challenges.length > 0 && (
          <div className="diary-field full-width">
            <label>課題:</label>
            <ul className="challenges">
              {diary.challenges.map((challenge, index) => (
                <li key={index}>⚠️ {challenge}</li>
              ))}
            </ul>
          </div>
        )}
        
        {diary.learnings.length > 0 && (
          <div className="diary-field full-width">
            <label>学んだこと:</label>
            <ul className="learnings">
              {diary.learnings.map((learning, index) => (
                <li key={index}>💡 {learning}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="diary-field">
          <label>作成日:</label>
          <span className="created-at">
            {new Date(diary.createdAt).toLocaleDateString('ja-JP')}
          </span>
        </div>
        
        {diary.updatedAt !== diary.createdAt && (
          <div className="diary-field">
            <label>更新日:</label>
            <span className="updated-at">
              {new Date(diary.updatedAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryDetails;
