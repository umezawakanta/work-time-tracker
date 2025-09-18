import React from 'react';
import './HetamaIconComponent.css';

interface HetamaIconComponentProps {
  featureId: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const HetamaIconComponent: React.FC<HetamaIconComponentProps> = ({
  featureId,
  size = 'medium',
  className = '',
}) => {
  const getIconForFeature = (id: string) => {
    const iconMap: { [key: string]: string } = {
      'time-tracking': '⏰',
      'cooking-timer': '🍳',
      'projects': '📁',
      'reports': '📊',
      'admin-panel': '👑',
      'bookshelf': '📚',
      'memos': '📝',
      'public-memos': '🌐',
      'work-records': '💼',
      'timers': '⏱️',
      'self-analysis': '👤',
    };
    return iconMap[id] || '⭐';
  };

  return (
    <div className={`hetama-icon hetama-icon-${size} ${className}`}>
      <div className="hetama-icon-inner">
        <span className="hetama-icon-emoji">{getIconForFeature(featureId)}</span>
        <div className="hetama-icon-aura"></div>
        <div className="hetama-icon-sparkles">
          <span className="sparkle sparkle-1">✨</span>
          <span className="sparkle sparkle-2">✨</span>
          <span className="sparkle sparkle-3">✨</span>
        </div>
      </div>
    </div>
  );
};

export default HetamaIconComponent;
