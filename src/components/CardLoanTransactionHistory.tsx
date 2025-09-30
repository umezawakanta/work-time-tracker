// カードローン取引履歴表示コンポーネント

import React, { useState, useEffect } from 'react';
import { CardLoanManager } from '../utils/cardLoanManager';
import { CardLoanTransaction, CardLoanAlert, CardLoan } from '../types/cardLoan';
import './CardLoanTransactionHistory.css';

interface CardLoanTransactionHistoryProps {
  userId: string;
  loanId: string;
  onClose: () => void;
}

const CardLoanTransactionHistory: React.FC<CardLoanTransactionHistoryProps> = ({
  userId,
  loanId,
  onClose
}) => {
  const [transactions, setTransactions] = useState<CardLoanTransaction[]>([]);
  const [alerts, setAlerts] = useState<CardLoanAlert[]>([]);
  const [loan, setLoan] = useState<CardLoan | null>(null);
  const [filter, setFilter] = useState<'all' | 'borrowing' | 'repayment' | 'interest_payment' | 'adjustment' | 'refinancing'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [isLoading, setIsLoading] = useState(true);

  const cardLoanManager = CardLoanManager.getInstance();

  useEffect(() => {
    loadData();
  }, [userId, loanId]);

  const loadData = () => {
    cardLoanManager.loadFromLocalStorage();
    const userTransactions = cardLoanManager.getTransactions(userId, loanId);
    const userAlerts = cardLoanManager.getAlerts(userId);
    const userLoan = cardLoanManager.getCardLoan(userId, loanId);

    setTransactions(userTransactions);
    setAlerts(userAlerts);
    setLoan(userLoan);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'high_debt': return '⚠️';
      case 'payment_due': return '📅';
      case 'overdue': return '🚨';
      case 'interest_rate_change': return '📊';
      case 'loan_updated': return '🔄';
      default: return 'ℹ️';
    }
  };

  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#2196f3';
      default: return '#666';
    }
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      if (filter === 'all') return true;
      return transaction.type === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.transactionDate.getTime() - a.transactionDate.getTime();
      } else {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
    });

  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm('この取引を削除しますか？')) {
      cardLoanManager.deleteTransaction(transactionId);
      loadData();
    }
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    cardLoanManager.markAlertAsRead(alertId);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="card-loan-transaction-history-overlay">
        <div className="card-loan-transaction-history loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="card-loan-transaction-history-overlay">
        <div className="card-loan-transaction-history error">
          <div className="error-content">
            <h3>エラー</h3>
            <p>ローン情報が見つかりません</p>
            <button onClick={onClose} className="cancel-button">
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-loan-transaction-history-overlay">
      <div className="card-loan-transaction-history">
        <div className="history-header">
          <h3>💳 {loan.bankName} {loan.branchName} 取引履歴</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="loan-summary">
          <div className="loan-info">
            <span className="loan-type">{loan.loanType}</span>
            <span className="loan-name">{loan.loanName}</span>
            <span className="loan-account">
              {loan.accountNumber ? `****${loan.accountNumber.slice(-4)}` : '口座番号未設定'}
            </span>
          </div>
          <div className="current-balance">
            <span className="balance-label">現在の残高:</span>
            <span className="balance-amount">
              {formatCurrency(loan.currentBalance)}
            </span>
          </div>
          <div className="loan-details">
            <div className="detail-item">
              <span className="detail-label">金利:</span>
              <span className="detail-value">{loan.interestRate}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">月々の返済額:</span>
              <span className="detail-value">{formatCurrency(loan.monthlyPayment)}</span>
            </div>
            {loan.nextPaymentDate && (
              <div className="detail-item">
                <span className="detail-label">次回返済日:</span>
                <span className="detail-value">{loan.nextPaymentDate.toLocaleDateString('ja-JP')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="history-controls">
          <div className="filter-controls">
            <label>フィルター:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              title="取引の種類でフィルター"
            >
              <option value="all">すべて</option>
              <option value="borrowing">借入</option>
              <option value="repayment">返済</option>
              <option value="interest_payment">利息支払い</option>
              <option value="adjustment">調整</option>
              <option value="refinancing">借り換え</option>
            </select>
          </div>

          <div className="sort-controls">
            <label>並び順:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              title="取引の並び順を選択"
            >
              <option value="date">日時</option>
              <option value="amount">金額</option>
            </select>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="alerts-section">
            <h4>アラート</h4>
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`alert-item ${alert.isRead ? 'read' : 'unread'}`}
                  style={{ borderLeftColor: getAlertSeverityColor(alert.severity) }}
                >
                  <div className="alert-icon">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <h5>{alert.title}</h5>
                      <span 
                        className="alert-severity"
                        style={{ color: getAlertSeverityColor(alert.severity) }}
                      >
                        {alert.severity === 'critical' ? '緊急' :
                         alert.severity === 'high' ? '高' : 
                         alert.severity === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    <div className="alert-meta">
                      <span className="alert-date">
                        {formatDate(alert.createdAt)}
                      </span>
                      {alert.dueDate && (
                        <span className="alert-due-date">
                          期限: {alert.dueDate.toLocaleDateString('ja-JP')}
                        </span>
                      )}
                      {!alert.isRead && (
                        <button
                          className="mark-read-button"
                          onClick={() => handleMarkAlertAsRead(alert.id)}
                        >
                          既読にする
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="transactions-section">
          <h4>取引履歴 ({filteredTransactions.length}件)</h4>
          <div className="transactions-list">
            {filteredTransactions.length === 0 ? (
              <div className="no-transactions">
                <p>取引履歴がありません</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-header">
                      <h5>{transaction.description}</h5>
                      <span className="transaction-type">
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </div>
                    <div className="transaction-meta">
                      <span className="transaction-date">
                        {formatDate(transaction.transactionDate)}
                      </span>
                      {transaction.category && (
                        <span className="transaction-category">
                          {transaction.category}
                        </span>
                      )}
                    </div>
                    <div className="transaction-balance">
                      残高: {formatCurrency(transaction.balanceAfter)}
                    </div>
                    {(transaction.principalAmount || transaction.interestAmount) && (
                      <div className="transaction-breakdown">
                        {transaction.principalAmount && (
                          <span className="breakdown-item">
                            元本: {formatCurrency(transaction.principalAmount)}
                          </span>
                        )}
                        {transaction.interestAmount && (
                          <span className="breakdown-item">
                            利息: {formatCurrency(transaction.interestAmount)}
                          </span>
                        )}
                      </div>
                    )}
                    {transaction.referenceNumber && (
                      <div className="transaction-reference">
                        参照番号: {transaction.referenceNumber}
                      </div>
                    )}
                  </div>
                  <div className="transaction-amount-section">
                    <div 
                      className={`transaction-amount ${transaction.type}`}
                    >
                      {transaction.type === 'repayment' || transaction.type === 'interest_payment' ? '-' : '+'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <button
                      className="delete-transaction-button"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardLoanTransactionHistory;
