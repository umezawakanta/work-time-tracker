// 現金取引履歴表示コンポーネント

import React, { useState, useEffect } from 'react';
import { CashBalanceManager } from '../utils/cashBalanceManager';
import { CashTransaction, CashBalanceAlert } from '../types/cashBalance';
import './CashTransactionHistory.css';

interface CashTransactionHistoryProps {
  userId: string;
  onClose: () => void;
}

const CashTransactionHistory: React.FC<CashTransactionHistoryProps> = ({
  userId,
  onClose
}) => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [alerts, setAlerts] = useState<CashBalanceAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'adjustment'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [isLoading, setIsLoading] = useState(true);

  const cashBalanceManager = CashBalanceManager.getInstance();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    cashBalanceManager.loadFromLocalStorage();
    const userTransactions = cashBalanceManager.getTransactions(userId);
    const userAlerts = cashBalanceManager.getAlerts(userId);

    setTransactions(userTransactions);
    setAlerts(userAlerts);
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
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'adjustment': return '🔄';
      default: return '📝';
    }
  };

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case 'income': return '収入';
      case 'expense': return '支出';
      case 'adjustment': return '調整';
      default: return 'その他';
    }
  };

  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'low_balance': return '⚠️';
      case 'high_expense': return '💸';
      case 'unusual_activity': return '🔍';
      default: return 'ℹ️';
    }
  };

  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
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
        return b.date.getTime() - a.date.getTime();
      } else {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
    });

  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm('この取引を削除しますか？')) {
      cashBalanceManager.deleteTransaction(transactionId);
      loadData();
    }
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    cashBalanceManager.markAlertAsRead(alertId);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="cash-transaction-history-overlay">
        <div className="cash-transaction-history loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cash-transaction-history-overlay">
      <div className="cash-transaction-history">
        <div className="history-header">
          <h3>現金取引履歴</h3>
          <button className="close-button" onClick={onClose}>×</button>
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
              <option value="income">収入</option>
              <option value="expense">支出</option>
              <option value="adjustment">調整</option>
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
                        {alert.severity === 'high' ? '高' : 
                         alert.severity === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    <div className="alert-meta">
                      <span className="alert-date">
                        {formatDate(alert.createdAt)}
                      </span>
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
                        {formatDate(transaction.date)}
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
                  </div>
                  <div className="transaction-amount-section">
                    <div 
                      className={`transaction-amount ${transaction.type}`}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}
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

export default CashTransactionHistory;
