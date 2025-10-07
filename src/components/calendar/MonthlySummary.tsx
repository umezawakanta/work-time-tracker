import React from 'react';
import { MonthlySummaryProps } from '../../types/calendar.types';

const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  summary,
  isExpanded,
  onToggle,
  viewMode
}) => {
  if (!summary) {
    return null;
  }

  const viewModeText = viewMode === 'month' ? '月次' : '週次';
  const netIncomeClass = summary.netIncome >= 0 ? 'positive' : 'negative';

  return (
    <div className="monthly-summary">
      <div className="summary-header" onClick={onToggle}>
        <h3>📊 {viewModeText}統計</h3>
        <button className={`toggle-button ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="summary-content">
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">収入合計</div>
              <div className="summary-value income">
                +¥{summary.totalIncome.toLocaleString()}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">支出合計</div>
              <div className="summary-value expense">
                -¥{summary.totalExpense.toLocaleString()}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">純収入</div>
              <div className={`summary-value ${netIncomeClass}`}>
                {summary.netIncome >= 0 ? '+' : ''}¥{summary.netIncome.toLocaleString()}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">平均気分</div>
              <div className="summary-value mood">
                {getMoodEmoji(summary.averageMood)} {summary.averageMood.toFixed(1)}/5
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">総勤務時間</div>
              <div className="summary-value work-hours">
                {summary.totalWorkHours}時間
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">平均生産性</div>
              <div className="summary-value productivity">
                {getProductivityText(summary.averageProductivity)} ({summary.averageProductivity.toFixed(1)}/5)
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">記録数</div>
              <div className="summary-value records">
                {summary.recordCount}件
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">日記数</div>
              <div className="summary-value diaries">
                {summary.diaryCount}件
              </div>
            </div>
          </div>
          
          <div className="summary-insights">
            {getInsights(summary)}
          </div>
        </div>
      )}
    </div>
  );
};

const getMoodEmoji = (mood: number): string => {
  if (mood >= 4) return '😊';
  if (mood >= 3) return '😐';
  if (mood >= 2) return '😕';
  return '😢';
};

const getProductivityText = (productivity: number): string => {
  if (productivity >= 4) return 'とても高い';
  if (productivity >= 3) return '高い';
  if (productivity >= 2) return '普通';
  return '低い';
};

const getInsights = (summary: any): string[] => {
  const insights = [];
  
  if (summary.netIncome > 0) {
    insights.push(`💰 黒字で{summary.netIncome.toLocaleString()}円の収入がありました`);
  } else if (summary.netIncome < 0) {
    insights.push(`⚠️ 赤字で{Math.abs(summary.netIncome).toLocaleString()}円の支出がありました`);
  }
  
  if (summary.averageMood >= 4) {
    insights.push('😊 気分がとても良い期間でした');
  } else if (summary.averageMood <= 2) {
    insights.push('😕 気分が低調な期間でした');
  }
  
  if (summary.averageProductivity >= 4) {
    insights.push('🚀 生産性がとても高い期間でした');
  } else if (summary.averageProductivity <= 2) {
    insights.push('📉 生産性が低い期間でした');
  }
  
  if (summary.totalWorkHours > 40) {
    insights.push('⏰ 長時間労働の期間でした');
  } else if (summary.totalWorkHours < 20) {
    insights.push('🏖️ 短時間労働の期間でした');
  }
  
  return insights;
};

export default MonthlySummary;
