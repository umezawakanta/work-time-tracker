// 財布の残高カレンダーコンポーネント

import React, { useState, useEffect } from 'react';
import { WalletBalanceManager } from '../utils/walletBalanceManager';
import { WalletTransaction } from '../types/walletBalance';
import './WalletBalanceCalendar.css';

interface WalletBalanceCalendarProps {
  userId: string;
  onClose: () => void;
  initialBalance?: number;
  transactions?: WalletTransaction[];
}

const WalletBalanceCalendar: React.FC<WalletBalanceCalendarProps> = ({ 
  userId, 
  onClose, 
  initialBalance = 0, 
  transactions: initialTransactions = [] 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTransactions, setSelectedDateTransactions] = useState<WalletTransaction[]>([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const walletManager = WalletBalanceManager.getInstance();

  useEffect(() => {
    if (initialTransactions.length > 0) {
      setTransactions(initialTransactions);
    } else {
      loadTransactions();
    }
  }, [userId, currentDate, initialTransactions]);

  const loadTransactions = () => {
    walletManager.loadFromLocalStorage();
    const allTransactions = walletManager.getTransactions(userId);
    setTransactions(allTransactions);
  };

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

  const getDailyBalance = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.toISOString().split('T')[0] === dateStr;
    });

    let balance = 0;
    dayTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
    });

    return balance;
  };

  const getCumulativeBalance = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.toISOString().split('T')[0] <= dateStr;
    });

    let balance = initialBalance;
    dayTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
    });

    return balance;
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
      const dailyBalance = getDailyBalance(date);
      const cumulativeBalance = getCumulativeBalance(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayTransactions.length > 0 ? 'has-transactions' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          <span className="day-number">{day}</span>
          {dayTransactions.length > 0 && (
            <div className="day-transactions">
              <div className="transaction-count">{dayTransactions.length}件</div>
              <div className={`daily-balance ${dailyBalance >= 0 ? 'positive' : 'negative'}`}>
                {dailyBalance >= 0 ? '+' : ''}{formatCurrency(dailyBalance)}
              </div>
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
        <h2>財布の残高カレンダー</h2>
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
          <h3>{selectedDate.toLocaleDateString('ja-JP')} の取引</h3>
          {selectedDateTransactions.length > 0 ? (
            <div className="transactions-list">
              {selectedDateTransactions.map((transaction) => (
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
          ) : (
            <p>この日の取引はありません</p>
          )}
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
