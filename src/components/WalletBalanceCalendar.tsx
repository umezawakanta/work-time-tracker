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
  const [displayMode, setDisplayMode] = useState<'total' | 'breakdown'>('total');
  const [amountFormat, setAmountFormat] = useState<'full' | 'thousands'>('full');

  const walletManager = WalletBalanceManager.getInstance();
  const bankAccountManager = BankAccountManager.getInstance();
  
  console.log('WalletBalanceHistory prop:', walletBalanceHistory);

  useEffect(() => {
    if (initialTransactions.length > 0) {
      setTransactions(initialTransactions);
    } else {
      loadTransactions();
    }
  }, [userId, initialTransactions]);

  // 銀行口座の総残高を計算（現在の残高）
  const getTotalBankBalance = () => {
    // ComprehensiveDashboardから渡されたbankAccountsを使用
    const accounts = bankAccounts || [];
    console.log('Bank accounts in calendar:', accounts);
    if (accounts && accounts.length > 0) {
      const total = accounts.reduce((total, account) => {
        const balance = account.currentBalance || 0;
        console.log('Account balance:', account.bankName, balance);
        return total + balance;
      }, 0);
      console.log('Total bank balance:', total);
      return total;
    }
    console.log('No bank accounts found');
    return 0;
  };

  // 指定日の銀行口座残高を計算（改善版）
  const getBankBalanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const accounts = bankAccounts || [];
    
    if (accounts.length === 0) {
      return 0;
    }

    let totalBankBalance = 0;
    
    accounts.forEach(account => {
      // 各口座の取引履歴を取得
      const accountTransactions = bankAccountManager.getTransactions(userId, account.id);
      
      // 現在の残高から開始
      let pastBalance = account.currentBalance || 0;
      
      // 指定日より後の取引を除外して計算
      const futureTransactions = accountTransactions.filter(transaction => {
        return transaction?.transactionDate && 
               new Date(transaction!.transactionDate).toISOString().split('T')[0] > dateStr;
      });

      // 未来の取引を差し引いて過去の残高を計算
      futureTransactions.forEach(transaction => {
        if (transaction && transaction.type && transaction.amount) {
          if (transaction.type === 'deposit' || transaction.type === 'transfer_in') {
            pastBalance -= transaction.amount;
          } else if (transaction.type === 'withdrawal' || transaction.type === 'transfer_out') {
            pastBalance += transaction.amount;
          }
        }
      });

      totalBankBalance += pastBalance;
    });

    console.log(`Bank balance for ${dateStr}: ${totalBankBalance}`);
    return totalBankBalance;
  };

  // 今日の財布残高を取得（履歴から最新の値を取得）
  const getCurrentWalletBalance = () => {
    if (walletBalanceHistory && walletBalanceHistory.length > 0) {
      // 履歴を日付順でソートして最新の値を取得
      const sortedHistory = [...walletBalanceHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      console.log('Latest wallet history:', sortedHistory[0]);
      return sortedHistory[0].amount;
    }
    // 履歴がない場合は従来の方法
    return walletBalance?.amount || 0;
  };

  // 指定日の各口座残高を取得（改善版）
  const getAccountBalancesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const accounts = bankAccounts || [];
    const walletHistory = getWalletBalanceHistoryForDate(date);
    const walletBalance = walletHistory ? walletHistory.amount : getCurrentWalletBalance();
    
    const accountBalances = accounts.map(account => {
      // 各口座の取引履歴を取得
      const accountTransactions = bankAccountManager.getTransactions(userId, account.id);
      
      // 現在の残高から開始
      let dateBalance = account.currentBalance || 0;
      
      // 指定日以降の取引を見つけて、それらを差し引く
      const futureTransactions = accountTransactions.filter(transaction => {
        return transaction?.transactionDate && 
               new Date(transaction!.transactionDate).toISOString().split('T')[0] > dateStr;
      });

      // 未来の取引を差し引いて過去の残高を計算
      futureTransactions.forEach(transaction => {
        if (transaction && transaction.type && transaction.amount) {
          if (transaction.type === 'deposit' || transaction.type === 'transfer_in') {
            dateBalance -= transaction.amount;
          } else if (transaction.type === 'withdrawal' || transaction.type === 'transfer_out') {
            dateBalance += transaction.amount;
          }
        }
      });

      return {
        id: account.id,
        name: account.bankName,
        branch: account.branchName,
        balance: dateBalance
      };
    });

    const totalBankBalance = accountBalances.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      wallet: {
        name: '財布',
        balance: walletBalance
      },
      accounts: accountBalances,
      total: walletBalance + totalBankBalance
    };
  };

  // 前日比を計算
  const getDailyChange = (date: Date) => {
    const today = getCumulativeBalance(date);
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayBalance = getCumulativeBalance(yesterday);
    
    const change = today - yesterdayBalance;
    const changePercent = yesterdayBalance !== 0 ? (change / Math.abs(yesterdayBalance)) * 100 : 0;
    
    return {
      amount: change,
      percent: changePercent,
      isPositive: change >= 0,
      isSignificant: Math.abs(changePercent) > 5 // 5%以上の変化を「重要」とする
    };
  };

  // 総残高（財布 + 銀行口座）を計算
  const getTotalBalance = () => {
    return getCurrentWalletBalance() + getTotalBankBalance();
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


  // 指定日の財布残高履歴を取得
  const getWalletBalanceHistoryForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    console.log(`Looking for wallet history on ${dateString}`);
    console.log('Available wallet history:', walletBalanceHistory);
    
    const history = walletBalanceHistory.find(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      console.log(`Comparing ${dateString} with ${entryDate}`);
      return entryDate === dateString;
    });
    
    console.log(`Wallet history for ${dateString}:`, history);
    return history;
  };

  const getCumulativeBalance = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // 指定日の財布残高履歴を取得
    const walletHistory = getWalletBalanceHistoryForDate(date);
    
    if (walletHistory) {
      // 財布残高履歴がある場合は、その日の残高を使用
      const bankBalance = getBankBalanceForDate(date);
      const total = walletHistory.amount + bankBalance;
      console.log(`Cumulative balance for ${dateStr}: wallet=${walletHistory.amount}, bank=${bankBalance}, total=${total}`);
      return total;
    }
    
    // 財布残高履歴がない場合は、指定日までの取引から計算
    const dayTransactions = transactions.filter(transaction => {
      if (!transaction || !transaction.date) return false;
      const transactionDate = new Date(transaction.date);
      return transactionDate.toISOString().split('T')[0] <= (dateStr || '');
    });

    // レシートの支出も含める
    const dayReceipts = receipts.filter(receipt => {
      if (!receipt || !receipt.purchaseDate) return false;
      const receiptDate = new Date(receipt.purchaseDate);
      return receiptDate.toISOString().split('T')[0] <= (dateStr || '');
    });

    // 初期残高（0から開始）
    let walletBalance = 0;
    
    // 指定日までの取引を時系列順で処理
    const allTransactions = [...dayTransactions, ...dayReceipts.map(receipt => ({
      id: receipt?.id || '',
      type: 'expense',
      amount: receipt?.totalAmount || 0,
      description: receipt?.storeName || '',
      category: 'レシート',
      date: receipt?.purchaseDate || ''
    }))];
    
    // 日付順でソート
    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 取引を順番に処理して残高を計算
    allTransactions.forEach(transaction => {
      if (transaction && transaction.type && transaction.amount) {
        if (transaction.type === 'income') {
          walletBalance += transaction.amount;
        } else {
          walletBalance -= transaction.amount;
        }
      }
    });

    // 銀行口座の残高を追加（指定日の残高を使用）
    const bankBalance = getBankBalanceForDate(date);
    
    console.log(`Cumulative balance for ${dateStr}: wallet=${walletBalance}, bank=${bankBalance}, total=${walletBalance + bankBalance}`);
    return walletBalance + bankBalance;
  };

  // 金額表示の最適化（千円単位オプション）
  const formatAmount = (amount: number): string => {
    if (amountFormat === 'thousands' && Math.abs(amount) >= 1000) {
      const thousands = Math.round(amount / 1000);
      return `¥${thousands.toLocaleString()}千`;
    }
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
      const cumulativeBalance = getCumulativeBalance(date);
      const accountBalances = getAccountBalancesForDate(date);
      
      days.push(
        <div key={`prev-${i}`} className="calendar-day prev-month">
          <span className="day-number">{date.getDate()}</span>
          <div className="daily-balance">
            {displayMode === 'total' ? (
              formatAmount(cumulativeBalance)
            ) : (
              <div className="balance-breakdown">
                <div className="balance-item wallet">
                  <span className="balance-label">💰</span>
                  <span className="balance-amount">{formatAmount(accountBalances.wallet.balance)}</span>
                </div>
                {accountBalances.accounts.slice(0, 2).map(account => (
                  <div key={account.id} className="balance-item account">
                    <span className="balance-label">{account.name.length > 4 ? account.name.substring(0, 4) + '...' : account.name}</span>
                    <span className="balance-amount">{formatAmount(account.balance)}</span>
                  </div>
                ))}
                {accountBalances.accounts.length > 2 && (
                  <div className="balance-item more">
                    <span className="balance-label">+{accountBalances.accounts.length - 2}</span>
                    <span className="balance-amount">...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTransactions = getTransactionsForDate(date);
      const dayReceipts = getReceiptsForDate(date);
      const cumulativeBalance = getCumulativeBalance(date);
      const walletHistory = getWalletBalanceHistoryForDate(date);
      const accountBalances = getAccountBalancesForDate(date);
      const dailyChange = getDailyChange(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasActivity = dayTransactions.length > 0 || dayReceipts.length > 0 || walletHistory;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasActivity ? 'has-transactions' : ''} ${dailyChange.isSignificant ? 'significant-change' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          <span className="day-number">{day}</span>
          <div className="daily-balance">
            {displayMode === 'total' ? (
              <div className="balance-total">
                <div className="balance-amount">{formatAmount(cumulativeBalance)}</div>
                {dailyChange.amount !== 0 && (
                  <div className={`change-indicator ${dailyChange.isPositive ? 'positive' : 'negative'}`}>
                    {dailyChange.isPositive ? '↗' : '↘'} {Math.abs(dailyChange.amount) >= 1000 ? 
                      `${Math.round(dailyChange.amount / 1000)}千` : 
                      `${Math.abs(dailyChange.amount)}円`
                    }
                  </div>
                )}
              </div>
            ) : (
              <div className="balance-breakdown">
                <div className="balance-item wallet">
                  <span className="balance-label">💰</span>
                  <span className="balance-amount">{formatAmount(accountBalances.wallet.balance)}</span>
                </div>
                {accountBalances.accounts.slice(0, 2).map(account => (
                  <div key={account.id} className="balance-item account">
                    <span className="balance-label">{account.name.length > 4 ? account.name.substring(0, 4) + '...' : account.name}</span>
                    <span className="balance-amount">{formatAmount(account.balance)}</span>
                  </div>
                ))}
                {accountBalances.accounts.length > 2 && (
                  <div className="balance-item more">
                    <span className="balance-label">+{accountBalances.accounts.length - 2}</span>
                    <span className="balance-amount">...</span>
                  </div>
                )}
                {dailyChange.amount !== 0 && (
                  <div className={`change-indicator ${dailyChange.isPositive ? 'positive' : 'negative'}`}>
                    {dailyChange.isPositive ? '↗' : '↘'} {Math.abs(dailyChange.amount) >= 1000 ? 
                      `${Math.round(dailyChange.amount / 1000)}千` : 
                      `${Math.abs(dailyChange.amount)}円`
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 次月の日付
    const totalCells = 42; // 6週間分
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      const cumulativeBalance = getCumulativeBalance(date);
      const accountBalances = getAccountBalancesForDate(date);
      
      days.push(
        <div key={`next-${i}`} className="calendar-day next-month">
          <span className="day-number">{date.getDate()}</span>
          <div className="daily-balance">
            {displayMode === 'total' ? (
              formatAmount(cumulativeBalance)
            ) : (
              <div className="balance-breakdown">
                <div className="balance-item wallet">
                  <span className="balance-label">💰</span>
                  <span className="balance-amount">{formatAmount(accountBalances.wallet.balance)}</span>
                </div>
                {accountBalances.accounts.slice(0, 2).map(account => (
                  <div key={account.id} className="balance-item account">
                    <span className="balance-label">{account.name.length > 4 ? account.name.substring(0, 4) + '...' : account.name}</span>
                    <span className="balance-amount">{formatAmount(account.balance)}</span>
                  </div>
                ))}
                {accountBalances.accounts.length > 2 && (
                  <div className="balance-item more">
                    <span className="balance-label">+{accountBalances.accounts.length - 2}</span>
                    <span className="balance-amount">...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  // 月間サマリーを計算
  const getMonthlySummary = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 月初の残高
    const firstDayBalances = getAccountBalancesForDate(firstDay);
    const monthStartBalance = firstDayBalances.total;
    
    // 月末の残高
    const lastDayBalances = getAccountBalancesForDate(lastDay);
    const monthEndBalance = lastDayBalances.total;
    
    // 月間の変化
    const monthlyChange = monthEndBalance - monthStartBalance;
    
    // 最高・最低残高を計算
    let maxBalance = monthStartBalance;
    let minBalance = monthStartBalance;
    let maxBalanceDate = firstDay;
    let minBalanceDate = firstDay;
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayBalances = getAccountBalancesForDate(date);
      if (dayBalances.total > maxBalance) {
        maxBalance = dayBalances.total;
        maxBalanceDate = date;
      }
      if (dayBalances.total < minBalance) {
        minBalance = dayBalances.total;
        minBalanceDate = date;
      }
    }
    
    return {
      monthStartBalance,
      monthEndBalance,
      monthlyChange,
      maxBalance,
      minBalance,
      maxBalanceDate,
      minBalanceDate
    };
  };

  return (
    <div className="wallet-balance-calendar">
      <div className="calendar-content">
        <div className="calendar-header">
          <h2>金融残高カレンダー</h2>
          <div className="balance-summary">
            <div className="balance-item">
              <span className="label">財布:</span>
              <span className="amount">{formatAmount(getCurrentWalletBalance())}</span>
            </div>
            <div className="balance-item">
              <span className="label">銀行:</span>
              <span className="amount">{formatAmount(getTotalBankBalance())}</span>
            </div>
            <div className="balance-item total">
              <span className="label">総残高:</span>
              <span className="amount">{formatAmount(getTotalBalance())}</span>
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
        
        <div className="display-mode-toggle">
          <button 
            className={`mode-button ${displayMode === 'total' ? 'active' : ''}`}
            onClick={() => setDisplayMode('total')}
          >
            合計表示
          </button>
          <button 
            className={`mode-button ${displayMode === 'breakdown' ? 'active' : ''}`}
            onClick={() => setDisplayMode('breakdown')}
          >
            口座別表示
          </button>
          <button 
            className={`mode-button ${amountFormat === 'thousands' ? 'active' : ''}`}
            onClick={() => setAmountFormat(amountFormat === 'thousands' ? 'full' : 'thousands')}
          >
            {amountFormat === 'thousands' ? '千円表示' : '通常表示'}
          </button>
        </div>

        {/* 月間サマリー */}
        {(() => {
          const summary = getMonthlySummary();
          return (
            <div className="monthly-summary">
              <h3>📊 {getMonthName(currentDate)}のサマリー</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">月初残高</span>
                  <span className="summary-amount">{formatAmount(summary.monthStartBalance)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">月末残高</span>
                  <span className="summary-amount">{formatAmount(summary.monthEndBalance)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">月間変化</span>
                  <span className={`summary-amount ${summary.monthlyChange >= 0 ? 'positive' : 'negative'}`}>
                    {summary.monthlyChange >= 0 ? '+' : ''}{formatAmount(summary.monthlyChange)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">最高残高</span>
                  <span className="summary-amount positive">
                    {formatAmount(summary.maxBalance)}
                    <small>（{summary.maxBalanceDate.getDate()}日）</small>
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">最低残高</span>
                  <span className="summary-amount negative">
                    {formatAmount(summary.minBalance)}
                    <small>（{summary.minBalanceDate.getDate()}日）</small>
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

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
                              {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
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
                              -{formatAmount(receipt.totalAmount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 銀行口座残高（選択日の実際の残高） */}
                  {(() => {
                    const selectedDateBalances = getAccountBalancesForDate(selectedDate);
                    if (selectedDateBalances.accounts && selectedDateBalances.accounts.length > 0) {
                      return (
                        <div className="bank-accounts-section">
                          <h4>🏦 銀行口座残高（{selectedDate.toLocaleDateString('ja-JP')}時点）</h4>
                          <div className="bank-accounts-list">
                            {selectedDateBalances.accounts.map((account) => (
                              <div key={account.id} className="bank-account-item">
                                <div className="bank-account-icon">🏦</div>
                                <div className="bank-account-info">
                                  <div className="bank-account-name">
                                    {account.name} {account.branch}
                                  </div>
                                </div>
                                <div className="bank-account-balance">
                                  {formatAmount(account.balance)}
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
                            残高: {formatAmount(walletHistory.amount)}
                          </div>
                          <div className={`wallet-history-change ${walletHistory.change >= 0 ? 'positive' : 'negative'}`}>
                            前日比: {walletHistory.change >= 0 ? '+' : ''}{formatAmount(walletHistory.change)}
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
              onClick={() => {/* 取引追加機能は後で実装 */}}
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
    </div>
  );
};

export default WalletBalanceCalendar;
