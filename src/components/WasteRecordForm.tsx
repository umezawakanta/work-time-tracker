// 無駄遣い記録追加フォームコンポーネント

import React, { useState } from 'react';
import { WasteRecord, WASTE_CATEGORIES } from '../types/wasteAnalysis';
import { WasteAnalysisManager } from '../utils/wasteAnalysisManager';
import './WasteRecordForm.css';

interface WasteRecordFormProps {
  userId: string;
  onSave: (record: WasteRecord) => void;
  onCancel: () => void;
}

const WasteRecordForm: React.FC<WasteRecordFormProps> = ({ userId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    type: 'money' as 'money' | 'time' | 'effort',
    amount: 0,
    description: '',
    tags: [] as string[],
    isWasteful: true,
    wasteReason: '',
    improvementSuggestion: ''
  });

  const [newTag, setNewTag] = useState('');

  const wasteManager = WasteAnalysisManager.getInstance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || formData.amount <= 0 || !formData.description.trim()) {
      alert('必須項目を入力してください');
      return;
    }

    const record = wasteManager.addWasteRecord({
      ...formData,
      date: new Date(),
      userId
    });

    onSave(record);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredCategories = WASTE_CATEGORIES.filter(cat => cat.type === formData.type);

  return (
    <div className="waste-record-form-overlay">
      <div className="waste-record-form">
        <div className="form-header">
          <h3>無駄遣い記録を追加</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="waste-form">
          <div className="form-group">
            <label htmlFor="type">種類</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                type: e.target.value as 'money' | 'time' | 'effort',
                categoryId: '' // 種類が変わったらカテゴリをリセット
              }))}
              required
            >
              <option value="money">お金</option>
              <option value="time">時間</option>
              <option value="effort">労力</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">カテゴリ</label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              required
            >
              <option value="">カテゴリを選択</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">
              金額・時間・労力
              {formData.type === 'money' && '（円）'}
              {formData.type === 'time' && '（分）'}
              {formData.type === 'effort' && '（ポイント）'}
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              min="0"
              step={formData.type === 'money' ? '1' : '0.1'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">説明</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="何に使ったか、どのような無駄だったかを説明してください"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>タグ</label>
            <div className="tag-input">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="タグを入力"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button type="button" onClick={handleAddTag}>追加</button>
            </div>
            <div className="tags-list">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isWasteful}
                onChange={(e) => setFormData(prev => ({ ...prev, isWasteful: e.target.checked }))}
              />
              これは無駄遣いだった
            </label>
          </div>

          {formData.isWasteful && (
            <>
              <div className="form-group">
                <label htmlFor="wasteReason">無駄だった理由</label>
                <textarea
                  id="wasteReason"
                  value={formData.wasteReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, wasteReason: e.target.value }))}
                  placeholder="なぜ無駄だったのか、どうすれば良かったかを記述してください"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="improvementSuggestion">改善提案</label>
                <textarea
                  id="improvementSuggestion"
                  value={formData.improvementSuggestion}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvementSuggestion: e.target.value }))}
                  placeholder="次回同じような状況になった時の改善案を記述してください"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              キャンセル
            </button>
            <button type="submit" className="save-button">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteRecordForm;
