// バッジギャラリーコンポーネント

import React, { useState, useEffect } from 'react';
import { Badge, BadgeProgress } from '../types/badge';
import { badgeManager } from '../utils/badgeManager';
import { BADGES, BADGE_RARITY_COLORS } from '../constants/badges';
import BadgeDisplay from './BadgeDisplay';
import './BadgeGallery.css';

interface BadgeGalleryProps {
  onClose: () => void;
  onBadgeClick?: (badge: Badge) => void;
}

const BadgeGallery: React.FC<BadgeGalleryProps> = ({
  onClose,
  onBadgeClick
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [badgeStats, setBadgeStats] = useState<any>(null);

  useEffect(() => {
    // バッジ進捗と統計を取得
    setBadgeProgress(badgeManager.getBadgeProgress());
    setBadgeStats(badgeManager.getBadgeStats());
  }, []);

  const categories = [
    { id: 'all', name: 'すべて', icon: '🏆' },
    { id: 'registration', name: '登録', icon: '🎉' },
    { id: 'achievement', name: '実績', icon: '🎯' },
    { id: 'milestone', name: 'マイルストーン', icon: '📈' },
    { id: 'special', name: '特別', icon: '⭐' }
  ];

  const rarities = [
    { id: 'all', name: 'すべて', color: '#95a5a6' },
    { id: 'common', name: 'コモン', color: BADGE_RARITY_COLORS.common },
    { id: 'rare', name: 'レア', color: BADGE_RARITY_COLORS.rare },
    { id: 'epic', name: 'エピック', color: BADGE_RARITY_COLORS.epic },
    { id: 'legendary', name: 'レジェンダリー', color: BADGE_RARITY_COLORS.legendary }
  ];

  const filteredBadges = BADGES.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const getBadgeProgress = (badgeId: string): BadgeProgress | undefined => {
    return badgeProgress.find(p => p.badgeId === badgeId);
  };

  const handleBadgeClick = (badge: Badge) => {
    if (onBadgeClick) {
      onBadgeClick(badge);
    }
  };

  return (
    <div className="badge-gallery">
      <div className="badge-gallery-header">
        <h2>🏆 バッジギャラリー</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      {badgeStats && (
        <div className="badge-stats">
          <div className="stat-item">
            <span className="stat-label">獲得バッジ</span>
            <span className="stat-value">{badgeStats.unlockedCount} / {badgeStats.totalBadges}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">総経験値</span>
            <span className="stat-value">{badgeStats.totalXP} XP</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">完成率</span>
            <span className="stat-value">{badgeStats.completionRate}%</span>
          </div>
        </div>
      )}

      <div className="badge-filters">
        <div className="filter-group">
          <label>カテゴリ</label>
          <div className="filter-buttons">
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-button ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="filter-icon">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>レアリティ</label>
          <div className="filter-buttons">
            {rarities.map(rarity => (
              <button
                key={rarity.id}
                className={`filter-button ${selectedRarity === rarity.id ? 'active' : ''}`}
                onClick={() => setSelectedRarity(rarity.id)}
                style={{ borderColor: rarity.color }}
              >
                <span 
                  className="rarity-indicator" 
                  style={{ backgroundColor: rarity.color }}
                ></span>
                {rarity.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="badge-grid">
        {filteredBadges.map(badge => {
          const progress = getBadgeProgress(badge.id);
          const isUnlocked = progress?.isUnlocked || false;
          
          return (
            <div 
              key={badge.id} 
              className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => handleBadgeClick(badge)}
            >
              <BadgeDisplay
                badge={badge}
                size="medium"
                showName={true}
                showDescription={true}
                isNew={false}
              />
              
              {!isUnlocked && (
                <div className="badge-lock-overlay">
                  <div className="lock-icon">🔒</div>
                  <div className="unlock-condition">
                    {badge.unlockCondition}
                  </div>
                </div>
              )}
              
              {progress && !isUnlocked && progress.progress > 0 && (
                <div className="badge-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                  <span className="progress-text">{progress.progress}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGallery;
