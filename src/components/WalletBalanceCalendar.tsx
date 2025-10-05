// 財布の残高カレンダーコンポーネント

import React, { useState, useEffect } from 'react';
import { WalletBalanceManager } from '../utils/walletBalanceManager';
import { BankAccountManager } from '../utils/bankAccountManager';
import { WalletTransaction } from '../types/walletBalance';
import { BankAccount } from '../types/bankAccount';
import './WalletBalanceCalendar.css';

interface WalletBalanceCalendarProps {
  userId: string;
  onClose: () => void;
  initialBalance?: number;
  transactions?: WalletTransaction[];
  bankAccounts?: BankAccount[];
  receipts?: any[];
  walletBalanceHistory?: any[];
}

const WalletBalanceCalendar: React.FC<WalletBalanceCalendarProps> = ({ 
  userId, 
  onClose, 
  initialBalance = 0, 
  transactions: initialTransactions = [],
  bankAccounts = [],
  receipts = [],
  walletBalanceHistory = []
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTransactions, setSelectedDateTransactions] = useState<WalletTransaction[]>([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const walletManager = WalletBalanceManager.getInstance();
  const bankAccountManager = BankAccountManager.getInstance();

  useEffect(() => {
    if (initialTransactions.length > 0) {
      setTransactions(initialTransactions);
    } else {
      loadTransactions();
    }
  }, [userId, initialTransactions]);

  // 銀行口座の総残高を計算
  const getTotalBankBalance = () => {
    // ComprehensiveDashboardから渡されたbankAccountsを使用
    const accounts = bankAccounts || [];
    console.log('Bank accounts in calendar:', accounts);
    if (accounts && accounts.length > 0) {
      const total = accounts.reduce((total, account) => {
        const balance = account.currentBalance || account.balance || 0;
        console.log('Account balance:', account.bankName, balance);
        return total + balance;
      }, 0);
      console.log('Total bank balance:', total);
      return total;
    }
    console.log('No bank accounts found');
    return 0;
  };

  // 総残高（財布 + 銀行口座）を計算
  const getTotalBalance = () => {
    return (walletBalance?.amount || 0) + getTotalBankBalance();
  };

  const loadTransactions = () => {
    walletManager.loadFromLocalStorage();
    const allTransactions = walletManager.getTransactions(userId);
    setTransactions(allTransactions);
  };

  // データを読み込み
  useEffect(() => {
    walletManager.loadFromLocalStorage();
    // 銀行口座データは既にComprehensiveDashboardで読み込まれているので、ここでは読み込まない
  }, [userId]);

  // 財布の残高を取得
  const walletBalance = walletManager.getWalletBalance(userId);
  console.log('Wallet balance in calendar:', walletBalance);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTransactionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.toISOString().split('T')[0] === dateStr;
    });
  };

  const getReceiptsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.purchaseDate);
      return receiptDate.toISOString().split('T')[0] === dateStr;
    });
  };

  const getDailyBalance = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.toISOString().split('T')[0] === dateStr;
    });

    // レシートの支出も含める
    const dayReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.purchaseDate);
      return receiptDate.toISOString().split('T')[0] === dateStr;
    });

    let balance = 0;
    dayTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
    });

    // レシートの支出を追加
    dayReceipts.forEach(receipt => {
      balance -= receipt.totalAmount;
    });

    return balance;
  };

  // 指定日の財布残高履歴を取得
  const getWalletBalanceHistoryForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return walletBalanceHistory.find(entry => 
      new Date(entry.date).toISOString().split('T')[0] === dateString
    );
  };

  const getCumulativeBalance = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.toISOString().split('T')[0] <= dateStr;
    });

    // レシートの支出も含める
    const dayReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.purchaseDate);
      return receiptDate.toISOString().split('T')[0] <= dateStr;
    });

    // 現在の財布の残高を基準に計算
    const currentWalletBalance = walletBalance?.amount || 0;
    
    // 指定日以降の取引を除外して残高を計算
    const futureTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.toISOString().split('T')[0] > dateStr;
    });

    const futureReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.purchaseDate);
      return receiptDate.toISOString().split('T')[0] > dateStr;
    });

    // 未来の取引を差し引いて過去の残高を計算
    let pastWalletBalance = currentWalletBalance;
    futureTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        pastWalletBalance -= transaction.amount;
      } else {
        pastWalletBalance += transaction.amount;
      }
    });

    futureReceipts.forEach(receipt => {
      pastWalletBalance += receipt.totalAmount;
    });

    // 銀行口座の残高を追加
    const bankBalance = getTotalBankBalance();
    
    return pastWalletBalance + bankBalance;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayTransactions = getTransactionsForDate(date);
    setSelectedDateTransactions(dayTransactions);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // 前月の日付
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), -i);
      days.push(
        <div key={`prev-${i}`} className="calendar-day prev-month">
          <span className="day-number">{date.getDate()}</span>
        </div>
      );
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTransactions = getTransactionsForDate(date);
      const dayReceipts = getReceiptsForDate(date);
      const dailyBalance = getDailyBalance(date);
      const cumulativeBalance = getCumulativeBalance(date);
      const walletHistory = getWalletBalanceHistoryForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasActivity = dayTransactions.length > 0 || dayReceipts.length > 0 || walletHistory;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasActivity ? 'has-transactions' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          <span className="day-number">{day}</span>
          {hasActivity && (
            <div className="day-transactions">
              <div className="transaction-count">
                {dayTransactions.length > 0 && `${dayTransactions.length}件`}
                {dayReceipts.length > 0 && `🏪${dayReceipts.length}件`}
                {walletHistory && '💰'}
              </div>
              <div className={`daily-balance ${dailyBalance >= 0 ? 'positive' : 'negative'}`}>
                {dailyBalance >= 0 ? '+' : ''}{formatCurrency(dailyBalance)}
              </div>
              {walletHistory && (
                <div className="wallet-history">
                  <div className="wallet-amount">
                    {formatCurrency(walletHistory.amount)}
                  </div>
                  <div className={`wallet-change ${walletHistory.change >= 0 ? 'positive' : 'negative'}`}>
                    {walletHistory.change >= 0 ? '+' : ''}{formatCurrency(walletHistory.change)}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className={`cumulative-balance ${cumulativeBalance !== 0 ? 'has-balance' : ''}`}>
            {formatCurrency(cumulativeBalance)}
          </div>
        </div>
      );
    }

    // 次月の日付
    const totalCells = 42; // 6週間分
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      days.push(
        <div key={`next-${i}`} className="calendar-day next-month">
          <span className="day-number">{date.getDate()}</span>
        </div>
      );
    }

    return days;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="wallet-balance-calendar">
      <div className="calendar-header">
        <h2>金融残高カレンダー</h2>
        <div className="balance-summary">
          <div className="balance-item">
            <span className="label">財布:</span>
            <span className="amount">{formatCurrency(walletBalance?.amount || 0)}</span>
          </div>
          <div className="balance-item">
            <span className="label">銀行:</span>
            <span className="amount">{formatCurrency(getTotalBankBalance())}</span>
          </div>
          <div className="balance-item total">
            <span className="label">総残高:</span>
            <span className="amount">{formatCurrency(getTotalBalance())}</span>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="calendar-navigation">
        <button onClick={() => navigateMonth('prev')}>← 前月</button>
        <h3>{getMonthName(currentDate)}</h3>
        <button onClick={() => navigateMonth('next')}>次月 →</button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div className="weekday">日</div>
          <div className="weekday">月</div>
          <div className="weekday">火</div>
          <div className="weekday">水</div>
          <div className="weekday">木</div>
          <div className="weekday">金</div>
          <div className="weekday">土</div>
        </div>
        <div className="calendar-days">
          {renderCalendar()}
        </div>
      </div>

      {selectedDate && (
        <div className="selected-date-info">
          <h3>{selectedDate.toLocaleDateString('ja-JP')} の取引・レシート・財布残高</h3>
          {(() => {
            const dayTransactions = getTransactionsForDate(selectedDate);
            const dayReceipts = getReceiptsForDate(selectedDate);
            const walletHistory = getWalletBalanceHistoryForDate(selectedDate);
            const hasActivity = dayTransactions.length > 0 || dayReceipts.length > 0 || walletHistory;

            if (!hasActivity) {
              return <p>この日の取引・レシートはありません</p>;
            }

            return (
              <div className="activity-list">
                {/* 取引 */}
                {dayTransactions.length > 0 && (
                  <div className="transactions-section">
                    <h4>💰 取引</h4>
                    <div className="transactions-list">
                      {dayTransactions.map((transaction) => (
                        <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                          <div className="transaction-icon">
                            {transaction.type === 'income' ? '💰' : '💸'}
                          </div>
                          <div className="transaction-info">
                            <div className="transaction-description">{transaction.description}</div>
                            <div className="transaction-category">{transaction.category}</div>
                          </div>
                          <div className={`transaction-amount ${transaction.type}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* レシート */}
                {dayReceipts.length > 0 && (
                  <div className="receipts-section">
                    <h4>🏪 レシート</h4>
                    <div className="receipts-list">
                      {dayReceipts.map((receipt) => (
                        <div key={receipt.id} className="receipt-item">
                          <div className="receipt-icon">🏪</div>
                          <div className="receipt-info">
                            <div className="receipt-store">{receipt.storeName}</div>
                            <div className="receipt-items">
                              {receipt.items.slice(0, 2).join(', ')}
                              {receipt.items.length > 2 && ` 他${receipt.items.length - 2}件`}
                            </div>
                          </div>
                          <div className="receipt-amount">
                            -{formatCurrency(receipt.totalAmount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 銀行口座残高 */}
                {(() => {
                  const accounts = bankAccountManager.getBankAccounts(userId);
                  if (accounts && accounts.length > 0) {
                    return (
                      <div className="bank-accounts-section">
                        <h4>🏦 銀行口座残高</h4>
                        <div className="bank-accounts-list">
                          {accounts.map((account) => (
                            <div key={account.id} className="bank-account-item">
                              <div className="bank-account-icon">🏦</div>
                              <div className="bank-account-info">
                                <div className="bank-account-name">
                                  {account.bankName} {account.branchName}
                                </div>
                                <div className="bank-account-type">
                                  {account.accountType} {account.accountNumber}
                                </div>
                              </div>
                              <div className="bank-account-balance">
                                {formatCurrency(account.currentBalance || account.balance || 0)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 財布残高履歴 */}
                {walletHistory && (
                  <div className="wallet-history-section">
                    <h4>💰 財布残高履歴</h4>
                    <div className="wallet-history-item">
                      <div className="wallet-history-icon">💰</div>
                      <div className="wallet-history-info">
                        <div className="wallet-history-amount">
                          残高: {formatCurrency(walletHistory.amount)}
                        </div>
                        <div className={`wallet-history-change ${walletHistory.change >= 0 ? 'positive' : 'negative'}`}>
                          前日比: {walletHistory.change >= 0 ? '+' : ''}{formatCurrency(walletHistory.change)}
                        </div>
                        {walletHistory.notes && (
                          <div className="wallet-history-notes">
                            メモ: {walletHistory.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <button 
            className="add-transaction-button"
            onClick={() => setShowAddTransaction(true)}
          >
            + 取引を追加
          </button>
        </div>
      )}

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color has-transactions"></div>
          <span>取引あり</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>今日</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>選択中</span>
        </div>
      </div>
    </div>
  );
};

export default WalletBalanceCalendar;
