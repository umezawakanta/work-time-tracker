import React, { useState, useEffect } from 'react';
import './ReportsComponent.css';
import type { SalaryRecord, WorkDiary } from '../types';

interface ReportsComponentProps {
  showReports: boolean;
  setShowReports: (show: boolean) => void;
  salaryRecords: SalaryRecord[];
  workDiaries: WorkDiary[];
  reportsLoading: boolean;
  reportSummary: any;
  loadReportSummary: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const ReportsComponent: React.FC<ReportsComponentProps> = ({
  showReports,
  setShowReports,
  salaryRecords,
  workDiaries,
  reportsLoading,
  reportSummary,
  loadReportSummary,
  closeOtherFeatures,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // レポートデータを計算する関数
  const calculateReportData = () => {
    const currentDate = new Date();
    const year = selectedYear;
    const month = selectedMonth;

    // 選択された期間のデータをフィルタリング
    const periodSalaryRecords = salaryRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
    });

    const periodWorkDiaries = workDiaries.filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getFullYear() === year && diaryDate.getMonth() + 1 === month;
    });

    // 基本統計を計算
    const totalSalary = periodSalaryRecords.length > 0 ? periodSalaryRecords.reduce((sum, record) => sum + (record.salary || 0), 0) : 0;
    const totalOvertime = 0; // overtimeプロパティが存在しないため0に設定
    const totalBonus = 0; // bonusプロパティが存在しないため0に設定
    const totalMiscellaneous = periodSalaryRecords.length > 0 ? periodSalaryRecords.reduce((sum, record) => sum + (record.miscellaneous || 0), 0) : 0;
    const totalOther = periodSalaryRecords.length > 0 ? periodSalaryRecords.reduce((sum, record) => sum + (record.other || 0), 0) : 0;

    // 日記の統計
    const totalDiaries = periodWorkDiaries.length;
    const averageMood = periodWorkDiaries.length > 0 
      ? periodWorkDiaries.reduce((sum, diary) => sum + (Number(diary.mood) || 0), 0) / periodWorkDiaries.length 
      : 0;

    // カテゴリ別の統計（activitiesプロパティが存在しないため無効化）
    const categoryStats = {} as Record<string, number>;

    return {
      totalSalary,
      totalOvertime,
      totalBonus,
      totalMiscellaneous,
      totalOther,
      totalDiaries,
      averageMood,
      categoryStats,
      recordCount: periodSalaryRecords.length,
      diaryCount: periodWorkDiaries.length
    };
  };

  const reportData = calculateReportData();

  // 年と月の選択肢を生成
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 期間変更時の処理
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (period === 'year') {
      setSelectedMonth(1); // 年選択時は月を1月にリセット
    }
  };

  // データの再計算
  useEffect(() => {
    if (showReports) {
      loadReportSummary();
    }
  }, [showReports, selectedYear, selectedMonth, loadReportSummary]);

  // 日時フォーマット関数
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '日付不明';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '無効な日付';
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 金額フォーマット関数
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  return (
    <div className="reports-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">📊</span>
          レポート
        </h2>
        <div className="section-controls">
          {showReports ? (
            <button
              onClick={() => setShowReports(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("reports");
                setShowReports(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showReports && (
        <div className="reports-content">
          <div className="reports-header">
            <button
              onClick={loadReportSummary}
              className="refresh-button"
              title="レポートを更新"
            >
              🔄
            </button>
          </div>

          {/* 期間選択 */}
          <div className="period-selector">
            <div className="period-tabs">
              <button
                className={`period-tab ${selectedPeriod === 'month' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('month')}
              >
                月別
              </button>
              <button
                className={`period-tab ${selectedPeriod === 'year' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('year')}
              >
                年別
              </button>
            </div>

            <div className="date-selector">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="year-select"
                aria-label="年を選択"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>

              {selectedPeriod === 'month' && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="month-select"
                  aria-label="月を選択"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {reportsLoading ? (
            <div className="data-loading">
              <div className="spinner"></div>
              <p>レポートを読み込み中...</p>
            </div>
          ) : (
            <div className="reports-grid">
              {/* 収入サマリー */}
              <div className="report-card income-summary">
                <h3>💰 収入サマリー</h3>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">基本給</span>
                    <span className="stat-value">{formatCurrency(reportData.totalSalary)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">残業代</span>
                    <span className="stat-value">{formatCurrency(reportData.totalOvertime)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">ボーナス</span>
                    <span className="stat-value">{formatCurrency(reportData.totalBonus)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">雑費</span>
                    <span className="stat-value">{formatCurrency(reportData.totalMiscellaneous)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">その他</span>
                    <span className="stat-value">{formatCurrency(reportData.totalOther)}</span>
                  </div>
                  <div className="stat-item total">
                    <span className="stat-label">合計</span>
                    <span className="stat-value">
                      {formatCurrency(
                        reportData.totalSalary + 
                        reportData.totalOvertime + 
                        reportData.totalBonus + 
                        reportData.totalMiscellaneous + 
                        reportData.totalOther
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 記録統計 */}
              <div className="report-card record-stats">
                <h3>📝 記録統計</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-icon">💼</div>
                    <div className="stat-content">
                      <span className="stat-number">{reportData.recordCount}</span>
                      <span className="stat-label">給与記録</span>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">📖</div>
                    <div className="stat-content">
                      <span className="stat-number">{reportData.diaryCount}</span>
                      <span className="stat-label">日記エントリ</span>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">😊</div>
                    <div className="stat-content">
                      <span className="stat-number">{reportData.averageMood.toFixed(1)}</span>
                      <span className="stat-label">平均気分</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 活動カテゴリ */}
              {Object.keys(reportData.categoryStats).length > 0 && (
                <div className="report-card activity-categories">
                  <h3>🏷️ 活動カテゴリ</h3>
                  <div className="category-list">
                    {Object.entries(reportData.categoryStats)
                      .sort(([,a], [,b]) => b - a)
                      .map(([category, count]) => (
                        <div key={category} className="category-item">
                          <span className="category-name">{category}</span>
                          <span className="category-count">{count}回</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 最近の記録 */}
              <div className="report-card recent-records">
                <h3>🕒 最近の記録</h3>
                <div className="recent-list">
                  {salaryRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((record, index) => (
                      <div key={record._id || index} className="recent-item">
                        <div className="recent-date">{formatDateTime(record.date)}</div>
                        <div className="recent-amount">{formatCurrency(record.salary || 0)}</div>
                        <div className="recent-type">給与記録</div>
                      </div>
                    ))}
                  {workDiaries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3)
                    .map((diary) => (
                      <div key={diary._id} className="recent-item">
                        <div className="recent-date">{formatDateTime(diary.date)}</div>
                        <div className="recent-content">{diary.title || '日記エントリ'}</div>
                        <div className="recent-type">日記</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* データなしの場合 */}
              {reportData.recordCount === 0 && reportData.diaryCount === 0 && (
                <div className="no-data-message">
                  <p>📝 選択された期間にデータがありません</p>
                  <p>給与記録や日記を入力してレポートを生成しましょう！</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsComponent;
