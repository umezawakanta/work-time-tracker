// バッジ表示コンポーネント

import React from 'react';
import { Badge } from '../types/badge';
import { BADGE_RARITY_GRADIENTS } from '../constants/badges';
import './BadgeDisplay.css';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  showDescription?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  size = 'medium',
  showName = true,
  showDescription = false,
  isNew = false,
  onClick
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'badge-small';
      case 'large': return 'badge-large';
      default: return 'badge-medium';
    }
  };

  const getRarityGradient = () => {
    return BADGE_RARITY_GRADIENTS[badge.rarity];
  };

  return (
    <div 
      className={`badge-display ${getSizeClass()} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ background: getRarityGradient() }}
    >
      {isNew && <div className="badge-new-indicator">NEW</div>}
      
      <div className="badge-icon">
        {badge.icon}
      </div>
      
      {showName && (
        <div className="badge-name">
          {badge.name}
        </div>
      )}
      
      {showDescription && (
        <div className="badge-description">
          {badge.description}
        </div>
      )}
      
      <div className="badge-rarity">
        {badge.rarity.toUpperCase()}
      </div>
    </div>
  );
};

export default BadgeDisplay;
