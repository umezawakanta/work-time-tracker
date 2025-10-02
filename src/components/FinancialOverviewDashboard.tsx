import React, { useState, useEffect } from 'react';
import { FinancialSummary, FinancialHealthScore, TREND_PERIODS, CHART_COLORS } from '../types/financialOverview';
import { FinancialOverviewManager } from '../utils/financialOverviewManager';
import './FinancialOverviewDashboard.css';

interface FinancialOverviewDashboardProps {
  userId: string;
}

const FinancialOverviewDashboard: React.FC<FinancialOverviewDashboardProps> = ({ userId }) => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const financialManager = FinancialOverviewManager.getInstance();

  useEffect(() => {
    loadFinancialData();
  }, [userId, selectedPeriod]);

  const loadFinancialData = () => {
    try {
      financialManager.loadFromLocalStorage();
      const financialSummary = financialManager.getFinancialSummary(userId);
      const financialHealthScore = financialManager.calculateFinancialHealthScore(userId);
      
      setSummary(financialSummary);
      setHealthScore(financialHealthScore);
      setError(null);
    } catch (err) {
      console.error('財務データの読み込みエラー:', err);
      setError('財務データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return CHART_COLORS.positive;
    if (score >= 60) return '#ff9800';
    return CHART_COLORS.negative;
  };

  const getHealthScoreIcon = (grade: string): string => {
    switch (grade) {
      case 'A': return '🏆';
      case 'B': return '🥈';
      case 'C': return '🥉';
      case 'D': return '⚠️';
      case 'F': return '🚨';
      default: return '❓';
    }
  };

  const getTrendIcon = (value: number): string => {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➡️';
  };

  const getTrendColor = (value: number): string => {
    if (value > 0) return CHART_COLORS.positive;
    if (value < 0) return CHART_COLORS.negative;
    return CHART_COLORS.neutral;
  };

  if (isLoading) {
    return (
      <div className="financial-overview-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>財務データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !summary || !healthScore) {
    return (
      <div className="financial-overview-dashboard">
        <div className="error-container">
          <p>❌ {error || '財務データの読み込みに失敗しました'}</p>
          <button onClick={loadFinancialData} className="retry-button">
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-overview-dashboard">
      {/* ヘッダー */}
      <div className="comprehensive-dashboard-header">
        <h2>財務統合ダッシュボード</h2>
        <div className="period-selector">
          <label>期間:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="period-select"
            aria-label="期間を選択"
          >
            {TREND_PERIODS.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 財務ヘルススコア */}
      <div className="health-score-section">
        <div className="health-score-card">
          <div className="health-score-header">
            <h3>財務ヘルススコア</h3>
            <div className="health-score-badge">
              {getHealthScoreIcon(healthScore.grade)}
            </div>
          </div>
          <div className="health-score-content">
            <div className="score-circle">
              <div 
                className="score-value"
                style={{ color: getHealthScoreColor(healthScore.score) }}
              >
                {healthScore.score}
              </div>
              <div className="score-label">点</div>
            </div>
            <div className="score-grade">
              <span className="grade">{healthScore.grade}</span>
              <span className="grade-label">グレード</span>
            </div>
          </div>
          <div className="health-factors">
            <div className="factor-item">
              <span className="factor-label">負債比率</span>
              <span className="factor-value">
                {(healthScore.factors.debtToAssetRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div className="factor-item">
              <span className="factor-label">緊急資金比率</span>
              <span className="factor-value">
                {healthScore.factors.emergencyFundRatio.toFixed(1)}ヶ月分
              </span>
            </div>
            <div className="factor-item">
              <span className="factor-label">貯蓄率</span>
              <span className="factor-value">
                {(healthScore.factors.monthlySavingsRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 財務概要 */}
      <div className="overview-section">
        <div className="overview-cards">
          <div className="overview-card assets">
            <div className="card-header">
              <h3>総資産</h3>
              <div className="card-icon">💰</div>
            </div>
            <div className="card-value">
              {formatCurrency(summary.overview.totalAssets)}
            </div>
            <div className="card-trend">
              <span 
                className="trend-value"
                style={{ color: getTrendColor(summary.trend.totalChange.assets) }}
              >
                {getTrendIcon(summary.trend.totalChange.assets)}
                {formatCurrency(summary.trend.totalChange.assets)}
              </span>
              <span 
                className="trend-percentage"
                style={{ color: getTrendColor(summary.trend.percentageChange.assets) }}
              >
                {formatPercentage(summary.trend.percentageChange.assets)}
              </span>
            </div>
          </div>

          <div className="overview-card liabilities">
            <div className="card-header">
              <h3>総負債</h3>
              <div className="card-icon">💳</div>
            </div>
            <div className="card-value">
              {formatCurrency(summary.overview.totalLiabilities)}
            </div>
            <div className="card-trend">
              <span 
                className="trend-value"
                style={{ color: getTrendColor(summary.trend.totalChange.liabilities) }}
              >
                {getTrendIcon(summary.trend.totalChange.liabilities)}
                {formatCurrency(summary.trend.totalChange.liabilities)}
              </span>
              <span 
                className="trend-percentage"
                style={{ color: getTrendColor(summary.trend.percentageChange.liabilities) }}
              >
                {formatPercentage(summary.trend.percentageChange.liabilities)}
              </span>
            </div>
          </div>

          <div className="overview-card net-worth">
            <div className="card-header">
              <h3>純資産</h3>
              <div className="card-icon">📊</div>
            </div>
            <div className="card-value">
              {formatCurrency(summary.overview.netWorth)}
            </div>
            <div className="card-trend">
              <span 
                className="trend-value"
                style={{ color: getTrendColor(summary.trend.totalChange.netWorth) }}
              >
                {getTrendIcon(summary.trend.totalChange.netWorth)}
                {formatCurrency(summary.trend.totalChange.netWorth)}
              </span>
              <span 
                className="trend-percentage"
                style={{ color: getTrendColor(summary.trend.percentageChange.netWorth) }}
              >
                {formatPercentage(summary.trend.percentageChange.netWorth)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 資産・負債内訳 */}
      <div className="breakdown-section">
        <h3>資産・負債内訳</h3>
        <div className="breakdown-cards">
          {summary.categories.map(category => (
            <div key={category.name} className="breakdown-card">
              <div className="breakdown-header">
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-type">{category.type === 'asset' ? '資産' : '負債'}</div>
                </div>
              </div>
              <div className="breakdown-value">
                {formatCurrency(category.amount)}
              </div>
              <div className="breakdown-percentage">
                {category.percentage.toFixed(1)}%
              </div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill"
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 月次推移グラフ */}
      <div className="chart-section">
        <h3>月次推移</h3>
        <div className="chart-container">
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: CHART_COLORS.assets }}></div>
              <span>総資産</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: CHART_COLORS.liabilities }}></div>
              <span>総負債</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: CHART_COLORS.netWorth }}></div>
              <span>純資産</span>
            </div>
          </div>
          <div className="chart-area">
            {summary.trend.data.length === 0 ? (
              <div className="no-data">
                <p>データがありません</p>
                <p>月次データを記録するには、各管理画面でデータを更新してください</p>
              </div>
            ) : (
              <div className="chart-bars">
                {summary.trend.data.map((data, index) => {
                  const maxValue = Math.max(
                    ...summary.trend.data.map(d => Math.max(d.totalAssets, d.totalLiabilities, Math.abs(d.netWorth)))
                  );
                  
                  return (
                    <div key={index} className="chart-bar-group">
                      <div className="bar-label">
                        {data.year}/{data.month.toString().padStart(2, '0')}
                      </div>
                      <div className="bars">
                        <div 
                          className="bar assets-bar"
                          style={{ 
                            height: `${(data.totalAssets / maxValue) * 100}%`,
                            backgroundColor: CHART_COLORS.assets
                          }}
                          title={`資産: ${formatCurrency(data.totalAssets)}`}
                        ></div>
                        <div 
                          className="bar liabilities-bar"
                          style={{ 
                            height: `${(data.totalLiabilities / maxValue) * 100}%`,
                            backgroundColor: CHART_COLORS.liabilities
                          }}
                          title={`負債: ${formatCurrency(data.totalLiabilities)}`}
                        ></div>
                        <div 
                          className="bar net-worth-bar"
                          style={{ 
                            height: `${(Math.abs(data.netWorth) / maxValue) * 100}%`,
                            backgroundColor: data.netWorth >= 0 ? CHART_COLORS.positive : CHART_COLORS.negative
                          }}
                          title={`純資産: ${formatCurrency(data.netWorth)}`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* アラート */}
      {summary.alerts.length > 0 && (
        <div className="alerts-section">
          <h3>アラート ({summary.alerts.length}件)</h3>
          <div className="alerts-list">
            {summary.alerts.slice(0, 5).map(alert => (
              <div 
                key={alert.id} 
                className={`alert-item ${alert.isRead ? 'read' : 'unread'}`}
                onClick={() => financialManager.markAlertAsRead(alert.id)}
              >
                <div className="alert-icon">
                  {alert.severity === 'critical' ? '🚨' : 
                   alert.severity === 'high' ? '⚠️' : 
                   alert.severity === 'medium' ? 'ℹ️' : '💡'}
                </div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                </div>
                <div className="alert-severity">
                  {alert.severity}
                </div>
              </div>
            ))}
            {summary.alerts.length > 5 && (
              <div className="more-alerts">
                他 {summary.alerts.length - 5} 件のアラート
              </div>
            )}
          </div>
        </div>
      )}

      {/* 推奨事項 */}
      {healthScore.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>推奨事項</h3>
          <div className="recommendations-list">
            {healthScore.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-icon">💡</div>
                <div className="recommendation-text">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOverviewDashboard;
