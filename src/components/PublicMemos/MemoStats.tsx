import React from 'react';
import { getPublicMemoCounts, getMonthlyStats, getWeeklyStats } from '../../utils/memoHelpers';
import { getCalendarDays, getMemosForDate } from '../../utils/calendarHelpers';
import type { Memo } from '../../types';

interface MemoStatsProps {
  memos: Memo[];
  currentMonth: Date;
  viewMode: 'month' | 'week';
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const MemoStats: React.FC<MemoStatsProps> = ({
  memos,
  currentMonth,
  viewMode,
  selectedDate,
  onDateSelect
}) => {
  const counts = getPublicMemoCounts(memos);
  const monthlyStats = getMonthlyStats(memos, currentMonth);
  const weeklyStats = getWeeklyStats(memos, currentMonth);
  const calendarDays = getCalendarDays(currentMonth);

  const stats = viewMode === 'week' ? weeklyStats : monthlyStats;

  return (
    <div className="memo-stats">
      <div className="stats-header">
        <h3>📊 統計</h3>
        <div className="view-mode-info">
          {viewMode === 'month' ? '月次' : '週次'}統計
        </div>
      </div>

      <div className="stats-content">
        {/* 基本統計 */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">総メモ数</div>
            <div className="stat-value total">{counts.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">エラー報告</div>
            <div className="stat-value error">{counts.errorReports}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">更新依頼</div>
            <div className="stat-value update">{counts.updateRequests}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">一般</div>
            <div className="stat-value general">{counts.general}</div>
          </div>
        </div>

        {/* ステータス統計 */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">解決済み</div>
            <div className="stat-value resolved">{stats.resolved}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">対応中</div>
            <div className="stat-value in-progress">{stats.inProgress}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">保留中</div>
            <div className="stat-value pending">{stats.pending}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">解決率</div>
            <div className="stat-value resolution">
              {stats.resolutionRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* カレンダー表示 */}
        <div className="stats-calendar">
          <h4>カレンダー</h4>
          <div className="calendar-grid">
            {calendarDays.map((date, index) => {
              const dayMemos = getMemosForDate(memos, date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

              return (
                <div
                  key={index}
                  className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                  onClick={() => onDateSelect(date)}
                >
                  <div className="day-number">{date.getDate()}</div>
                  {dayMemos.length > 0 && (
                    <div className="day-memos">
                      <span className="memo-count">{dayMemos.length}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoStats;

