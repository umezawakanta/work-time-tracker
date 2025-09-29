// キャラクター成長表示コンポーネント

import React, { useState, useEffect } from 'react';
import { Character, UserCharacterSettings } from '../types/character';
import { characterGrowthManager } from '../utils/characterGrowthManager';
import { badgeManager } from '../utils/badgeManager';
import './CharacterGrowthDisplay.css';

interface CharacterGrowthDisplayProps {
  character: Character;
  characterSettings: UserCharacterSettings;
}

const CharacterGrowthDisplay: React.FC<CharacterGrowthDisplayProps> = ({
  character,
  characterSettings
}) => {
  const [growthProgress, setGrowthProgress] = useState<any>(null);
  const [badgeStats, setBadgeStats] = useState<any>(null);

  useEffect(() => {
    // 成長進捗を計算
    const progress = characterGrowthManager.getGrowthProgress(character);
    setGrowthProgress(progress);

    // バッジ統計を取得
    const stats = badgeManager.getBadgeStats();
    setBadgeStats(stats);
  }, [character]);

  if (!growthProgress || !badgeStats) {
    return <div className="loading">読み込み中...</div>;
  }

  const growthStageInfo = characterGrowthManager.getGrowthStageInfo(character.growthStage);

  return (
    <div className="character-growth-display">
      <div className="growth-header">
        <h3>🌱 {character.name}の成長</h3>
        <div className="growth-stage">
          <span className="stage-emoji">{growthStageInfo.emoji}</span>
          <span className="stage-name">{growthStageInfo.name}</span>
          <span className="evolution-level">進化レベル: {character.evolutionLevel}</span>
        </div>
      </div>

      <div className="growth-content">
        {/* レベル情報 */}
        <div className="level-section">
          <h4>📊 レベル情報</h4>
          <div className="level-info">
            <div className="level-display">
              <span className="current-level">Lv.{growthProgress.currentLevel}</span>
              <div className="exp-bar">
                <div 
                  className="exp-fill"
                  style={{ width: `${growthProgress.progress}%` }}
                ></div>
                <span className="exp-text">
                  {growthProgress.currentExp} / {growthProgress.nextLevelExp} EXP
                </span>
              </div>
            </div>
            <div className="exp-details">
              <p>次のレベルまで: {growthProgress.nextLevelExp - growthProgress.currentExp} EXP</p>
              <p>進捗: {growthProgress.progress}%</p>
            </div>
          </div>
        </div>

        {/* ステータス */}
        <div className="stats-section">
          <h4>💪 ステータス</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">💪</span>
              <span className="stat-name">力</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill strength"
                  style={{ width: `${character.stats.strength}%` }}
                ></div>
                <span className="stat-value">{character.stats.strength}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🧠</span>
              <span className="stat-name">知性</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill intelligence"
                  style={{ width: `${character.stats.intelligence}%` }}
                ></div>
                <span className="stat-value">{character.stats.intelligence}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎨</span>
              <span className="stat-name">創造性</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill creativity"
                  style={{ width: `${character.stats.creativity}%` }}
                ></div>
                <span className="stat-value">{character.stats.creativity}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏃</span>
              <span className="stat-name">持久力</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill endurance"
                  style={{ width: `${character.stats.endurance}%` }}
                ></div>
                <span className="stat-value">{character.stats.endurance}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🤝</span>
              <span className="stat-name">社交性</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill social"
                  style={{ width: `${character.stats.social}%` }}
                ></div>
                <span className="stat-value">{character.stats.social}</span>
              </div>
            </div>
          </div>
          <div className="stats-summary">
            <p>総ステータス: {growthProgress.totalStats} / {growthProgress.maxStats}</p>
            <p>ステータス完成度: {Math.round((growthProgress.totalStats / growthProgress.maxStats) * 100)}%</p>
          </div>
        </div>

        {/* バッジ情報 */}
        <div className="badges-section">
          <h4>🎖️ バッジ情報</h4>
          <div className="badge-stats">
            <div className="badge-stat-item">
              <span className="badge-stat-label">獲得バッジ</span>
              <span className="badge-stat-value">{badgeStats.unlockedCount} / {badgeStats.totalBadges}</span>
            </div>
            <div className="badge-stat-item">
              <span className="badge-stat-label">総経験値</span>
              <span className="badge-stat-value">{badgeStats.totalXP} XP</span>
            </div>
            <div className="badge-stat-item">
              <span className="badge-stat-label">完成率</span>
              <span className="badge-stat-value">{badgeStats.completionRate}%</span>
            </div>
          </div>
          <div className="badge-rarity-breakdown">
            <h5>レアリティ別バッジ</h5>
            <div className="rarity-stats">
              <div className="rarity-item common">
                <span className="rarity-name">コモン</span>
                <span className="rarity-count">{badgeStats.rarityCounts.common}</span>
              </div>
              <div className="rarity-item rare">
                <span className="rarity-name">レア</span>
                <span className="rarity-count">{badgeStats.rarityCounts.rare}</span>
              </div>
              <div className="rarity-item epic">
                <span className="rarity-name">エピック</span>
                <span className="rarity-count">{badgeStats.rarityCounts.epic}</span>
              </div>
              <div className="rarity-item legendary">
                <span className="rarity-name">レジェンダリー</span>
                <span className="rarity-count">{badgeStats.rarityCounts.legendary}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 成長のヒント */}
        <div className="growth-tips">
          <h4>💡 成長のヒント</h4>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">⏰</span>
              <span className="tip-text">作業時間を記録して経験値を獲得しよう</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📝</span>
              <span className="tip-text">日記を書いて知性と創造性を向上させよう</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🎯</span>
              <span className="tip-text">目標を達成してバッジを獲得しよう</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔥</span>
              <span className="tip-text">継続して作業して持久力を鍛えよう</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterGrowthDisplay;
