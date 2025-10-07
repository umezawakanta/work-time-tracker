import React from 'react';
import { CalendarDayProps } from '../../types/calendar.types';
import { isToday, isSelected } from '../../hooks/useCalendar';

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isToday: isTodayProp,
  isSelected: isSelectedProp,
  incomeRecords,
  expenseRecords,
  workDiaries,
  onDateClick
}) => {
  const handleClick = () => {
    onDateClick(date);
  };

  const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalExpense = expenseRecords.reduce((sum, record) => sum + record.amount, 0);
  const hasDiary = workDiaries.length > 0;
  const hasRecords = incomeRecords.length > 0 || expenseRecords.length > 0;

  const dayClasses = [
    'calendar-day',
    !isCurrentMonth ? 'other-month' : '',
    isTodayProp ? 'today' : '',
    isSelectedProp ? 'selected' : '',
    hasRecords ? 'has-records' : '',
    hasDiary ? 'has-diary' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={dayClasses} onClick={handleClick}>
      <div className="day-number">
        {date.getDate()}
      </div>
      
      <div className="day-content">
        {hasRecords && (
          <div className="records-summary">
            {totalIncome > 0 && (
              <div className="income-amount">
                +¥{totalIncome.toLocaleString()}
              </div>
            )}
            {totalExpense > 0 && (
              <div className="expense-amount">
                -¥{totalExpense.toLocaleString()}
              </div>
            )}
          </div>
        )}
        
        {hasDiary && (
          <div className="diary-indicator">
            📝
          </div>
        )}
        
        {!hasRecords && !hasDiary && isCurrentMonth && (
          <div className="empty-day">
            <span className="add-record-hint">+</span>
          </div>
        )}
      </div>
      
      {hasRecords && (
        <div className="record-count">
          {incomeRecords.length + expenseRecords.length}件
        </div>
      )}
    </div>
  );
};

export default CalendarDay;
