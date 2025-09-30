// 現金残高表示ウィジェットコンポーネント

import React, { useState, useEffect } from 'react';
import { CashBalanceManager } from '../utils/cashBalanceManager';
import { CashBalance, CashBalanceSummary, CashTransaction } from '../types/cashBalance';
import './CashBalanceWidget.css';

interface CashBalanceWidgetProps {
  userId: string;
  onUpdateBalance: () => void;
  onShowTransactions: () => void;
  onShowSettings: () => void;
}

const CashBalanceWidget: React.FC<CashBalanceWidgetProps> = ({
  userId,
  onUpdateBalance,
  onShowTransactions,
  onShowSettings
}) => {
  const [balance, setBalance] = useState<CashBalance | null>(null);
  const [summary, setSummary] = useState<CashBalanceSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<CashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cashBalanceManager = CashBalanceManager.getInstance();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    cashBalanceManager.loadFromLocalStorage();
    const userBalance = cashBalanceManager.getCashBalance(userId);
    const userSummary = cashBalanceManager.getCashBalanceSummary(userId);
    const userTransactions = cashBalanceManager.getTransactions(userId, 5);

    setBalance(userBalance);
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
    if (amount < 1000) return '#f44336'; // 赤
    if (amount < 5000) return '#ff9800'; // オレンジ
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

  if (isLoading) {
    return (
      <div className="cash-balance-widget loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!balance || !summary) {
    return (
      <div className="cash-balance-widget error">
        <p>データの読み込みに失敗しました</p>
      </div>
    );
  }

  return (
    <div className="cash-balance-widget">
      <div className="widget-header">
        <h3>💰 現金残高</h3>
        <div className="widget-actions">
          <button 
            className="action-button update"
            onClick={onUpdateBalance}
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

      <div className="balance-display">
        <div 
          className="balance-amount"
          style={{ color: getBalanceColor(balance.amount) }}
        >
          {formatCurrency(balance.amount)}
        </div>
        <div className="balance-info">
          <span className="last-updated">
            最終更新: {formatDate(balance.lastUpdated)}
          </span>
          {balance.notes && (
            <span className="balance-notes">
              {balance.notes}
            </span>
          )}
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-item">
          <div className="stat-label">週間変化</div>
          <div 
            className="stat-value"
            style={{ color: getChangeColor(summary.weeklyChange) }}
          >
            {getChangeIcon(summary.weeklyChange)}
            {formatCurrency(summary.weeklyChange)}
          </div>
        </div>
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
      </div>

      {recentTransactions.length > 0 && (
        <div className="recent-transactions">
          <div className="transactions-header">
            <h4>最近の取引</h4>
            <button 
              className="view-all-button"
              onClick={onShowTransactions}
            >
              すべて表示
            </button>
          </div>
          <div className="transactions-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {transaction.type === 'income' ? '💰' : 
                   transaction.type === 'expense' ? '💸' : '🔄'}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">
                    {transaction.description}
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
                </div>
                <div 
                  className={`transaction-amount ${transaction.type}`}
                >
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="widget-footer">
        <button 
          className="quick-expense-button"
          onClick={() => {
            // クイック支出記録の処理
            const amount = prompt('支出金額を入力してください:');
            if (amount && !isNaN(Number(amount))) {
              const description = prompt('支出の説明を入力してください:') || '支出';
              cashBalanceManager.recordExpense(userId, Number(amount), description);
              loadData();
              onUpdateBalance();
            }
          }}
        >
          💸 支出を記録
        </button>
        <button 
          className="quick-income-button"
          onClick={() => {
            // クイック収入記録の処理
            const amount = prompt('収入金額を入力してください:');
            if (amount && !isNaN(Number(amount))) {
              const description = prompt('収入の説明を入力してください:') || '収入';
              cashBalanceManager.recordIncome(userId, Number(amount), description);
              loadData();
              onUpdateBalance();
            }
          }}
        >
          💰 収入を記録
        </button>
      </div>
    </div>
  );
};

export default CashBalanceWidget;
