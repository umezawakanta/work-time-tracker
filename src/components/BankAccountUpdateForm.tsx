// 銀行口座更新フォームコンポーネント

import React, { useState, useEffect } from 'react';
import { BankAccountManager } from '../utils/bankAccountManager';
import { BankAccount } from '../types/bankAccount';
import './BankAccountUpdateForm.css';

interface BankAccountUpdateFormProps {
  userId: string;
  accountId: string;
  onSave: (account: BankAccount) => void;
  onCancel: () => void;
}

const BankAccountUpdateForm: React.FC<BankAccountUpdateFormProps> = ({
  userId,
  accountId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountHolderName: '',
    currentBalance: '',
    notes: ''
  });
  const [currentAccount, setCurrentAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bankAccountManager = BankAccountManager.getInstance();

  useEffect(() => {
    loadCurrentAccount();
  }, [accountId]);

  const loadCurrentAccount = () => {
    bankAccountManager.loadFromLocalStorage();
    const account = bankAccountManager.getBankAccount(userId, accountId);
    if (account) {
      setCurrentAccount(account);
      setFormData({
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName,
        currentBalance: account.currentBalance.toString(),
        notes: account.notes || ''
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const balance = parseFloat(formData.currentBalance);
    if (isNaN(balance) || balance < 0) {
      alert('有効な残高を入力してください');
      return;
    }

    if (!formData.accountNumber.trim()) {
      alert('口座番号を入力してください');
      return;
    }

    if (!formData.accountHolderName.trim()) {
      alert('口座名義人を入力してください');
      return;
    }

    const updatedAccount = bankAccountManager.updateBankAccount(accountId, {
      accountNumber: formData.accountNumber.trim(),
      accountHolderName: formData.accountHolderName.trim(),
      currentBalance: balance,
      notes: formData.notes.trim() || undefined
    });

    if (updatedAccount) {
      onSave(updatedAccount);
    } else {
      alert('口座の更新に失敗しました');
    }
  };

  const handleQuickAmount = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      currentBalance: amount.toString()
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
      <div className="bank-account-update-form-overlay">
        <div className="bank-account-update-form loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="bank-account-update-form-overlay">
        <div className="bank-account-update-form error">
          <div className="error-content">
            <h3>エラー</h3>
            <p>口座情報が見つかりません</p>
            <button onClick={onCancel} className="cancel-button">
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-account-update-form-overlay">
      <div className="bank-account-update-form">
        <div className="form-header">
          <h3>🏦 {currentAccount.bankName} {currentAccount.branchName}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="account-info-display">
            <h4>口座情報</h4>
            <div className="account-details">
              <div className="account-detail-item">
                <span className="label">銀行名:</span>
                <span className="value">{currentAccount.bankName}</span>
              </div>
              <div className="account-detail-item">
                <span className="label">支店名:</span>
                <span className="value">{currentAccount.branchName}</span>
              </div>
              <div className="account-detail-item">
                <span className="label">口座種別:</span>
                <span className="value">{currentAccount.accountType}預金</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">口座番号 *</label>
            <input
              type="text"
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="例: 1234567"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountHolderName">口座名義人 *</label>
            <input
              type="text"
              id="accountHolderName"
              value={formData.accountHolderName}
              onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
              placeholder="例: 田中太郎"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentBalance">現在の残高（円） *</label>
            <input
              type="number"
              id="currentBalance"
              value={formData.currentBalance}
              onChange={(e) => setFormData(prev => ({ ...prev, currentBalance: e.target.value }))}
              min="0"
              step="1"
              required
              placeholder="0"
            />
            
            <div className="quick-amounts">
              <p>クイック設定:</p>
              <div className="quick-buttons">
                {[100000, 500000, 1000000, 2000000, 5000000].map(amount => (
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
              placeholder="口座に関するメモを記録してください"
              rows={3}
            />
          </div>

          <div className="balance-preview">
            <h4>更新後の口座情報</h4>
            <div className="preview-content">
              <div className="preview-item">
                <span className="preview-label">口座番号:</span>
                <span className="preview-value">
                  {formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : '未設定'}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">口座名義人:</span>
                <span className="preview-value">{formData.accountHolderName || '未設定'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">残高:</span>
                <span className="preview-value balance">
                  {formatCurrency(parseFloat(formData.currentBalance) || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              キャンセル
            </button>
            <button type="submit" className="save-button">
              口座情報を更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountUpdateForm;
