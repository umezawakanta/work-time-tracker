import React from 'react';
import { DetailedNutritionScore } from './NutritionAnalysis';
import './NutritionAnalysisDisplay.css';

interface NutritionAnalysisDisplayProps {
  nutritionScore: DetailedNutritionScore | null;
  recommendedGenres: string[];
  onGenreSelect?: (genreId: string) => void;
}

const NutritionAnalysisDisplay: React.FC<NutritionAnalysisDisplayProps> = ({
  nutritionScore,
  recommendedGenres,
  onGenreSelect
}) => {
  if (!nutritionScore) {
    return (
      <div className="nutrition-analysis-display">
        <h3>栄養分析</h3>
        <p>食事を記録して音楽を生成してください</p>
      </div>
    );
  }

  const { overallScore, categoryScores, nutrientScores, balanceAnalysis } = nutritionScore;

  // スコアに基づく色を決定
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50'; // 緑
    if (score >= 0.6) return '#FFC107'; // 黄
    if (score >= 0.4) return '#FF9800'; // オレンジ
    return '#F44336'; // 赤
  };

  // カテゴリ名のマッピング
  const categoryNames: { [key: string]: string } = {
    'staple': '主食',
    'side': '副菜',
    'miso': '味噌',
    'meat': '肉',
    'fish': '魚',
    'vegetable': '野菜'
  };

  // 栄養素名のマッピング
  const nutrientNames: { [key: string]: string } = {
    'carbohydrate': '炭水化物',
    'protein': 'タンパク質',
    'vitamin': 'ビタミン',
    'mineral': 'ミネラル',
    'fiber': '食物繊維',
    'fat': '脂質'
  };

  // ジャンル名のマッピング
  const genreNames: { [key: string]: string } = {
    'balance': 'バランス',
    'meiwa': '明和電機風',
    'rock': 'ロック',
    'techno': 'テクノ',
    'classical': 'クラシック',
    'japanese': '和楽器',
    'jazz': 'ジャズ',
    'ambient': 'アンビエント',
    'custom': 'カスタム'
  };

  return (
    <div className="nutrition-analysis-display">
      <h3>栄養分析結果</h3>
      
      {/* 総合スコア */}
      <div className="overall-score">
        <div className="score-circle" style={{ borderColor: getScoreColor(overallScore) }}>
          <span className="score-value">{(overallScore * 100).toFixed(0)}</span>
          <span className="score-label">点</span>
        </div>
        <div className="score-description">
          {overallScore >= 0.8 && "素晴らしいバランスです！🎵"}
          {overallScore >= 0.6 && overallScore < 0.8 && "良いバランスです！"}
          {overallScore >= 0.4 && overallScore < 0.6 && "まあまあのバランスです"}
          {overallScore < 0.4 && "バランスを改善しましょう"}
        </div>
      </div>

      {/* カテゴリ別スコア */}
      <div className="category-scores">
        <h4>カテゴリ別スコア</h4>
        <div className="score-grid">
          {Object.entries(categoryScores).map(([categoryId, score]) => (
            <div key={categoryId} className="score-item">
              <div className="score-label">{categoryNames[categoryId] || categoryId}</div>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${score * 100}%`,
                    backgroundColor: getScoreColor(score)
                  }}
                />
              </div>
              <div className="score-value">{(score * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* 栄養素別スコア */}
      <div className="nutrient-scores">
        <h4>栄養素別スコア</h4>
        <div className="score-grid">
          {Object.entries(nutrientScores).map(([nutrientType, score]) => (
            <div key={nutrientType} className="score-item">
              <div className="score-label">{nutrientNames[nutrientType] || nutrientType}</div>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${score * 100}%`,
                    backgroundColor: getScoreColor(score)
                  }}
                />
              </div>
              <div className="score-value">{(score * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* バランス分析 */}
      <div className="balance-analysis">
        <h4>バランス分析</h4>
        
        {balanceAnalysis.strengths.length > 0 && (
          <div className="analysis-section strengths">
            <h5>✅ 強み</h5>
            <ul>
              {balanceAnalysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {balanceAnalysis.weaknesses.length > 0 && (
          <div className="analysis-section weaknesses">
            <h5>⚠️ 改善点</h5>
            <ul>
              {balanceAnalysis.weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {balanceAnalysis.recommendations.length > 0 && (
          <div className="analysis-section recommendations">
            <h5>💡 推奨事項</h5>
            <ul>
              {balanceAnalysis.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 推奨ジャンル */}
      {recommendedGenres.length > 0 && (
        <div className="recommended-genres">
          <h4>推奨ジャンル</h4>
          <div className="genre-buttons">
            {recommendedGenres.map((genreId) => (
              <button
                key={genreId}
                className="genre-button"
                onClick={() => onGenreSelect?.(genreId)}
              >
                {genreNames[genreId] || genreId}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionAnalysisDisplay;
