import React from 'react';
import { RecordDetailsProps, Record, WorkDiary } from '../../types/calendar.types';
import DiaryDetails from './DiaryDetails';

const RecordDetails: React.FC<RecordDetailsProps> = ({
  selectedRecord,
  selectedRecordType,
  onEditIncomeExpense,
  onEditDiary,
  onDeleteIncomeExpense,
  onDeleteDiary
}) => {
  if (!selectedRecord || !selectedRecordType) {
    return null;
  }

  const handleEdit = () => {
    if (selectedRecordType === 'diary' && onEditDiary) {
      onEditDiary(selectedRecord as WorkDiary);
    } else if ((selectedRecordType === 'income' || selectedRecordType === 'expense') && onEditIncomeExpense) {
      onEditIncomeExpense(selectedRecord as Record);
    }
  };

  const handleDelete = () => {
    if (selectedRecordType === 'diary' && onDeleteDiary) {
      onDeleteDiary(selectedRecord.id);
    } else if ((selectedRecordType === 'income' || selectedRecordType === 'expense') && onDeleteIncomeExpense) {
      onDeleteIncomeExpense(selectedRecord.id);
    }
  };

  if (selectedRecordType === 'diary') {
    return (
      <DiaryDetails
        diary={selectedRecord as WorkDiary}
        onEdit={onEditDiary || (() => {})}
        onDelete={onDeleteDiary || (() => {})}
      />
    );
  }

  const record = selectedRecord as Record;
  const isIncome = selectedRecordType === 'income';

  return (
    <div className="record-details">
      <div className="record-details-header">
        <h3>
          {isIncome ? '💰 収入記録' : '💸 支出記録'}
        </h3>
        <div className="record-actions">
          <button className="edit-button" onClick={handleEdit}>
            ✏️ 編集
          </button>
          <button className="delete-button" onClick={handleDelete}>
            🗑️ 削除
          </button>
        </div>
      </div>
      
      <div className="record-details-content">
        <div className="record-field">
          <label>金額:</label>
          <span className={`amount ${isIncome ? 'income' : 'expense'}`}>
            {isIncome ? '+' : '-'}¥{record.amount.toLocaleString()}
          </span>
        </div>
        
        <div className="record-field">
          <label>説明:</label>
          <span className="description">{record.description}</span>
        </div>
        
        <div className="record-field">
          <label>カテゴリ:</label>
          <span className="category">{record.category}</span>
        </div>
        
        <div className="record-field">
          <label>日付:</label>
          <span className="date">
            {new Date(record.date).toLocaleDateString('ja-JP')}
          </span>
        </div>
        
        <div className="record-field">
          <label>作成日:</label>
          <span className="created-at">
            {new Date(record.createdAt).toLocaleDateString('ja-JP')}
          </span>
        </div>
        
        {record.updatedAt !== record.createdAt && (
          <div className="record-field">
            <label>更新日:</label>
            <span className="updated-at">
              {new Date(record.updatedAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordDetails;
