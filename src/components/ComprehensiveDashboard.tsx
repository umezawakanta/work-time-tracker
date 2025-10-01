// 統合ダッシュボードコンポーネント

import React, { useState, useEffect } from 'react';
import { AssetLiabilityManager } from '../utils/assetLiabilityManager';
import { ActionHistoryManager } from '../utils/actionHistoryManager';
import { FuturePlanningManager } from '../utils/futurePlanningManager';
import { WasteAnalysisManager } from '../utils/wasteAnalysisManager';
import { FinancialOverviewManager } from '../utils/financialOverviewManager';
import { 
  AssetLiabilitySummary, 
  AssetLiabilityAnalysis,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  FINANCIAL_HEALTH_CRITERIA
} from '../types/assetLiability';
import { 
  ActionAnalysis, 
  ActionTrend,
  ACTION_CATEGORIES,
  PRODUCTIVITY_CRITERIA
} from '../types/actionHistory';
import { 
  PlanAnalysis, 
  PlanRecommendation,
  PLAN_CATEGORIES,
  PLAN_STATUSES
} from '../types/futurePlanning';
import { WasteAnalysis } from '../types/wasteAnalysis';
import { FinancialSummary } from '../types/financialOverview';
import './ComprehensiveDashboard.css';

interface ComprehensiveDashboardProps {
  userId: string;
  onClose: () => void;
}

