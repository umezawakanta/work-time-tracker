// 銀行取引履歴表示コンポーネント

import React, { useState, useEffect } from 'react';
import { BankAccountManager } from '../utils/bankAccountManager';
import { BankTransaction, BankAccountAlert, BankAccount } from '../types/bankAccount';
import './BankTransactionHistory.css';

interface BankTransactionHistoryProps {
  userId: string;
  accountId: string;
  onClose: () => void;
}

const BankTransactionHistory: React.FC<BankTransactionHistoryProps> = ({
  userId,
  accountId,
  onClose
}) => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [alerts, setAlerts] = useState<BankAccountAlert[]>([]);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'adjustment'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [isLoading, setIsLoading] = useState(true);

  const bankAccountManager = BankAccountManager.getInstance();

  useEffect(() => {
    loadData();
  }, [userId, accountId]);

  const loadData = () => {
    bankAccountManager.loadFromLocalStorage();
    const userTransactions = bankAccountManager.getTransactions(userId, accountId);
    const userAlerts = bankAccountManager.getAlerts(userId);
    const userAccount = bankAccountManager.getBankAccount(userId, accountId);

    setTransactions(userTransactions);
    setAlerts(userAlerts);
    setAccount(userAccount);
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
      case 'deposit': return '📈';
      case 'withdrawal': return '📉';
      case 'transfer_in': return '↗️';
      case 'transfer_out': return '↘️';
      case 'adjustment': return '🔄';
      default: return '📝';
    }
  };

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case 'deposit': return '入金';
      case 'withdrawal': return '出金';
      case 'transfer_in': return '振込入金';
      case 'transfer_out': return '振込出金';
      case 'adjustment': return '調整';
      default: return 'その他';
    }
  };

  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'low_balance': return '⚠️';
      case 'high_withdrawal': return '💸';
      case 'unusual_activity': return '🔍';
      case 'account_updated': return '🔄';
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
        return b.transactionDate.getTime() - a.transactionDate.getTime();
      } else {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
    });

  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm('この取引を削除しますか？')) {
      bankAccountManager.deleteTransaction(transactionId);
      loadData();
    }
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    bankAccountManager.markAlertAsRead(alertId);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="bank-transaction-history-overlay">
        <div className="bank-transaction-history loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bank-transaction-history-overlay">
        <div className="bank-transaction-history error">
          <div className="error-content">
            <h3>エラー</h3>
            <p>口座情報が見つかりません</p>
            <button onClick={onClose} className="cancel-button">
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-transaction-history-overlay">
      <div className="bank-transaction-history">
        <div className="history-header">
          <h3>🏦 {account.bankName} {account.branchName} 取引履歴</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="account-summary">
          <div className="account-info">
            <span className="account-type">{account.accountType}預金</span>
            <span className="account-number">
              {account.accountNumber ? `****${account.accountNumber.slice(-4)}` : '口座番号未設定'}
            </span>
          </div>
          <div className="current-balance">
            <span className="balance-label">現在の残高:</span>
            <span className="balance-amount">
              {formatCurrency(account.currentBalance)}
            </span>
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
              <option value="deposit">入金</option>
              <option value="withdrawal">出金</option>
              <option value="transfer_in">振込入金</option>
              <option value="transfer_out">振込出金</option>
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
                        {formatDate(transaction.transactionDate)}
                      </span>
                      {transaction.category && (
                        <span className="transaction-category">
                          {transaction.category}
                        </span>
                      )}
                      {transaction.counterparty && (
                        <span className="transaction-counterparty">
                          {transaction.counterparty}
                        </span>
                      )}
                    </div>
                    <div className="transaction-balance">
                      残高: {formatCurrency(transaction.balanceAfter)}
                    </div>
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
                      {transaction.type === 'withdrawal' || transaction.type === 'transfer_out' ? '-' : '+'}
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

export default BankTransactionHistory;
