import React from 'react';
import { CalendarHeaderProps } from '../../types/calendar.types';
import { getMonthName } from '../../hooks/useCalendar';

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  onMonthChange,
  viewMode,
  onViewModeChange,
  onWeekChange,
  isModal = false,
  onClose,
  onRefresh
}) => {
  const handlePrevMonth = () => {
    onMonthChange('prev');
  };

  const handleNextMonth = () => {
    onMonthChange('next');
  };

  const handleViewModeChange = (mode: 'month' | 'week') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (onWeekChange) {
      const weekStart = new Date(currentMonth);
      const currentWeekStart = weekStart.getDate() - weekStart.getDay();
      const newWeekStart = new Date(weekStart);
      newWeekStart.setDate(currentWeekStart + (direction === 'next' ? 7 : -7));
      onWeekChange(newWeekStart);
    }
  };

  return (
    <div className="calendar-header">
      <div className="calendar-title">
        <h2>{getMonthName(currentMonth)}</h2>
        {isModal && onClose && (
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      
      <div className="calendar-controls">
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('month')}
          >
            月表示
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('week')}
          >
            週表示
          </button>
        </div>
        
        <div className="navigation-controls">
          {viewMode === 'month' ? (
            <>
              <button className="nav-button" onClick={handlePrevMonth}>
                ← 前月
              </button>
              <button className="nav-button" onClick={handleNextMonth}>
                次月 →
              </button>
            </>
          ) : (
            <>
              <button className="nav-button" onClick={() => handleWeekChange('prev')}>
                ← 前週
              </button>
              <button className="nav-button" onClick={() => handleWeekChange('next')}>
                次週 →
              </button>
            </>
          )}
        </div>
        
        {onRefresh && (
          <button className="refresh-button" onClick={onRefresh}>
            🔄 更新
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
