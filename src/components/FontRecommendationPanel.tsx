import React, { useState, useEffect } from 'react';
import { FontOption, FontSettings } from '../constants/fonts';
import { fontRecommendationEngine, UserPreferences, RecommendationContext, FontRecommendation } from '../utils/fontRecommendationEngine';
import './FontRecommendationPanel.css';

interface FontRecommendationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFontSelect: (font: FontOption, category: 'japanese' | 'english' | 'child-friendly') => void;
  currentSettings: FontSettings;
  availableFonts: FontOption[];
}

const FontRecommendationPanel: React.FC<FontRecommendationPanelProps> = ({
  isOpen,
  onClose,
  onFontSelect,
  currentSettings,
  availableFonts
}) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    ageGroup: 'adult',
    useCase: 'work',
    visualPreference: 'minimal',
    accessibilityNeeds: 'none',
    language: 'mixed'
  });
  
  const [recommendations, setRecommendations] = useState<FontRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'recommendations' | 'history'>('preferences');

  useEffect(() => {
    if (isOpen) {
      generateRecommendations();
    }
  }, [isOpen, userPreferences]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // 模擬的な使用履歴（実際の実装ではローカルストレージから取得）
      const usageHistory = JSON.parse(localStorage.getItem('fontUsageHistory') || '[]');
      
      const context: RecommendationContext = {
        currentSettings,
        userPreferences,
        usageHistory,
        timeOfDay: getCurrentTimeOfDay(),
        deviceType: getDeviceType()
      };

      const newRecommendations = fontRecommendationEngine.recommendFonts(
        availableFonts,
        context,
        6
      );

      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Recommendation generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFontSelect = (recommendation: FontRecommendation) => {
    onFontSelect(recommendation.font, recommendation.category);
    
    // 使用履歴を更新
    const usageHistory = JSON.parse(localStorage.getItem('fontUsageHistory') || '[]');
    usageHistory.push(recommendation.font.value);
    localStorage.setItem('fontUsageHistory', JSON.stringify(usageHistory.slice(-50))); // 最新50件のみ保持
  };

  const getRecommendationsByCategory = (category: 'japanese' | 'english' | 'child-friendly') => {
    return recommendations.filter(rec => rec.category === category);
  };

  if (!isOpen) return null;

  return (
    <div className="font-recommendation-overlay">
      <div className="font-recommendation-modal">
        <div className="font-recommendation-header">
          <h3>🤖 AI フォント推奨</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="font-recommendation-tabs">
          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ 設定
          </button>
          <button
            className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            🎯 推奨
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 履歴
          </button>
        </div>

        <div className="font-recommendation-body">
          {activeTab === 'preferences' && (
            <div className="preferences-panel">
              <h4>あなたの好みを教えてください</h4>
              
              <div className="preference-group">
                <label htmlFor="age-group">年齢グループ</label>
                <select
                  id="age-group"
                  value={userPreferences.ageGroup || 'adult'}
                  onChange={(e) => handlePreferenceChange('ageGroup', e.target.value)}
                  className="preference-select"
                >
                  <option value="child">こども</option>
                  <option value="teen">ティーン</option>
                  <option value="adult">大人</option>
                  <option value="senior">シニア</option>
                </select>
              </div>

              <div className="preference-group">
                <label htmlFor="use-case">主な用途</label>
                <select
                  id="use-case"
                  value={userPreferences.useCase || 'work'}
                  onChange={(e) => handlePreferenceChange('useCase', e.target.value)}
                  className="preference-select"
                >
                  <option value="work">仕事</option>
                  <option value="study">学習</option>
                  <option value="creative">クリエイティブ</option>
                  <option value="reading">読書</option>
                  <option value="gaming">ゲーム</option>
                </select>
              </div>

              <div className="preference-group">
                <label htmlFor="visual-preference">視覚的嗜好</label>
                <select
                  id="visual-preference"
                  value={userPreferences.visualPreference || 'minimal'}
                  onChange={(e) => handlePreferenceChange('visualPreference', e.target.value)}
                  className="preference-select"
                >
                  <option value="minimal">ミニマル</option>
                  <option value="decorative">装飾的</option>
                  <option value="handwritten">手書き風</option>
                  <option value="modern">モダン</option>
                  <option value="classic">クラシック</option>
                </select>
              </div>

              <div className="preference-group">
                <label htmlFor="accessibility">アクセシビリティ</label>
                <select
                  id="accessibility"
                  value={userPreferences.accessibilityNeeds || 'none'}
                  onChange={(e) => handlePreferenceChange('accessibilityNeeds', e.target.value)}
                  className="preference-select"
                >
                  <option value="none">なし</option>
                  <option value="high-contrast">高コントラスト</option>
                  <option value="large-text">大きな文字</option>
                  <option value="dyslexia-friendly">読み書き困難に配慮</option>
                </select>
              </div>

              <div className="preference-group">
                <label htmlFor="language">言語</label>
                <select
                  id="language"
                  value={userPreferences.language || 'mixed'}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="preference-select"
                >
                  <option value="japanese">日本語のみ</option>
                  <option value="english">英語のみ</option>
                  <option value="mixed">両方</option>
                </select>
              </div>

              <button 
                className="generate-button"
                onClick={generateRecommendations}
                disabled={isLoading}
              >
                {isLoading ? '生成中...' : '推奨を生成'}
              </button>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="recommendations-panel">
              <h4>おすすめフォント</h4>
              
              {isLoading ? (
                <div className="loading">推奨を生成中...</div>
              ) : (
                <div className="recommendations-grid">
                  {['japanese', 'english', 'child-friendly'].map(category => {
                    const categoryRecommendations = getRecommendationsByCategory(category as any);
                    if (categoryRecommendations.length === 0) return null;

                    return (
                      <div key={category} className="category-section">
                        <h5>
                          {category === 'japanese' ? '日本語' : 
                           category === 'english' ? '英語' : 'こども向け'}
                        </h5>
                        <div className="recommendation-list">
                          {categoryRecommendations.map((rec, index) => (
                            <div key={`${rec.font.value}-${index}`} className="recommendation-item">
                              <div className="recommendation-preview">
                                <p 
                                  style={{ 
                                    fontFamily: rec.font.value === 'system' ? 'inherit' : rec.font.value,
                                    fontSize: '16px'
                                  }}
                                >
                                  {rec.font.label}
                                </p>
                              </div>
                              <div className="recommendation-info">
                                <div className="recommendation-score">
                                  スコア: {Math.round(rec.score * 100)}%
                                </div>
                                <div className="recommendation-reasons">
                                  {rec.reasons.map((reason, idx) => (
                                    <span key={idx} className="reason-tag">
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  className="select-button"
                                  onClick={() => handleFontSelect(rec)}
                                >
                                  選択
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-panel">
              <h4>使用履歴</h4>
              <div className="history-stats">
                <p>最近使用したフォントの履歴を基にした推奨</p>
                <button 
                  className="history-button"
                  onClick={() => {
                    const historyRecommendations = fontRecommendationEngine.recommendBasedOnHistory(
                      availableFonts,
                      JSON.parse(localStorage.getItem('fontUsageHistory') || '[]'),
                      5
                    );
                    setRecommendations(historyRecommendations);
                    setActiveTab('recommendations');
                  }}
                >
                  履歴ベースの推奨を表示
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontRecommendationPanel;
