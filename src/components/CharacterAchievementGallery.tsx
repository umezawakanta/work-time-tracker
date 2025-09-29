import React, { useState, useEffect } from 'react';
import { Character, CharacterAchievement } from '../types/character';
import { characterManager } from '../utils/characterManager';
import './CharacterAchievementGallery.css';

interface CharacterAchievementGalleryProps {
  character: Character | null;
  onClose: () => void;
}

const CharacterAchievementGallery: React.FC<CharacterAchievementGalleryProps> = ({
  character,
  onClose
}) => {
  const [achievements, setAchievements] = useState<CharacterAchievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<CharacterAchievement | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rarity' | 'name'>('date');

  useEffect(() => {
    if (character) {
      const allAchievements = characterManager.getAchievements();
      setAchievements(allAchievements);
    }
  }, [character]);

  // フィルタリング
  const getFilteredAchievements = () => {
    let filtered = achievements;

    // カテゴリフィルタ
    switch (selectedCategory) {
      case 'unlocked':
        filtered = filtered.filter(achievement => achievement.unlocked);
        break;
      case 'locked':
        filtered = filtered.filter(achievement => !achievement.unlocked);
        break;
      default:
        // 'all' - フィルタなし
        break;
    }

    // ソート
    switch (sortBy) {
      case 'date':
        filtered = filtered.sort((a, b) => {
          if (a.unlocked && b.unlocked) {
            return new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime();
          }
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          return 0;
        });
        break;
      case 'rarity':
        const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4 };
        filtered = filtered.sort((a, b) => {
          if (a.unlocked && b.unlocked) {
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
          }
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        });
        break;
      case 'name':
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  };

  // レアリティの色を取得
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6c757d';
      case 'rare': return '#007bff';
      case 'epic': return '#6f42c1';
      case 'legendary': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  // レアリティの日本語名を取得
  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'コモン';
      case 'rare': return 'レア';
      case 'epic': return 'エピック';
      case 'legendary': return 'レジェンダリー';
      default: return 'コモン';
    }
  };

  // 進捗率を計算
  const getProgressPercentage = () => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    return Math.round((unlockedCount / achievements.length) * 100);
  };

  const filteredAchievements = getFilteredAchievements();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="achievement-gallery">
      <div className="gallery-header">
        <h3>🏆 アチーブメントギャラリー</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="gallery-stats">
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="progress-text">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} アチーブメント達成
          </span>
        </div>
      </div>

      <div className="gallery-controls">
        <div className="filter-controls">
          <button
            className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            すべて
          </button>
          <button
            className={`filter-button ${selectedCategory === 'unlocked' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('unlocked')}
          >
            達成済み
          </button>
          <button
            className={`filter-button ${selectedCategory === 'locked' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('locked')}
          >
            未達成
          </button>
        </div>

        <div className="sort-controls">
          <label htmlFor="sort-select">並び順:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'rarity' | 'name')}
            className="sort-select"
          >
            <option value="date">達成日順</option>
            <option value="rarity">レアリティ順</option>
            <option value="name">名前順</option>
          </select>
        </div>
      </div>

      <div className="gallery-content">
        <div className="achievement-grid">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} ${achievement.rarity}`}
              onClick={() => setSelectedAchievement(achievement)}
            >
              <div className="achievement-icon">
                {achievement.unlocked ? '🏆' : '🔒'}
              </div>
              <div className="achievement-info">
                <h4 className="achievement-name">{achievement.name}</h4>
                <p className="achievement-description">{achievement.description}</p>
                <div className="achievement-rarity" style={{ color: getRarityColor(achievement.rarity) }}>
                  {getRarityName(achievement.rarity)}
                </div>
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="achievement-date">
                    達成日: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAchievement && (
        <div className="achievement-detail-modal">
          <div className="achievement-detail-overlay" onClick={() => setSelectedAchievement(null)} />
          <div className="achievement-detail-content">
            <button className="close-detail-button" onClick={() => setSelectedAchievement(null)}>
              ×
            </button>
            <div className="detail-icon">
              {selectedAchievement.unlocked ? '🏆' : '🔒'}
            </div>
            <h3 className="detail-name">{selectedAchievement.name}</h3>
            <p className="detail-description">{selectedAchievement.description}</p>
            <div className="detail-rarity" style={{ color: getRarityColor(selectedAchievement.rarity) }}>
              レアリティ: {getRarityName(selectedAchievement.rarity)}
            </div>
            {selectedAchievement.unlocked ? (
              <div className="detail-status unlocked">
                ✅ 達成済み
                {selectedAchievement.unlockedAt && (
                  <div className="detail-date">
                    達成日: {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="detail-status locked">
                🔒 未達成
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterAchievementGallery;
