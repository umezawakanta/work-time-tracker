// 無駄遣い監視ダッシュボードコンポーネント

import React, { useState, useEffect } from 'react';
import { WasteAnalysisManager } from '../utils/wasteAnalysisManager';
import { WasteRecord, WasteAnalysis, WasteGoal, WasteAlert, WASTE_CATEGORIES } from '../types/wasteAnalysis';
import './WasteAnalysisDashboard.css';

interface WasteAnalysisDashboardProps {
  userId: string;
  onClose: () => void;
}

const WasteAnalysisDashboard: React.FC<WasteAnalysisDashboardProps> = ({ userId, onClose }) => {
  const [wasteAnalysis, setWasteAnalysis] = useState<WasteAnalysis | null>(null);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [wasteGoals, setWasteGoals] = useState<WasteGoal[]>([]);
  const [wasteAlerts, setWasteAlerts] = useState<WasteAlert[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'goals' | 'alerts'>('overview');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const wasteManager = WasteAnalysisManager.getInstance();

  useEffect(() => {
    wasteManager.loadFromLocalStorage();
    loadData();
  }, [userId, selectedPeriod]);

  const loadData = () => {
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

    const analysis = wasteManager.generateWasteAnalysis(userId, startDate, endDate);
    const records = wasteManager.getWasteRecords(userId);
    const goals = wasteManager.getWasteGoals(userId);
    const alerts = wasteManager.getWasteAlerts(userId);

    setWasteAnalysis(analysis);
    setWasteRecords(records);
    setWasteGoals(goals);
    setWasteAlerts(alerts);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  const getWasteScoreColor = (score: number): string => {
    if (score <= 30) return '#4CAF50'; // 緑
    if (score <= 60) return '#FF9800'; // オレンジ
    return '#F44336'; // 赤
  };

  const getWasteScoreLabel = (score: number): string => {
    if (score <= 30) return '良好';
    if (score <= 60) return '注意';
    return '要改善';
  };

  return (
    <div className="waste-analysis-dashboard">
      <div className="comprehensive-dashboard-header">
        <h2>無駄遣い監視ダッシュボード</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="dashboard-controls">
        <div className="period-selector">
          <button 
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            1週間
          </button>
          <button 
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            1ヶ月
          </button>
          <button 
            className={selectedPeriod === 'year' ? 'active' : ''}
            onClick={() => setSelectedPeriod('year')}
          >
            1年
          </button>
        </div>

        <div className="tab-navigation">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            概要
          </button>
          <button 
            className={activeTab === 'records' ? 'active' : ''}
            onClick={() => setActiveTab('records')}
          >
            記録
          </button>
          <button 
            className={activeTab === 'goals' ? 'active' : ''}
            onClick={() => setActiveTab('goals')}
          >
            目標
          </button>
          <button 
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={() => setActiveTab('alerts')}
          >
            アラート
            {wasteManager.getUnreadAlertsCount(userId) > 0 && (
              <span className="alert-badge">{wasteManager.getUnreadAlertsCount(userId)}</span>
            )}
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && wasteAnalysis && (
          <div className="overview-tab">
            {/* 無駄遣いスコア */}
            <div className="waste-score-card">
              <h3>無駄遣いスコア</h3>
              <div className="score-display">
                <div 
                  className="score-circle"
                  style={{ 
                    background: `conic-gradient(${getWasteScoreColor(wasteAnalysis.wasteScore)} 0deg ${wasteAnalysis.wasteScore * 3.6}deg, #e0e0e0 ${wasteAnalysis.wasteScore * 3.6}deg 360deg)`
                  }}
                >
                  <div className="score-inner">
                    <span className="score-number">{wasteAnalysis.wasteScore}</span>
                    <span className="score-label">{getWasteScoreLabel(wasteAnalysis.wasteScore)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 総無駄遣い */}
            <div className="total-waste-cards">
              <div className="waste-card money">
                <div className="waste-icon">💰</div>
                <div className="waste-info">
                  <h4>お金の無駄</h4>
                  <p className="waste-amount">{formatCurrency(wasteAnalysis.totalWaste.money)}</p>
                </div>
              </div>
              <div className="waste-card time">
                <div className="waste-icon">⏰</div>
                <div className="waste-info">
                  <h4>時間の無駄</h4>
                  <p className="waste-amount">{formatTime(wasteAnalysis.totalWaste.time)}</p>
                </div>
              </div>
              <div className="waste-card effort">
                <div className="waste-icon">💪</div>
                <div className="waste-info">
                  <h4>労力の無駄</h4>
                  <p className="waste-amount">{wasteAnalysis.totalWaste.effort}pt</p>
                </div>
              </div>
            </div>

            {/* 上位無駄遣い源 */}
            <div className="top-waste-sources">
              <h3>上位無駄遣い源</h3>
              <div className="sources-list">
                {wasteAnalysis.topWasteSources.map((source, index) => (
                  <div key={source.categoryId} className="source-item">
                    <div className="source-rank">#{index + 1}</div>
                    <div className="source-info">
                      <h4>{source.categoryName}</h4>
                      <p>{source.count}回 - {formatCurrency(source.totalAmount)}</p>
                    </div>
                    <div className="source-percentage">
                      {source.wastePercentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 改善提案 */}
            <div className="improvement-suggestions">
              <h3>改善提案</h3>
              <div className="suggestions-list">
                {wasteAnalysis.improvementSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="suggestion-card">
                    <div className="suggestion-header">
                      <h4>{suggestion.title}</h4>
                      <span className={`priority-badge ${suggestion.priority}`}>
                        {suggestion.priority === 'high' ? '高' : 
                         suggestion.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <p className="suggestion-description">{suggestion.description}</p>
                    <div className="suggestion-savings">
                      {suggestion.potentialSavings.money && (
                        <span>節約: {formatCurrency(suggestion.potentialSavings.money)}</span>
                      )}
                      {suggestion.potentialSavings.time && (
                        <span>時間: {formatTime(suggestion.potentialSavings.time)}</span>
                      )}
                      {suggestion.potentialSavings.effort && (
                        <span>労力: {suggestion.potentialSavings.effort}pt</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="records-tab">
            <div className="records-header">
              <h3>無駄遣い記録</h3>
              <button 
                className="add-record-button"
                onClick={() => setShowAddRecord(true)}
              >
                + 記録を追加
              </button>
            </div>
            <div className="records-list">
              {wasteRecords.map((record) => {
                const category = WASTE_CATEGORIES.find(cat => cat.id === record.categoryId);
                return (
                  <div key={record.id} className={`record-item ${record.isWasteful ? 'wasteful' : 'efficient'}`}>
                    <div className="record-icon">{category?.icon}</div>
                    <div className="record-info">
                      <h4>{category?.name}</h4>
                      <p>{record.description}</p>
                      <div className="record-meta">
                        <span className="record-date">
                          {record.date.toLocaleDateString('ja-JP')}
                        </span>
                        <span className="record-amount">
                          {record.type === 'money' && formatCurrency(record.amount)}
                          {record.type === 'time' && formatTime(record.amount)}
                          {record.type === 'effort' && `${record.amount}pt`}
                        </span>
                      </div>
                    </div>
                    <div className="record-status">
                      {record.isWasteful ? '無駄' : '効率的'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="goals-tab">
            <div className="goals-header">
              <h3>無駄遣い削減目標</h3>
              <button 
                className="add-goal-button"
                onClick={() => setShowAddGoal(true)}
              >
                + 目標を追加
              </button>
            </div>
            <div className="goals-list">
              {wasteGoals.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <h4>{goal.title}</h4>
                    <span className={`goal-status ${goal.isActive ? 'active' : 'inactive'}`}>
                      {goal.isActive ? 'アクティブ' : '非アクティブ'}
                    </span>
                  </div>
                  <p className="goal-description">{goal.description}</p>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {goal.progress.toFixed(1)}% ({goal.currentAmount}/{goal.targetAmount})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="alerts-tab">
            <h3>アラート</h3>
            <div className="alerts-list">
              {wasteAlerts.map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.severity} ${alert.isRead ? 'read' : 'unread'}`}>
                  <div className="alert-icon">
                    {alert.severity === 'high' ? '🚨' : 
                     alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                    {alert.suggestedAction && (
                      <p className="alert-suggestion">{alert.suggestedAction}</p>
                    )}
                    <span className="alert-date">
                      {alert.createdAt.toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteAnalysisDashboard;
