// カードローン更新フォームコンポーネント

import React, { useState, useEffect } from 'react';
import { CardLoanManager } from '../utils/cardLoanManager';
import { CardLoan } from '../types/cardLoan';
import './CardLoanUpdateForm.css';

interface CardLoanUpdateFormProps {
  userId: string;
  loanId: string;
  onSave: (loan: CardLoan) => void;
  onCancel: () => void;
}

const CardLoanUpdateForm: React.FC<CardLoanUpdateFormProps> = ({
  userId,
  loanId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountHolderName: '',
    currentBalance: '',
    originalAmount: '',
    interestRate: '',
    monthlyPayment: '',
    nextPaymentDate: '',
    notes: ''
  });
  const [currentLoan, setCurrentLoan] = useState<CardLoan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cardLoanManager = CardLoanManager.getInstance();

  useEffect(() => {
    loadCurrentLoan();
  }, [loanId]);

  const loadCurrentLoan = () => {
    cardLoanManager.loadFromLocalStorage();
    const loan = cardLoanManager.getCardLoan(userId, loanId);
    if (loan) {
      setCurrentLoan(loan);
      setFormData({
        accountNumber: loan.accountNumber,
        accountHolderName: loan.accountHolderName,
        currentBalance: loan.currentBalance.toString(),
        originalAmount: loan.originalAmount.toString(),
        interestRate: loan.interestRate.toString(),
        monthlyPayment: loan.monthlyPayment.toString(),
        nextPaymentDate: loan.nextPaymentDate ? loan.nextPaymentDate.toISOString().split('T')[0] : '',
        notes: loan.notes || ''
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const balance = parseFloat(formData.currentBalance);
    const originalAmount = parseFloat(formData.originalAmount);
    const interestRate = parseFloat(formData.interestRate);
    const monthlyPayment = parseFloat(formData.monthlyPayment);
    
    if (isNaN(balance) || balance < 0) {
      alert('有効な残高を入力してください');
      return;
    }

    if (isNaN(originalAmount) || originalAmount < 0) {
      alert('有効な当初借入額を入力してください');
      return;
    }

    if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) {
      alert('有効な金利を入力してください（0-100%）');
      return;
    }

    if (isNaN(monthlyPayment) || monthlyPayment < 0) {
      alert('有効な月々の返済額を入力してください');
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

    const nextPaymentDate = formData.nextPaymentDate ? new Date(formData.nextPaymentDate) : undefined;

    const updatedLoan = cardLoanManager.updateCardLoan(loanId, {
      accountNumber: formData.accountNumber.trim(),
      accountHolderName: formData.accountHolderName.trim(),
      currentBalance: balance,
      originalAmount: originalAmount,
      interestRate: interestRate,
      monthlyPayment: monthlyPayment,
      nextPaymentDate: nextPaymentDate,
      notes: formData.notes.trim() || undefined
    });

    if (updatedLoan) {
      onSave(updatedLoan);
    } else {
      alert('ローン情報の更新に失敗しました');
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

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(formData.currentBalance);
    const rate = parseFloat(formData.interestRate);
    
    if (principal > 0 && rate > 0) {
      const monthlyRate = rate / 100 / 12;
      const months = 60; // 5年で計算
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                            (Math.pow(1 + monthlyRate, months) - 1);
      
      if (!isNaN(monthlyPayment)) {
        setFormData(prev => ({
          ...prev,
          monthlyPayment: Math.round(monthlyPayment).toString()
        }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="card-loan-update-form-overlay">
        <div className="card-loan-update-form loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLoan) {
    return (
      <div className="card-loan-update-form-overlay">
        <div className="card-loan-update-form error">
          <div className="error-content">
            <h3>エラー</h3>
            <p>ローン情報が見つかりません</p>
            <button onClick={onCancel} className="cancel-button">
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-loan-update-form-overlay">
      <div className="card-loan-update-form">
        <div className="form-header">
          <h3>💳 {currentLoan.bankName} {currentLoan.branchName}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="loan-form">
          <div className="loan-info-display">
            <h4>ローン情報</h4>
            <div className="loan-details">
              <div className="loan-detail-item">
                <span className="label">銀行名:</span>
                <span className="value">{currentLoan.bankName}</span>
              </div>
              <div className="loan-detail-item">
                <span className="label">支店名:</span>
                <span className="value">{currentLoan.branchName}</span>
              </div>
              <div className="loan-detail-item">
                <span className="label">ローン種別:</span>
                <span className="value">{currentLoan.loanType}</span>
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

          <div className="form-row">
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
            </div>

            <div className="form-group">
              <label htmlFor="originalAmount">当初借入額（円） *</label>
              <input
                type="number"
                id="originalAmount"
                value={formData.originalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, originalAmount: e.target.value }))}
                min="0"
                step="1"
                required
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="interestRate">金利（年利%） *</label>
              <input
                type="number"
                id="interestRate"
                value={formData.interestRate}
                onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                min="0"
                max="100"
                step="0.1"
                required
                placeholder="14.0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="monthlyPayment">月々の返済額（円） *</label>
              <div className="input-with-button">
                <input
                  type="number"
                  id="monthlyPayment"
                  value={formData.monthlyPayment}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyPayment: e.target.value }))}
                  min="0"
                  step="1"
                  required
                  placeholder="0"
                />
                <button
                  type="button"
                  className="calculate-button"
                  onClick={calculateMonthlyPayment}
                  title="5年返済で計算"
                >
                  計算
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nextPaymentDate">次回返済予定日</label>
            <input
              type="date"
              id="nextPaymentDate"
              value={formData.nextPaymentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, nextPaymentDate: e.target.value }))}
            />
          </div>

          <div className="quick-amounts">
            <p>クイック設定（残高）:</p>
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

          <div className="form-group">
            <label htmlFor="notes">メモ（任意）</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="ローンに関するメモを記録してください"
              rows={3}
            />
          </div>

          <div className="loan-preview">
            <h4>更新後のローン情報</h4>
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
              <div className="preview-item">
                <span className="preview-label">金利:</span>
                <span className="preview-value rate">
                  {formData.interestRate}%
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">月々の返済額:</span>
                <span className="preview-value payment">
                  {formatCurrency(parseFloat(formData.monthlyPayment) || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              キャンセル
            </button>
            <button type="submit" className="save-button">
              ローン情報を更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardLoanUpdateForm;
