// カードローン表示ウィジェットコンポーネント

import React, { useState, useEffect } from 'react';
import { CardLoanManager } from '../utils/cardLoanManager';
import { CardLoan, CardLoanSummary, CardLoanTransaction } from '../types/cardLoan';
import './CardLoanWidget.css';

interface CardLoanWidgetProps {
  userId: string;
  onUpdateBalance: (loanId: string) => void;
  onShowTransactions: (loanId: string) => void;
  onShowSettings: () => void;
}

const CardLoanWidget: React.FC<CardLoanWidgetProps> = ({
  userId,
  onUpdateBalance,
  onShowTransactions,
  onShowSettings
}) => {
  const [loan, setLoan] = useState<CardLoan | null>(null);
  const [summary, setSummary] = useState<CardLoanSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<CardLoanTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cardLoanManager = CardLoanManager.getInstance();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    cardLoanManager.loadFromLocalStorage();
    const userLoan = cardLoanManager.getCardLoan(userId);
    const userSummary = cardLoanManager.getCardLoanSummary(userId);
    const userTransactions = cardLoanManager.getTransactions(userId, userLoan?.id, 5);

    setLoan(userLoan);
    setSummary(userSummary);
    setRecentTransactions(userTransactions);
    setIsLoading(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getBalanceColor = (amount: number): string => {
    if (amount > 1000000) return '#f44336'; // 赤（高負債）
    if (amount > 500000) return '#ff9800'; // オレンジ（中負債）
    return '#4caf50'; // 緑（低負債）
  };

  const getLoanTypeIcon = (type: string): string => {
    switch (type) {
      case 'card_loan': return '💳';
      case 'personal_loan': return '👤';
      case 'housing_loan': return '🏠';
      case 'education_loan': return '🎓';
      default: return '💰';
    }
  };

  const getLoanTypeLabel = (type: string): string => {
    switch (type) {
      case 'card_loan': return 'カードローン';
      case 'personal_loan': return '個人ローン';
      case 'housing_loan': return '住宅ローン';
      case 'education_loan': return '教育ローン';
      default: return 'ローン';
    }
  };

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'borrowing': return '📈';
      case 'repayment': return '📉';
      case 'interest_payment': return '💰';
      case 'adjustment': return '🔄';
      case 'refinancing': return '🔄';
      default: return '📝';
    }
  };

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case 'borrowing': return '借入';
      case 'repayment': return '返済';
      case 'interest_payment': return '利息支払い';
      case 'adjustment': return '調整';
      case 'refinancing': return '借り換え';
      default: return 'その他';
    }
  };

  if (isLoading) {
    return (
      <div className="card-loan-widget loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="card-loan-widget no-loan">
        <div className="no-loan-content">
          <h3>💳 カードローンが登録されていません</h3>
          <p>三井住友銀行大塚支店のカードローンを登録してください</p>
          <button 
            className="create-loan-button"
            onClick={() => {
              // ローン作成フォームを開く処理
              const newLoan = cardLoanManager.createCardLoan(userId, {
                bankName: '三井住友銀行',
                branchName: '大塚支店',
                loanType: 'card_loan',
                loanName: 'カードローン',
                accountNumber: '',
                accountHolderName: '',
                currentBalance: 0,
                originalAmount: 0,
                interestRate: 14.0,
                monthlyPayment: 0,
                notes: '三井住友銀行大塚支店のカードローン'
              });
              loadData();
            }}
          >
            + ローンを登録
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-loan-widget">
      <div className="widget-header">
        <h3>💳 {loan.bankName} {loan.branchName}</h3>
        <div className="widget-actions">
          <button 
            className="action-button update"
            onClick={() => onUpdateBalance(loan.id)}
            title="残高を更新"
          >
            ✏️
          </button>
          <button 
            className="action-button settings"
            onClick={onShowSettings}
            title="設定"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div className="loan-info">
        <div className="loan-details">
          <span className="loan-type">
            {getLoanTypeIcon(loan.loanType)} {getLoanTypeLabel(loan.loanType)}
          </span>
          <span className="loan-name">{loan.loanName}</span>
        </div>
        <div className="loan-account">
          {loan.accountNumber ? `****${loan.accountNumber.slice(-4)}` : '口座番号未設定'}
        </div>
        <div className="loan-holder">
          {loan.accountHolderName || '口座名義人未設定'}
        </div>
      </div>

      <div className="balance-display">
        <div 
          className="balance-amount"
          style={{ color: getBalanceColor(loan.currentBalance) }}
        >
          {formatCurrency(loan.currentBalance)}
        </div>
        <div className="balance-info">
          <span className="last-updated">
            最終更新: {formatDate(loan.lastUpdated)}
          </span>
          {loan.notes && (
            <span className="balance-notes">
              {loan.notes}
            </span>
          )}
        </div>
      </div>

      <div className="loan-details-grid">
        <div className="detail-item">
          <div className="detail-label">当初借入額</div>
          <div className="detail-value">
            {formatCurrency(loan.originalAmount)}
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-label">金利</div>
          <div className="detail-value interest-rate">
            {loan.interestRate}%
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-label">月々の返済額</div>
          <div className="detail-value">
            {formatCurrency(loan.monthlyPayment)}
          </div>
        </div>
        {loan.nextPaymentDate && (
          <div className="detail-item">
            <div className="detail-label">次回返済日</div>
            <div className="detail-value next-payment">
              {loan.nextPaymentDate.toLocaleDateString('ja-JP')}
            </div>
          </div>
        )}
      </div>

      {summary && summary.loanCount > 1 && (
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-label">総負債額</div>
            <div className="stat-value total-debt">
              {formatCurrency(summary.totalDebt)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">月々の総返済額</div>
            <div className="stat-value monthly-total">
              {formatCurrency(summary.monthlyTotalPayment)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均金利</div>
            <div className="stat-value avg-rate">
              {summary.averageInterestRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {recentTransactions.length > 0 && (
        <div className="recent-transactions">
          <div className="transactions-header">
            <h4>最近の取引</h4>
            <button 
              className="view-all-button"
              onClick={() => onShowTransactions(loan.id)}
            >
              すべて表示
            </button>
          </div>
          <div className="transactions-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">
                    {transaction.description}
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-type">
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                    <span className="transaction-date">
                      {formatDate(transaction.transactionDate)}
                    </span>
                    {transaction.category && (
                      <span className="transaction-category">
                        {transaction.category}
                      </span>
                    )}
                  </div>
                  {transaction.principalAmount && transaction.interestAmount && (
                    <div className="transaction-breakdown">
                      元本: {formatCurrency(transaction.principalAmount)} / 
                      利息: {formatCurrency(transaction.interestAmount)}
                    </div>
                  )}
                </div>
                <div 
                  className={`transaction-amount ${transaction.type}`}
                >
                  {transaction.type === 'repayment' || transaction.type === 'interest_payment' ? '-' : '+'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="widget-footer">
        <button 
          className="quick-repayment-button"
          onClick={() => {
            const amount = prompt('返済金額を入力してください:');
            if (amount && !isNaN(Number(amount))) {
              const description = prompt('返済の説明を入力してください:') || '返済';
              const principalAmount = prompt('元本金額を入力してください（任意）:');
              const interestAmount = prompt('利息金額を入力してください（任意）:');
              cardLoanManager.recordRepayment(
                loan.id, 
                Number(amount), 
                description,
                undefined,
                principalAmount ? Number(principalAmount) : undefined,
                interestAmount ? Number(interestAmount) : undefined
              );
              loadData();
            }
          }}
        >
          💰 返済を記録
        </button>
        <button 
          className="quick-borrowing-button"
          onClick={() => {
            const amount = prompt('借入金額を入力してください:');
            if (amount && !isNaN(Number(amount))) {
              const description = prompt('借入の説明を入力してください:') || '借入';
              cardLoanManager.recordBorrowing(loan.id, Number(amount), description);
              loadData();
            }
          }}
        >
          📈 借入を記録
        </button>
      </div>
    </div>
  );
};

export default CardLoanWidget;
