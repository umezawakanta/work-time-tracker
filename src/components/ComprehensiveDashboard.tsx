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
import { Plan, Schedule, BudgetPlan } from '../types';
import { WasteAnalysis } from '../types/wasteAnalysis';
import { FinancialSummary } from '../types/financialOverview';
import './ComprehensiveDashboard.css';

interface ComprehensiveDashboardProps {
  userId: string;
  onClose: () => void;
}

const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'today' | 'thisweek' | 'thismonth' | 'urgent' | 'goals'>('overview');
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
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

  // 今日のタスクと緊急事項を計算
  const getTodayTasks = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 今日のスケジュール
    const todaySchedules = schedules.filter(schedule => 
      schedule.date === todayStr && schedule.status === 'scheduled'
    );
    
    // 今日締切の計画
    const todayDeadlines = plans.filter(plan => 
      plan.targetDate === todayStr && plan.status !== 'completed'
    );
    
    // 今週締切の計画（緊急度高い）
    const weekDeadlines = plans.filter(plan => {
      const targetDate = new Date(plan.targetDate);
      const daysUntilDeadline = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 7 && plan.status !== 'completed';
    });
    
    return {
      schedules: todaySchedules,
      deadlines: todayDeadlines,
      weekDeadlines: weekDeadlines
    };
  };

  // 緊急の支出・収入を取得
  const getUrgentFinancialItems = () => {
    const urgentItems = [];
    
    // 負債の警告
    if (assetLiabilitySummary) {
      if (assetLiabilitySummary.totalLiabilities > assetLiabilitySummary.totalAssets * 0.5) {
        urgentItems.push({
          type: 'warning',
          title: '負債比率が高い',
          message: `負債が資産の50%を超えています（${Math.round(assetLiabilitySummary.totalLiabilities / assetLiabilitySummary.totalAssets * 100)}%）`,
          priority: 'high'
        });
      }
    }
    
    // 予算オーバー
    if (financialSummary) {
      const overBudget = financialSummary.expenses - financialSummary.budget;
      if (overBudget > 0) {
        urgentItems.push({
          type: 'warning',
          title: '予算オーバー',
          message: `予算を${overBudget.toLocaleString()}円超過しています`,
          priority: 'high'
        });
      }
    }
    
    return urgentItems;
  };

  // 今すぐやるべきアクションを取得
  const getImmediateActions = () => {
    const actions = [];
    const todayTasks = getTodayTasks();
    const urgentFinancial = getUrgentFinancialItems();
    
    // 今日のスケジュール
    todayTasks.schedules.forEach(schedule => {
      actions.push({
        type: 'schedule',
        title: schedule.title,
        time: schedule.startTime,
        priority: schedule.priority,
        action: '開始する'
      });
    });
    
    // 今日締切の計画
    todayTasks.deadlines.forEach(plan => {
      actions.push({
        type: 'deadline',
        title: plan.title,
        time: '今日締切',
        priority: 'high',
        action: '完了する'
      });
    });
    
    // 緊急の金銭的問題
    urgentFinancial.forEach(item => {
      actions.push({
        type: 'financial',
        title: item.title,
        time: '緊急',
        priority: item.priority,
        action: '対応する'
      });
    });
    
    return actions.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // 今やることをひとつ取得
  const getCurrentFocus = () => {
    const immediateActions = getImmediateActions();
    const now = new Date();
    const currentHour = now.getHours();
    
    // 現在の時間帯に基づいて適切なメッセージを生成
    let timeBasedMessage = '';
    if (currentHour >= 6 && currentHour < 9) {
      timeBasedMessage = '朝の時間です。今日の計画を確認して、重要なタスクから始めましょう。';
    } else if (currentHour >= 9 && currentHour < 12) {
      timeBasedMessage = '午前中です。集中力が高い時間帯なので、重要な作業に取り組みましょう。';
    } else if (currentHour >= 12 && currentHour < 13) {
      timeBasedMessage = 'お昼休みの時間です。適度に休憩を取って、午後の準備をしましょう。';
    } else if (currentHour >= 13 && currentHour < 17) {
      timeBasedMessage = '午後の時間です。午前の調子を維持して、作業を続けましょう。';
    } else if (currentHour >= 17 && currentHour < 19) {
      timeBasedMessage = '夕方の時間です。今日の振り返りと明日の準備をしましょう。';
    } else if (currentHour >= 19 && currentHour < 22) {
      timeBasedMessage = '夜の時間です。今日の成果を確認し、明日の準備をしましょう。';
    } else {
      timeBasedMessage = '深夜の時間です。十分な休息を取って、明日に備えましょう。';
    }
    
    // 最優先のアクションがある場合はそれを表示
    if (immediateActions.length > 0) {
      const topAction = immediateActions[0];
      return {
        message: `${topAction.title}を${topAction.action}。`,
        type: topAction.type,
        priority: topAction.priority,
        time: topAction.time
      };
    }
    
    // 緊急の金銭的問題がある場合
    const urgentFinancial = getUrgentFinancialItems();
    if (urgentFinancial.length > 0) {
      return {
        message: `${urgentFinancial[0].title}。${urgentFinancial[0].message}`,
        type: 'financial',
        priority: 'high',
        time: '緊急'
      };
    }
    
    // 今日のスケジュールがある場合
    const todayTasks = getTodayTasks();
    if (todayTasks.schedules.length > 0) {
      const nextSchedule = todayTasks.schedules[0];
      return {
        message: `${nextSchedule.startTime}から${nextSchedule.title}があります。`,
        type: 'schedule',
        priority: nextSchedule.priority,
        time: nextSchedule.startTime
      };
    }
    
    // 今週締切の計画がある場合
    if (todayTasks.weekDeadlines.length > 0) {
      const nextDeadline = todayTasks.weekDeadlines[0];
      const targetDate = new Date(nextDeadline.targetDate);
      const daysLeft = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        message: `${nextDeadline.title}が${daysLeft}日後に締切です。進捗を確認しましょう。`,
        type: 'deadline',
        priority: 'medium',
        time: `${daysLeft}日後`
      };
    }
    
    // デフォルトの時間帯ベースのメッセージ
    return {
      message: timeBasedMessage,
      type: 'general',
      priority: 'low',
      time: '今'
    };
  };

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
      const plansData = futurePlanningManager.getPlans(userId);
      const schedulesData = futurePlanningManager.getSchedules(userId);
      const budgetPlansData = futurePlanningManager.getBudgetPlans(userId);
      setPlanAnalysis(planData);
      setPlanRecommendations(recommendations);
      setPlans(plansData);
      setSchedules(schedulesData);
      setBudgetPlans(budgetPlansData);

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
          🏠 概要
        </button>
        <button 
          className={`tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          📅 今日
        </button>
        <button 
          className={`tab ${activeTab === 'thisweek' ? 'active' : ''}`}
          onClick={() => setActiveTab('thisweek')}
        >
          📊 今週
        </button>
        <button 
          className={`tab ${activeTab === 'thismonth' ? 'active' : ''}`}
          onClick={() => setActiveTab('thismonth')}
        >
          🗓️ 今月
        </button>
        <button 
          className={`tab ${activeTab === 'urgent' ? 'active' : ''}`}
          onClick={() => setActiveTab('urgent')}
        >
          ⚠️ 緊急
        </button>
        <button 
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 目標
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* 今やることをひとつ表示 */}
            <div className="current-focus-card">
              <div className="focus-header">
                <h2>🎯 今やること</h2>
                <span className="focus-time">{getCurrentFocus().time}</span>
              </div>
              <div className={`focus-message priority-${getCurrentFocus().priority}`}>
                {getCurrentFocus().message}
              </div>
            </div>
            
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

        {/* 今日のタブ */}
        {activeTab === 'today' && (
          <div className="today-tab">
            <div className="today-header">
              <h2>📅 今日やるべきこと</h2>
              <p>{new Date().toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}</p>
            </div>
            
            <div className="today-grid">
              {/* 今すぐやるべきアクション */}
              <div className="today-card immediate-actions">
                <h3>⚡ 今すぐやるべきこと</h3>
                <div className="actions-list">
                  {getImmediateActions().map((action, index) => (
                    <div key={index} className={`action-item priority-${action.priority}`}>
                      <div className="action-content">
                        <span className="action-title">{action.title}</span>
                        <span className="action-time">{action.time}</span>
                      </div>
                      <button className="action-button">
                        {action.action}
                      </button>
                    </div>
                  ))}
                  {getImmediateActions().length === 0 && (
                    <div className="no-actions">
                      <p>🎉 今すぐやるべきことはありません！</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 今日のスケジュール */}
              <div className="today-card today-schedule">
                <h3>📅 今日のスケジュール</h3>
                <div className="schedule-list">
                  {getTodayTasks().schedules.map((schedule, index) => (
                    <div key={index} className="schedule-item">
                      <div className="schedule-time">{schedule.startTime}</div>
                      <div className="schedule-content">
                        <div className="schedule-title">{schedule.title}</div>
                        <div className="schedule-category">{schedule.category}</div>
                      </div>
                      <div className={`schedule-priority priority-${schedule.priority}`}>
                        {schedule.priority === 'high' ? '高' : schedule.priority === 'medium' ? '中' : '低'}
                      </div>
                    </div>
                  ))}
                  {getTodayTasks().schedules.length === 0 && (
                    <div className="no-schedule">
                      <p>今日のスケジュールはありません</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 今日締切の計画 */}
              <div className="today-card today-deadlines">
                <h3>⏰ 今日締切の計画</h3>
                <div className="deadlines-list">
                  {getTodayTasks().deadlines.map((plan, index) => (
                    <div key={index} className="deadline-item">
                      <div className="deadline-title">{plan.title}</div>
                      <div className="deadline-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{plan.progress}%</span>
                      </div>
                    </div>
                  ))}
                  {getTodayTasks().deadlines.length === 0 && (
                    <div className="no-deadlines">
                      <p>今日締切の計画はありません</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 今週締切の計画 */}
              <div className="today-card week-deadlines">
                <h3>📊 今週締切の計画</h3>
                <div className="week-deadlines-list">
                  {getTodayTasks().weekDeadlines.map((plan, index) => {
                    const targetDate = new Date(plan.targetDate);
                    const today = new Date();
                    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={index} className="week-deadline-item">
                        <div className="week-deadline-title">{plan.title}</div>
                        <div className="week-deadline-info">
                          <span className="days-left">{daysLeft}日後</span>
                          <div className="week-progress-bar">
                            <div 
                              className="week-progress-fill" 
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {getTodayTasks().weekDeadlines.length === 0 && (
                    <div className="no-week-deadlines">
                      <p>今週締切の計画はありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 今週のタブ */}
        {activeTab === 'thisweek' && (
          <div className="thisweek-tab">
            <div className="thisweek-header">
              <h2>📊 今週の目標と進捗</h2>
              <p>今週の重要な目標と進捗状況を確認しましょう</p>
            </div>
            
            <div className="thisweek-grid">
              {/* 今週の目標 */}
              <div className="thisweek-card weekly-goals">
                <h3>🎯 今週の目標</h3>
                <div className="goals-list">
                  {plans.filter(plan => {
                    const targetDate = new Date(plan.targetDate);
                    const today = new Date();
                    const daysUntilDeadline = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDeadline <= 7 && plan.status !== 'completed';
                  }).map((plan, index) => (
                    <div key={index} className="goal-item">
                      <div className="goal-title">{plan.title}</div>
                      <div className="goal-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{plan.progress}%</span>
                      </div>
                      <div className="goal-deadline">
                        締切: {new Date(plan.targetDate).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 今週のスケジュール */}
              <div className="thisweek-card weekly-schedule">
                <h3>📅 今週のスケジュール</h3>
                <div className="weekly-schedule-list">
                  {schedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    const today = new Date();
                    const daysUntilSchedule = Math.ceil((scheduleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilSchedule >= 0 && daysUntilSchedule <= 7;
                  }).map((schedule, index) => (
                    <div key={index} className="weekly-schedule-item">
                      <div className="schedule-date">
                        {new Date(schedule.date).toLocaleDateString('ja-JP', { 
                          month: 'short', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                      <div className="schedule-content">
                        <div className="schedule-title">{schedule.title}</div>
                        <div className="schedule-time">{schedule.startTime} - {schedule.endTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 今月のタブ */}
        {activeTab === 'thismonth' && (
          <div className="thismonth-tab">
            <div className="thismonth-header">
              <h2>🗓️ 今月の目標と進捗</h2>
              <p>今月の重要な目標と進捗状況を確認しましょう</p>
            </div>
            
            <div className="thismonth-grid">
              {/* 今月の目標 */}
              <div className="thismonth-card monthly-goals">
                <h3>🎯 今月の目標</h3>
                <div className="monthly-goals-list">
                  {plans.filter(plan => {
                    const targetDate = new Date(plan.targetDate);
                    const today = new Date();
                    const daysUntilDeadline = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDeadline <= 30 && plan.status !== 'completed';
                  }).map((plan, index) => (
                    <div key={index} className="monthly-goal-item">
                      <div className="monthly-goal-title">{plan.title}</div>
                      <div className="monthly-goal-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{plan.progress}%</span>
                      </div>
                      <div className="monthly-goal-deadline">
                        締切: {new Date(plan.targetDate).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 今月の予算 */}
              <div className="thismonth-card monthly-budget">
                <h3>💰 今月の予算</h3>
                {financialSummary && (
                  <div className="budget-content">
                    <div className="budget-summary">
                      <div className="budget-item">
                        <span className="budget-label">予算:</span>
                        <span className="budget-value">{formatCurrency(financialSummary.budget)}</span>
                      </div>
                      <div className="budget-item">
                        <span className="budget-label">支出:</span>
                        <span className="budget-value">{formatCurrency(financialSummary.expenses)}</span>
                      </div>
                      <div className="budget-item">
                        <span className="budget-label">残り:</span>
                        <span className={`budget-value ${financialSummary.budget - financialSummary.expenses < 0 ? 'over-budget' : ''}`}>
                          {formatCurrency(financialSummary.budget - financialSummary.expenses)}
                        </span>
                      </div>
                    </div>
                    <div className="budget-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${Math.min(100, (financialSummary.expenses / financialSummary.budget) * 100)}%`,
                            backgroundColor: financialSummary.expenses > financialSummary.budget ? '#ff4444' : '#4CAF50'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 緊急のタブ */}
        {activeTab === 'urgent' && (
          <div className="urgent-tab">
            <div className="urgent-header">
              <h2>⚠️ 緊急対応が必要な事項</h2>
              <p>今すぐ対応が必要な重要な事項を確認しましょう</p>
            </div>
            
            <div className="urgent-grid">
              {/* 緊急の金銭的問題 */}
              <div className="urgent-card financial-urgent">
                <h3>💰 緊急の金銭的問題</h3>
                <div className="urgent-financial-list">
                  {getUrgentFinancialItems().map((item, index) => (
                    <div key={index} className={`urgent-item priority-${item.priority}`}>
                      <div className="urgent-icon">⚠️</div>
                      <div className="urgent-content">
                        <div className="urgent-title">{item.title}</div>
                        <div className="urgent-message">{item.message}</div>
                      </div>
                      <button className="urgent-action-button">
                        対応する
                      </button>
                    </div>
                  ))}
                  {getUrgentFinancialItems().length === 0 && (
                    <div className="no-urgent-financial">
                      <p>🎉 緊急の金銭的問題はありません！</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 緊急の計画 */}
              <div className="urgent-card plan-urgent">
                <h3>📋 緊急の計画</h3>
                <div className="urgent-plans-list">
                  {plans.filter(plan => {
                    const targetDate = new Date(plan.targetDate);
                    const today = new Date();
                    const daysUntilDeadline = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDeadline <= 3 && plan.status !== 'completed';
                  }).map((plan, index) => {
                    const targetDate = new Date(plan.targetDate);
                    const today = new Date();
                    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={index} className="urgent-plan-item">
                        <div className="urgent-plan-title">{plan.title}</div>
                        <div className="urgent-plan-info">
                          <span className="days-left">{daysLeft}日後締切</span>
                          <div className="urgent-progress-bar">
                            <div 
                              className="urgent-progress-fill" 
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {plans.filter(plan => {
                    const targetDate = new Date(plan.targetDate);
                    const today = new Date();
                    const daysUntilDeadline = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDeadline <= 3 && plan.status !== 'completed';
                  }).length === 0 && (
                    <div className="no-urgent-plans">
                      <p>🎉 緊急の計画はありません！</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 目標のタブ */}
        {activeTab === 'goals' && (
          <div className="goals-tab">
            <div className="goals-header">
              <h2>🎯 目標と計画</h2>
              <p>あなたの目標と計画の進捗状況を確認しましょう</p>
            </div>
            
            <div className="goals-grid">
              {/* 進行中の計画 */}
              <div className="goals-card active-plans">
                <h3>🚀 進行中の計画</h3>
                <div className="active-plans-list">
                  {plans.filter(plan => plan.status === 'in-progress').map((plan, index) => (
                    <div key={index} className="active-plan-item">
                      <div className="plan-title">{plan.title}</div>
                      <div className="plan-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{plan.progress}%</span>
                      </div>
                      <div className="plan-deadline">
                        締切: {new Date(plan.targetDate).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 完了した計画 */}
              <div className="goals-card completed-plans">
                <h3>✅ 完了した計画</h3>
                <div className="completed-plans-list">
                  {plans.filter(plan => plan.status === 'completed').slice(0, 5).map((plan, index) => (
                    <div key={index} className="completed-plan-item">
                      <div className="plan-title">{plan.title}</div>
                      <div className="plan-completed-date">
                        完了: {plan.completedDate ? new Date(plan.completedDate).toLocaleDateString('ja-JP') : '不明'}
                      </div>
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
