// 現金残高更新フォームコンポーネント

import React, { useState, useEffect } from 'react';
import { CashBalanceManager } from '../utils/cashBalanceManager';
import { CashBalance } from '../types/cashBalance';
import './CashBalanceUpdateForm.css';

interface CashBalanceUpdateFormProps {
  userId: string;
  onSave: (balance: CashBalance) => void;
  onCancel: () => void;
}

const CashBalanceUpdateForm: React.FC<CashBalanceUpdateFormProps> = ({
  userId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    notes: ''
  });
  const [currentBalance, setCurrentBalance] = useState<CashBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cashBalanceManager = CashBalanceManager.getInstance();

  useEffect(() => {
    loadCurrentBalance();
  }, [userId]);

  const loadCurrentBalance = () => {
    cashBalanceManager.loadFromLocalStorage();
    const balance = cashBalanceManager.getCashBalance(userId);
    setCurrentBalance(balance);
    setFormData({
      amount: balance.amount.toString(),
      notes: balance.notes || ''
    });
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0) {
      alert('有効な金額を入力してください');
      return;
    }

    const updatedBalance = cashBalanceManager.updateCashBalance(
      userId,
      amount,
      formData.notes.trim() || undefined
    );

    onSave(updatedBalance);
  };

  const handleQuickAmount = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="cash-balance-update-form-overlay">
        <div className="cash-balance-update-form loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cash-balance-update-form-overlay">
      <div className="cash-balance-update-form">
        <div className="form-header">
          <h3>現金残高を更新</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="balance-form">
          <div className="current-balance-display">
            <h4>現在の残高</h4>
            <div className="current-amount">
              {formatCurrency(currentBalance?.amount || 0)}
            </div>
            <p className="last-updated">
              最終更新: {currentBalance?.lastUpdated.toLocaleString('ja-JP')}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="amount">新しい残高（円）</label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              min="0"
              step="1"
              required
              placeholder="0"
            />
            
            <div className="quick-amounts">
              <p>クイック設定:</p>
              <div className="quick-buttons">
                {[1000, 5000, 10000, 20000, 50000].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    className="quick-amount-button"
                    onClick={() => handleQuickAmount(amount)}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">メモ（任意）</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="残高更新の理由や状況を記録してください"
              rows={3}
            />
          </div>

          <div className="balance-preview">
            <h4>更新後の残高</h4>
            <div className="preview-amount">
              {formatCurrency(parseFloat(formData.amount) || 0)}
            </div>
            {currentBalance && (
              <div className="balance-change">
                変化: {formatCurrency((parseFloat(formData.amount) || 0) - currentBalance.amount)}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              キャンセル
            </button>
            <button type="submit" className="save-button">
              残高を更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashBalanceUpdateForm;
