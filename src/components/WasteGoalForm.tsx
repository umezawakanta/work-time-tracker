// 無駄遣い目標設定フォームコンポーネント

import React, { useState } from 'react';
import { WasteGoal } from '../types/wasteAnalysis';
import { WasteAnalysisManager } from '../utils/wasteAnalysisManager';
import './WasteGoalForm.css';

interface WasteGoalFormProps {
  userId: string;
  onSave: (goal: WasteGoal) => void;
  onCancel: () => void;
}

const WasteGoalForm: React.FC<WasteGoalFormProps> = ({ userId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'money' as 'money' | 'time' | 'effort',
    targetAmount: 0,
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30日後
  });

  const wasteManager = WasteAnalysisManager.getInstance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || formData.targetAmount <= 0) {
      alert('必須項目を入力してください');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate >= endDate) {
      alert('終了日は開始日より後に設定してください');
      return;
    }

    const goal = wasteManager.setWasteGoal({
      ...formData,
      startDate,
      endDate,
      isActive: true,
      userId
    });

    onSave(goal);
  };

  const getPeriodLabel = (period: string): string => {
    const labels = {
      daily: '日',
      weekly: '週',
      monthly: '月',
      yearly: '年'
    };
    return labels[period as keyof typeof labels];
  };

  const getAmountLabel = (type: string): string => {
    const labels = {
      money: '円',
      time: '分',
      effort: 'ポイント'
    };
    return labels[type as keyof typeof labels];
  };

  const getSuggestedTargets = (type: string, period: string) => {
    const suggestions = {
      money: {
        daily: [1000, 2000, 5000],
        weekly: [5000, 10000, 20000],
        monthly: [20000, 50000, 100000],
        yearly: [200000, 500000, 1000000]
      },
      time: {
        daily: [30, 60, 120],
        weekly: [240, 480, 720],
        monthly: [960, 1920, 2880],
        yearly: [11520, 23040, 34560]
      },
      effort: {
        daily: [10, 20, 50],
        weekly: [50, 100, 200],
        monthly: [200, 500, 1000],
        yearly: [2000, 5000, 10000]
      }
    };
    return suggestions[type as keyof typeof suggestions]?.[period as keyof typeof suggestions[typeof type]] || [];
  };

  const suggestedTargets = getSuggestedTargets(formData.type, formData.period);

  return (
    <div className="waste-goal-form-overlay">
      <div className="waste-goal-form">
        <div className="form-header">
          <h3>無駄遣い削減目標を設定</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="title">目標タイトル</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例: 衝動買いを減らす"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">目標の説明</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="この目標について詳しく説明してください"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">種類</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'money' | 'time' | 'effort'
                }))}
                required
              >
                <option value="money">お金</option>
                <option value="time">時間</option>
                <option value="effort">労力</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="period">期間</label>
              <select
                id="period"
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  period: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                }))}
                required
              >
                <option value="daily">日</option>
                <option value="weekly">週</option>
                <option value="monthly">月</option>
                <option value="yearly">年</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="targetAmount">
              目標値（{getAmountLabel(formData.type)}）
            </label>
            <input
              type="number"
              id="targetAmount"
              value={formData.targetAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
              min="0"
              step={formData.type === 'money' ? '1' : '0.1'}
              required
            />
            
            {suggestedTargets.length > 0 && (
              <div className="suggested-targets">
                <p>推奨値:</p>
                <div className="suggestion-buttons">
                  {suggestedTargets.map((target, index) => (
                    <button
                      key={index}
                      type="button"
                      className="suggestion-button"
                      onClick={() => setFormData(prev => ({ ...prev, targetAmount: target }))}
                    >
                      {target.toLocaleString()}{getAmountLabel(formData.type)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">開始日</label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">終了日</label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="goal-preview">
            <h4>目標プレビュー</h4>
            <div className="preview-content">
              <p><strong>{formData.title}</strong></p>
              <p>{formData.description || '説明なし'}</p>
              <p>
                {formData.targetAmount.toLocaleString()}{getAmountLabel(formData.type)}以下に
                {getPeriodLabel(formData.period)}単位で制限
              </p>
              <p>
                期間: {new Date(formData.startDate).toLocaleDateString('ja-JP')} ～ {new Date(formData.endDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              キャンセル
            </button>
            <button type="submit" className="save-button">
              目標を設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteGoalForm;
