import React, { useState, useEffect } from 'react';
import './DataAnalysisComponent.css';
import type { DataAnalysis, ImprovementSuggestion, Prediction, User } from '../types';
import { dataAnalysisManager } from '../utils/dataAnalysisManager';

interface DataAnalysisComponentProps {
  showDataAnalysis: boolean;
  setShowDataAnalysis: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  user: User | null;
}

const DataAnalysisComponent: React.FC<DataAnalysisComponentProps> = ({
  showDataAnalysis,
  setShowDataAnalysis,
  closeOtherFeatures,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'analyses' | 'suggestions' | 'predictions'>('analyses');
  const [analyses, setAnalyses] = useState<DataAnalysis[]>([]);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (showDataAnalysis) {
      loadData();
    }
  }, [showDataAnalysis]);

  const loadData = () => {
    setAnalyses(dataAnalysisManager.getAnalyses());
    setSuggestions(dataAnalysisManager.getSuggestions());
    setPredictions(dataAnalysisManager.getPredictions());
  };

  const generateAnalysis = async () => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      // 実際のデータを取得して分析を実行
      const newSuggestions = dataAnalysisManager.generateSuggestions(user.id);
      const newPredictions = dataAnalysisManager.generatePredictions(user.id);
      
      // データを再読み込み
      loadData();
    } catch (error) {
      console.error('Failed to generate analysis:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const markSuggestionImplemented = (id: string) => {
    dataAnalysisManager.markSuggestionImplemented(id);
    loadData();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#f44336';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9e9e9e';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'low': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  if (!showDataAnalysis) return null;

  return (
    <div className="data-analysis-component">
      <div className="analysis-header">
        <h2>データ分析・洞察</h2>
        <div className="analysis-controls">
          <button
            className="generate-btn"
            onClick={generateAnalysis}
            disabled={isGenerating}
          >
            {isGenerating ? '分析中...' : '分析を生成'}
          </button>
          <button
            className="close-btn"
            onClick={() => setShowDataAnalysis(false)}
          >
            ×
          </button>
        </div>
      </div>

      <div className="analysis-tabs">
        <button
          className={`tab ${activeTab === 'analyses' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyses')}
        >
          分析結果
        </button>
        <button
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          改善提案
        </button>
        <button
          className={`tab ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          予測
        </button>
      </div>

      <div className="analysis-content">
        {activeTab === 'analyses' && (
          <div className="analyses-section">
            <div className="section-header">
              <h3>分析結果</h3>
            </div>
            <div className="analyses-list">
              {analyses.length === 0 ? (
                <p className="no-items">分析結果がありません</p>
              ) : (
                analyses.map(analysis => (
                  <div key={analysis._id} className="analysis-item">
                    <div className="item-header">
                      <h4>{analysis.title}</h4>
                      <div className="confidence-badge" style={{ backgroundColor: getConfidenceColor(analysis.confidence) }}>
                        信頼度: {analysis.confidence}%
                      </div>
                    </div>
                    <div className="item-details">
                      <p>{analysis.description}</p>
                      <div className="insights">
                        <h5>洞察:</h5>
                        <ul>
                          {analysis.insights.map((insight, index) => (
                            <li key={index}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="recommendations">
                        <h5>推奨事項:</h5>
                        <ul>
                          {analysis.recommendations.map((recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-section">
            <div className="section-header">
              <h3>改善提案</h3>
            </div>
            <div className="suggestions-list">
              {suggestions.length === 0 ? (
                <p className="no-items">改善提案がありません</p>
              ) : (
                suggestions.map(suggestion => (
                  <div key={suggestion._id} className={`suggestion-item ${suggestion.isImplemented ? 'implemented' : ''}`}>
                    <div className="item-header">
                      <h4>{suggestion.title}</h4>
                      <div className="suggestion-badges">
                        <span className="priority-badge" style={{ backgroundColor: getPriorityColor(suggestion.priority) }}>
                          {suggestion.priority}
                        </span>
                        <span className="impact-badge" style={{ backgroundColor: getImpactColor(suggestion.impact) }}>
                          {suggestion.impact}
                        </span>
                        {suggestion.isImplemented && (
                          <span className="implemented-badge">実装済み</span>
                        )}
                      </div>
                    </div>
                    <div className="item-details">
                      <p>{suggestion.description}</p>
                      <div className="suggestion-meta">
                        <p><strong>カテゴリ:</strong> {suggestion.category}</p>
                        <p><strong>期待される効果:</strong> {suggestion.estimatedBenefit}</p>
                        <p><strong>工数:</strong> {suggestion.effort}</p>
                      </div>
                      <div className="action-steps">
                        <h5>アクションステップ:</h5>
                        <ol>
                          {suggestion.actionSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      {!suggestion.isImplemented && (
                        <button
                          className="implement-btn"
                          onClick={() => markSuggestionImplemented(suggestion._id)}
                        >
                          実装済みにする
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="predictions-section">
            <div className="section-header">
              <h3>予測</h3>
            </div>
            <div className="predictions-list">
              {predictions.length === 0 ? (
                <p className="no-items">予測がありません</p>
              ) : (
                predictions.map(prediction => (
                  <div key={prediction._id} className="prediction-item">
                    <div className="item-header">
                      <h4>{prediction.title}</h4>
                      <div className="confidence-badge" style={{ backgroundColor: getConfidenceColor(prediction.confidence) }}>
                        信頼度: {prediction.confidence}%
                      </div>
                    </div>
                    <div className="item-details">
                      <p>{prediction.description}</p>
                      <div className="prediction-values">
                        <div className="value-item">
                          <span className="label">現在値:</span>
                          <span className="value">{prediction.currentValue.toLocaleString()}</span>
                        </div>
                        <div className="value-item">
                          <span className="label">予測値:</span>
                          <span className="value predicted">{prediction.predictedValue.toLocaleString()}</span>
                        </div>
                        <div className="value-item">
                          <span className="label">期間:</span>
                          <span className="value">{prediction.timeframe}</span>
                        </div>
                      </div>
                      <div className="factors">
                        <h5>影響要因:</h5>
                        <ul>
                          {prediction.factors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="recommendations">
                        <h5>推奨事項:</h5>
                        <ul>
                          {prediction.recommendations.map((recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalysisComponent;
