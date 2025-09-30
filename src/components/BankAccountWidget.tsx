// 銀行口座表示ウィジェットコンポーネント

import React, { useState, useEffect } from 'react';
import { BankAccountManager } from '../utils/bankAccountManager';
import { BankAccount, BankAccountSummary, BankTransaction } from '../types/bankAccount';
import './BankAccountWidget.css';

interface BankAccountWidgetProps {
  userId: string;
  onUpdateBalance: (accountId: string) => void;
  onShowTransactions: (accountId: string) => void;
  onShowSettings: () => void;
}

const BankAccountWidget: React.FC<BankAccountWidgetProps> = ({
  userId,
  onUpdateBalance,
  onShowTransactions,
  onShowSettings
}) => {
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [summary, setSummary] = useState<BankAccountSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bankAccountManager = BankAccountManager.getInstance();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    bankAccountManager.loadFromLocalStorage();
    const userAccount = bankAccountManager.getBankAccount(userId);
    const userSummary = bankAccountManager.getBankAccountSummary(userId);
    const userTransactions = bankAccountManager.getTransactions(userId, userAccount?.id, 5);

    setAccount(userAccount);
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
    if (amount < 50000) return '#f44336'; // 赤
    if (amount < 200000) return '#ff9800'; // オレンジ
    return '#4caf50'; // 緑
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return '#4caf50'; // 緑
    if (change < 0) return '#f44336'; // 赤
    return '#666'; // グレー
  };

  const getChangeIcon = (change: number): string => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
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

  if (isLoading) {
    return (
      <div className="bank-account-widget loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bank-account-widget no-account">
        <div className="no-account-content">
          <h3>🏦 銀行口座が登録されていません</h3>
          <p>三井住友銀行大塚支店の口座を登録してください</p>
          <button 
            className="create-account-button"
            onClick={() => {
              // 口座作成フォームを開く処理
              const newAccount = bankAccountManager.createBankAccount(userId, {
                bankName: '三井住友銀行',
                branchName: '大塚支店',
                accountType: '普通',
                accountNumber: '',
                accountHolderName: '',
                currentBalance: 0,
                notes: '三井住友銀行大塚支店の普通預金口座'
              });
              loadData();
            }}
          >
            + 口座を登録
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-account-widget">
      <div className="widget-header">
        <h3>🏦 {account.bankName} {account.branchName}</h3>
        <div className="widget-actions">
          <button 
            className="action-button update"
            onClick={() => onUpdateBalance(account.id)}
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

      <div className="account-info">
        <div className="account-details">
          <span className="account-type">{account.accountType}預金</span>
          <span className="account-number">
            {account.accountNumber ? `****${account.accountNumber.slice(-4)}` : '口座番号未設定'}
          </span>
        </div>
        <div className="account-holder">
          {account.accountHolderName || '口座名義人未設定'}
        </div>
      </div>

      <div className="balance-display">
        <div 
          className="balance-amount"
          style={{ color: getBalanceColor(account.currentBalance) }}
        >
          {formatCurrency(account.currentBalance)}
        </div>
        <div className="balance-info">
          <span className="last-updated">
            最終更新: {formatDate(account.lastUpdated)}
          </span>
          {account.notes && (
            <span className="balance-notes">
              {account.notes}
            </span>
          )}
        </div>
      </div>

      {summary && (
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-label">月間変化</div>
            <div 
              className="stat-value"
              style={{ color: getChangeColor(summary.monthlyChange) }}
            >
              {getChangeIcon(summary.monthlyChange)}
              {formatCurrency(summary.monthlyChange)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">総入金</div>
            <div className="stat-value positive">
              {formatCurrency(summary.totalDeposits)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">総出金</div>
            <div className="stat-value negative">
              {formatCurrency(summary.totalWithdrawals)}
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
              onClick={() => onShowTransactions(account.id)}
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
                </div>
                <div 
                  className={`transaction-amount ${transaction.type}`}
                >
                  {transaction.type === 'withdrawal' || transaction.type === 'transfer_out' ? '-' : '+'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="widget-footer">
        <button 
          className="quick-withdrawal-button"
          onClick={() => {
            const amount = prompt('出金額を入力してください:');
            if (amount && !isNaN(Number(amount))) {
              const description = prompt('出金の説明を入力してください:') || '出金';
              bankAccountManager.recordWithdrawal(account.id, Number(amount), description);
              loadData();
            }
          }}
        >
          💸 出金を記録
        </button>
        <button 
          className="quick-deposit-button"
          onClick={() => {
            const amount = prompt('入金額を入力してください:');
            if (amount && !isNaN(Number(amount))) {
              const description = prompt('入金の説明を入力してください:') || '入金';
              bankAccountManager.recordDeposit(account.id, Number(amount), description);
              loadData();
            }
          }}
        >
          💰 入金を記録
        </button>
      </div>
    </div>
  );
};

export default BankAccountWidget;