const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'actions' | 'plans' | 'waste' | 'financial'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ状態
  const [assetLiabilitySummary, setAssetLiabilitySummary] = useState<AssetLiabilitySummary | null>(null);
  const [assetLiabilityAnalysis, setAssetLiabilityAnalysis] = useState<AssetLiabilityAnalysis | null>(null);
  const [actionAnalysis, setActionAnalysis] = useState<ActionAnalysis | null>(null);
  const [actionTrends, setActionTrends] = useState<ActionTrend[]>([]);
  const [planAnalysis, setPlanAnalysis] = useState<PlanAnalysis | null>(null);
  const [planRecommendations, setPlanRecommendations] = useState<PlanRecommendation[]>([]);
  const [wasteAnalysis, setWasteAnalysis] = useState<WasteAnalysis | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);

  // マネージャーインスタンス
  const assetLiabilityManager = AssetLiabilityManager.getInstance();
  const actionHistoryManager = ActionHistoryManager.getInstance();
  const futurePlanningManager = FuturePlanningManager.getInstance();
  const wasteAnalysisManager = WasteAnalysisManager.getInstance();
  const financialOverviewManager = FinancialOverviewManager.getInstance();

  useEffect(() => {
    loadAllData();
  }, [userId, selectedPeriod]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 各マネージャーからデータを読み込み
      assetLiabilityManager.loadFromLocalStorage();
      actionHistoryManager.loadFromLocalStorage();
      futurePlanningManager.loadFromLocalStorage();
      wasteAnalysisManager.loadFromLocalStorage();
      financialOverviewManager.loadFromLocalStorage();

      // 資産・負債データ
      const assetSummary = assetLiabilityManager.getAssetLiabilitySummary(userId);
      const assetAnalysis = assetLiabilityManager.generateAssetLiabilityAnalysis(userId);
      setAssetLiabilitySummary(assetSummary);
      setAssetLiabilityAnalysis(assetAnalysis);

      // 行動記録データ
      const actionData = actionHistoryManager.generateActionAnalysis(userId, selectedPeriod);
      const trends = actionHistoryManager.getActionTrends(userId, selectedPeriod);
      setActionAnalysis(actionData);
      setActionTrends(trends);

      // 将来計画データ
      const planData = futurePlanningManager.generatePlanAnalysis(userId);
      const recommendations = futurePlanningManager.generateRecommendations(userId);
      setPlanAnalysis(planData);
      setPlanRecommendations(recommendations);

      // 無駄遣い分析データ
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      const wasteData = wasteAnalysisManager.generateWasteAnalysis(userId, startDate, endDate);
      setWasteAnalysis(wasteData);

      // 財務概要データ
      const financialData = financialOverviewManager.getFinancialSummary(userId);
      setFinancialSummary(financialData);

    } catch (err) {
      console.error('データの読み込みエラー:', err);
      setError('データの読み込みに失敗しました');
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
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
  };

  const getHealthScoreLabel = (score: number): string => {
    if (score >= 80) return '優秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '普通';
    if (score >= 20) return '要改善';
    return '危険';
  };

  if (isLoading) {
    return (
      <div className="comprehensive-dashboard">
        <div className="dashboard-header">
          <h2>統合ダッシュボード</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="loading">データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comprehensive-dashboard">
        <div className="dashboard-header">
          <h2>統合ダッシュボード</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="comprehensive-dashboard">
      <div className="dashboard-header">
        <h2>統合ダッシュボード</h2>
        <div className="header-controls">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
            className="period-selector"
            title="期間を選択"
            aria-label="期間を選択"
          >
            <option value="week">1週間</option>
            <option value="month">1ヶ月</option>
            <option value="year">1年</option>
          </select>
          <button onClick={onClose} className="close-button">×</button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概要
        </button>
        <button 
          className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          資産・負債
        </button>
        <button 
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          行動記録
        </button>
        <button 
          className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          将来計画
        </button>
        <button 
          className={`tab ${activeTab === 'waste' ? 'active' : ''}`}
          onClick={() => setActiveTab('waste')}
        >
          無駄遣い
        </button>
        <button 
          className={`tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          財務
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* 財務健全性スコア */}
              <div className="overview-card financial-health">
                <h3>財務健全性</h3>
                {assetLiabilityAnalysis && (
                  <div className="health-score">
                    <div 
                      className="score-circle"
                      style={{ 
                        background: `conic-gradient(${getHealthScoreColor(assetLiabilityAnalysis.financialHealthScore)} 0deg ${assetLiabilityAnalysis.financialHealthScore * 3.6}deg, #e0e0e0 ${assetLiabilityAnalysis.financialHealthScore * 3.6}deg 360deg)`
                      }}
                    >
                      <div className="score-text">
                        <span className="score-value">{assetLiabilityAnalysis.financialHealthScore}</span>
                        <span className="score-label">{getHealthScoreLabel(assetLiabilityAnalysis.financialHealthScore)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 純資産 */}
              <div className="overview-card net-worth">
                <h3>純資産</h3>
                {assetLiabilitySummary && (
                  <div className="net-worth-content">
                    <div className="net-worth-value">
                      {formatCurrency(assetLiabilitySummary.netWorth)}
                    </div>
                    <div className="net-worth-breakdown">
                      <div className="breakdown-item">
                        <span className="label">資産:</span>
                        <span className="value">{formatCurrency(assetLiabilitySummary.totalAssets)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="label">負債:</span>
                        <span className="value">{formatCurrency(assetLiabilitySummary.totalLiabilities)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 生産性スコア */}
              <div className="overview-card productivity">
                <h3>生産性スコア</h3>
                {actionAnalysis && (
                  <div className="productivity-content">
                    <div className="productivity-score">
                      <span className="score-value">{actionAnalysis.productivityScore.toFixed(0)}</span>
                      <span className="score-label">/ 100</span>
                    </div>
                    <div className="productivity-stats">
                      <div className="stat-item">
                        <span className="label">総活動数:</span>
                        <span className="value">{actionAnalysis.totalActions}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 計画進捗 */}
              <div className="overview-card plans">
                <h3>計画進捗</h3>
                {planAnalysis && (
                  <div className="plans-content">
                    <div className="completion-rate">
                      <span className="rate-value">{planAnalysis.completionRate.toFixed(1)}%</span>
                      <span className="rate-label">完了率</span>
                    </div>
                    <div className="plans-stats">
                      <div className="stat-item">
                        <span className="label">総計画数:</span>
                        <span className="value">{planAnalysis.totalPlans}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">完了:</span>
                        <span className="value">{planAnalysis.completedPlans}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">進行中:</span>
                        <span className="value">{planAnalysis.inProgressPlans}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 無駄遣いスコア */}
              <div className="overview-card waste">
                <h3>無駄遣いスコア</h3>
                {wasteAnalysis && (
                  <div className="waste-content">
                    <div className="waste-score">
                      <span className="score-value">{wasteAnalysis.wasteScore}</span>
                      <span className="score-label">/ 100</span>
                    </div>
                    <div className="waste-breakdown">
                      <div className="breakdown-item">
                        <span className="label">お金:</span>
                        <span className="value">{formatCurrency(wasteAnalysis.totalWaste.money)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="label">時間:</span>
                        <span className="value">{wasteAnalysis.totalWaste.time}分</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 推奨事項 */}
              <div className="overview-card recommendations">
                <h3>推奨事項</h3>
                <div className="recommendations-list">
                  {planRecommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className={`recommendation-item ${rec.priority}`}>
                      <span className="recommendation-title">{rec.title}</span>
                      <span className="recommendation-description">{rec.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && assetLiabilitySummary && assetLiabilityAnalysis && (
          <div className="assets-tab">
            <div className="assets-grid">
              <div className="assets-summary">
                <h3>資産・負債サマリー</h3>
                <div className="summary-cards">
                  <div className="summary-card assets">
                    <h4>総資産</h4>
                    <div className="amount">{formatCurrency(assetLiabilitySummary.totalAssets)}</div>
                  </div>
                  <div className="summary-card liabilities">
                    <h4>総負債</h4>
                    <div className="amount">{formatCurrency(assetLiabilitySummary.totalLiabilities)}</div>
                  </div>
                  <div className="summary-card net-worth">
                    <h4>純資産</h4>
                    <div className="amount">{formatCurrency(assetLiabilitySummary.netWorth)}</div>
                  </div>
                </div>
              </div>

              <div className="assets-breakdown">
                <h3>資産内訳</h3>
                <div className="breakdown-chart">
                  {Object.entries(assetLiabilitySummary.assetBreakdown).map(([key, value]) => (
                    <div key={key} className="breakdown-item">
                      <span className="label">{key}</span>
                      <div className="bar">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${(value / assetLiabilitySummary.totalAssets) * 100}%`,
                            backgroundColor: ASSET_CATEGORIES.find(cat => cat.id === key)?.color || '#2196F3'
                          }}
                        ></div>
                      </div>
                      <span className="value">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="liabilities-breakdown">
                <h3>負債内訳</h3>
                <div className="breakdown-chart">
                  {Object.entries(assetLiabilitySummary.liabilityBreakdown).map(([key, value]) => (
                    <div key={key} className="breakdown-item">
                      <span className="label">{key}</span>
                      <div className="bar">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${(value / assetLiabilitySummary.totalLiabilities) * 100}%`,
                            backgroundColor: LIABILITY_CATEGORIES.find(cat => cat.id === key)?.color || '#F44336'
                          }}
                        ></div>
                      </div>
                      <span className="value">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="financial-analysis">
                <h3>財務分析</h3>
                <div className="analysis-metrics">
                  <div className="metric">
                    <span className="label">純資産変化率</span>
                    <span className={`value ${assetLiabilityAnalysis.netWorthChange >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(assetLiabilityAnalysis.netWorthChange)}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">負債比率</span>
                    <span className="value">{assetLiabilityAnalysis.debtToAssetRatio.toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="label">緊急資金カバレッジ</span>
                    <span className="value">{assetLiabilityAnalysis.emergencyFundCoverage.toFixed(1)}倍</span>
                  </div>
                  <div className="metric">
                    <span className="label">資産多様性スコア</span>
                    <span className="value">{assetLiabilityAnalysis.assetDiversificationScore.toFixed(0)}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && actionAnalysis && (
          <div className="actions-tab">
            <div className="actions-grid">
              <div className="actions-summary">
                <h3>行動記録サマリー</h3>
                <div className="summary-stats">
                  <div className="stat-card">
                    <h4>総活動数</h4>
                    <div className="stat-value">{actionAnalysis.totalActions}</div>
                  </div>
                  <div className="stat-card">
                    <h4>生産性スコア</h4>
                    <div className="stat-value">{actionAnalysis.productivityScore.toFixed(0)}/100</div>
                  </div>
                </div>
              </div>

              <div className="category-stats">
                <h3>カテゴリ別統計</h3>
                <div className="category-chart">
                  {Object.entries(actionAnalysis.categoryStats).map(([category, stats]) => (
                    <div key={category} className="category-item">
                      <div className="category-header">
                        <span className="category-name">
                          {ACTION_CATEGORIES.find(cat => cat.id === category)?.name || category}
                        </span>
                        <span className="category-count">{stats.count}回</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="bar-fill"
                          style={{ 
                            width: `${(stats.count / actionAnalysis.totalActions) * 100}%`,
                            backgroundColor: ACTION_CATEGORIES.find(cat => cat.id === category)?.color || '#2196F3'
                          }}
                        ></div>
                      </div>
                      <div className="category-details">
                        <span>平均時間: {stats.averageDuration.toFixed(0)}分</span>
                        <span>総時間: {stats.totalDuration}分</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insights">
                <h3>洞察・推奨事項</h3>
                <div className="insights-list">
                  {actionAnalysis.insights.map((insight, index) => (
                    <div key={index} className={`insight-item ${insight.priority}`}>
                      <h4>{insight.title}</h4>
                      <p>{insight.description}</p>
                      <ul className="suggestions">
                        {insight.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && planAnalysis && (
          <div className="plans-tab">
            <div className="plans-grid">
              <div className="plans-summary">
                <h3>計画サマリー</h3>
                <div className="summary-cards">
                  <div className="summary-card total">
                    <h4>総計画数</h4>
                    <div className="count">{planAnalysis.totalPlans}</div>
                  </div>
                  <div className="summary-card completed">
                    <h4>完了</h4>
                    <div className="count">{planAnalysis.completedPlans}</div>
                  </div>
                  <div className="summary-card in-progress">
                    <h4>進行中</h4>
                    <div className="count">{planAnalysis.inProgressPlans}</div>
                  </div>
                  <div className="summary-card overdue">
                    <h4>期限切れ</h4>
                    <div className="count">{planAnalysis.overduePlans}</div>
                  </div>
                </div>
              </div>

              <div className="completion-rate">
                <h3>完了率</h3>
                <div className="rate-circle">
                  <div 
                    className="rate-fill"
                    style={{ 
                      background: `conic-gradient(#4CAF50 0deg ${planAnalysis.completionRate * 3.6}deg, #e0e0e0 ${planAnalysis.completionRate * 3.6}deg 360deg)`
                    }}
                  >
                    <div className="rate-text">
                      <span className="rate-value">{planAnalysis.completionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="category-stats">
                <h3>カテゴリ別統計</h3>
                <div className="category-chart">
                  {Object.entries(planAnalysis.categoryStats).map(([category, stats]) => (
                    <div key={category} className="category-item">
                      <div className="category-header">
                        <span className="category-name">
                          {PLAN_CATEGORIES.find(cat => cat.id === category)?.name || category}
                        </span>
                        <span className="category-count">{stats.count}件</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="bar-fill"
                          style={{ 
                            width: `${(stats.count / planAnalysis.totalPlans) * 100}%`,
                            backgroundColor: PLAN_CATEGORIES.find(cat => cat.id === category)?.color || '#2196F3'
                          }}
                        ></div>
                      </div>
                      <div className="category-details">
                        <span>完了: {stats.completed}件</span>
                        <span>進捗率: {stats.averageProgress.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recommendations">
                <h3>推奨事項</h3>
                <div className="recommendations-list">
                  {planRecommendations.map((rec, index) => (
                    <div key={index} className={`recommendation-item ${rec.priority}`}>
                      <h4>{rec.title}</h4>
                      <p>{rec.description}</p>
                      <ul className="suggestions">
                        {rec.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'waste' && wasteAnalysis && (
          <div className="waste-tab">
            <div className="waste-grid">
              <div className="waste-summary">
                <h3>無駄遣いサマリー</h3>
                <div className="summary-cards">
                  <div className="summary-card money">
                    <h4>お金の無駄</h4>
                    <div className="amount">{formatCurrency(wasteAnalysis.totalWaste.money)}</div>
                  </div>
                  <div className="summary-card time">
                    <h4>時間の無駄</h4>
                    <div className="amount">{wasteAnalysis.totalWaste.time}分</div>
                  </div>
                  <div className="summary-card effort">
                    <h4>労力の無駄</h4>
                    <div className="amount">{wasteAnalysis.totalWaste.effort}ポイント</div>
                  </div>
                </div>
              </div>

              <div className="waste-score">
                <h3>無駄遣いスコア</h3>
                <div className="score-circle">
                  <div 
                    className="score-fill"
                    style={{ 
                      background: `conic-gradient(#F44336 0deg ${wasteAnalysis.wasteScore * 3.6}deg, #e0e0e0 ${wasteAnalysis.wasteScore * 3.6}deg 360deg)`
                    }}
                  >
                    <div className="score-text">
                      <span className="score-value">{wasteAnalysis.wasteScore}</span>
                      <span className="score-label">/ 100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="waste-sources">
                <h3>無駄遣いの原因</h3>
                <div className="sources-list">
                  {wasteAnalysis.topWasteSources.map((source, index) => (
                    <div key={index} className="source-item">
                      <span className="source-name">{source.name}</span>
                      <span className="source-amount">{formatCurrency(source.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="improvement-suggestions">
                <h3>改善提案</h3>
                <div className="suggestions-list">
                  {wasteAnalysis.improvementSuggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                      <h4>{suggestion.title}</h4>
                      <p>{suggestion.description}</p>
                      <div className="suggestion-impact">
                        期待効果: {formatCurrency(suggestion.expectedSavings)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && financialSummary && (
          <div className="financial-tab">
            <div className="financial-grid">
              <div className="financial-summary">
                <h3>財務サマリー</h3>
                <div className="summary-cards">
                  <div className="summary-card income">
                    <h4>総収入</h4>
                    <div className="amount">{formatCurrency(financialSummary.totalIncome)}</div>
                  </div>
                  <div className="summary-card expense">
                    <h4>総支出</h4>
                    <div className="amount">{formatCurrency(financialSummary.totalExpense)}</div>
                  </div>
                  <div className="summary-card net">
                    <h4>純収入</h4>
                    <div className="amount">{formatCurrency(financialSummary.netIncome)}</div>
                  </div>
                </div>
              </div>

              <div className="monthly-trend">
                <h3>月別推移</h3>
                <div className="trend-chart">
                  {financialSummary.monthlyData.map((month, index) => (
                    <div key={index} className="month-item">
                      <span className="month-label">{month.month}</span>
                      <div className="month-bars">
                        <div className="bar income" style={{ height: `${(month.income / financialSummary.totalIncome) * 100}%` }}></div>
                        <div className="bar expense" style={{ height: `${(month.expense / financialSummary.totalExpense) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;
