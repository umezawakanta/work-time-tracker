import React, { useState, useEffect } from 'react';
import { CalendarComponentProps, ViewMode } from '../types/calendar.types';
import { useCalendarDays, useWeekNavigation, useViewMode, isSelected } from '../hooks/useCalendar';
import CalendarHeader from './calendar/CalendarHeader';
import CalendarDay from './calendar/CalendarDay';
import RecordDetails from './calendar/RecordDetails';
import MonthlySummary from './calendar/MonthlySummary';
import MonthlyMemo from './calendar/MonthlyMemo';
import './CalendarComponent.css';

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateClick,
  getRecordsForDate,
  isModal = false,
  onClose,
  onViewModeChange,
  onWeekChange,
  selectedRecord,
  selectedRecordType,
  onEditIncomeExpense,
  onEditDiary,
  onDeleteIncomeExpense,
  onDeleteDiary,
  monthlySummary,
  weeklySummary,
  calendarViewMode = 'month',
  isSummaryExpanded = false,
  onToggleSummary,
  monthlyMemo,
  weeklyMemo,
  editingMonthlyMemo = false,
  editingWeeklyMemo = false,
  isMemoExpanded = false,
  onToggleMemo,
  onStartEditingMonthlyMemo,
  onCancelEditingMonthlyMemo,
  onSaveMonthlyMemo,
  onStartEditingWeeklyMemo,
  onCancelEditingWeeklyMemo,
  onSaveWeeklyMemo,
  onMonthlyMemoChange,
  onWeeklyMemoChange,
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(calendarViewMode);
  const { currentWeek, handleWeekChange, resetWeek } = useWeekNavigation(currentMonth, onWeekChange);
  
  const allDays = useCalendarDays(currentMonth);
  
  // ビューモードが変更されたときの処理
  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [viewMode, onViewModeChange]);
  
  // 月が変更されたときに週をリセット
  useEffect(() => {
    resetWeek();
  }, [currentMonth, resetWeek]);
  
  // 表示する日付を決定
  const displayDays = viewMode === 'week' 
    ? allDays.slice(currentWeek * 7, (currentWeek + 1) * 7)
    : allDays;
  
  // 現在のサマリーを決定
  const currentSummary = viewMode === 'week' ? weeklySummary : monthlySummary;
  
  // 現在のメモを決定
  const currentMemo = viewMode === 'week' ? weeklyMemo : monthlyMemo;
  const isCurrentMemoEditing = viewMode === 'week' ? editingWeeklyMemo : editingMonthlyMemo;
  const onStartEditingCurrentMemo = viewMode === 'week' ? onStartEditingWeeklyMemo : onStartEditingMonthlyMemo;
  const onCancelEditingCurrentMemo = viewMode === 'week' ? onCancelEditingWeeklyMemo : onCancelEditingMonthlyMemo;
  const onSaveCurrentMemo = viewMode === 'week' ? onSaveWeeklyMemo : onSaveMonthlyMemo;
  const onCurrentMemoChange = viewMode === 'week' ? onWeeklyMemoChange : onMonthlyMemoChange;
  
  return (
    <div className="work-records-calendar">
      <CalendarHeader
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onWeekChange={onWeekChange}
        isModal={isModal}
        onClose={onClose}
        onRefresh={onRefresh}
      />
      
      <div className="calendar-grid">
        {viewMode === 'month' && (
          <div className="calendar-weekdays">
            <div className="weekday">日</div>
            <div className="weekday">月</div>
            <div className="weekday">火</div>
            <div className="weekday">水</div>
            <div className="weekday">木</div>
            <div className="weekday">金</div>
            <div className="weekday">土</div>
          </div>
        )}
        
        <div className="calendar-days">
          {displayDays.map((day, index) => {
            const records = getRecordsForDate(day.date);
            return (
              <CalendarDay
                key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}-${index}`}
                date={day.date}
                isCurrentMonth={day.isCurrentMonth}
                isToday={day.isToday}
                isSelected={isSelected(day.date, selectedDate)}
                incomeRecords={records.incomeRecords}
                expenseRecords={records.expenseRecords}
                workDiaries={records.workDiaries}
                onDateClick={onDateClick}
              />
            );
          })}
        </div>
      </div>
      
      {selectedRecord && selectedRecordType && (
        <RecordDetails
          selectedRecord={selectedRecord}
          selectedRecordType={selectedRecordType}
          onEditIncomeExpense={onEditIncomeExpense}
          onEditDiary={onEditDiary}
          onDeleteIncomeExpense={onDeleteIncomeExpense}
          onDeleteDiary={onDeleteDiary}
        />
      )}
      
      {currentSummary && (
        <MonthlySummary
          summary={currentSummary}
          isExpanded={isSummaryExpanded}
          onToggle={onToggleSummary || (() => {})}
          viewMode={viewMode}
        />
      )}
      
      <MonthlyMemo
        memo={currentMemo}
        isExpanded={isMemoExpanded}
        onToggle={onToggleMemo || (() => {})}
        isEditing={isCurrentMemoEditing}
        onStartEditing={onStartEditingCurrentMemo || (() => {})}
        onCancelEditing={onCancelEditingCurrentMemo || (() => {})}
        onSave={onSaveCurrentMemo || (() => {})}
        onChange={onCurrentMemoChange || (() => {})}
        viewMode={viewMode}
      />
    </div>
  );
};

export default CalendarComponent;
