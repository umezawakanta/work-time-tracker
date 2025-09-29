// バッジ通知コンポーネント

import React, { useState, useEffect } from 'react';
import { Badge } from '../types/badge';
import BadgeDisplay from './BadgeDisplay';
import './BadgeNotification.css';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
  onShare?: (badge: Badge) => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badge,
  onClose,
  onShare
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);

  useEffect(() => {
    // アニメーション用の遅延
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // シェアボタン表示用の遅延
    const shareTimer = setTimeout(() => {
      setShowShareButton(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(shareTimer);
    };
  }, []);

  const handleShare = () => {
    if (onShare) {
      onShare(badge);
    }
  };

  return (
    <div className={`badge-notification ${isVisible ? 'visible' : ''}`}>
      <div className="badge-notification-content">
        <div className="badge-notification-header">
          <h3>🎉 新しいバッジを獲得しました！</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="badge-notification-body">
          <BadgeDisplay
            badge={badge}
            size="large"
            showName={true}
            showDescription={true}
            isNew={true}
          />
          
          <div className="badge-notification-text">
            <h4>{badge.name}</h4>
            <p>{badge.description}</p>
            <div className="badge-reward">
              <span className="xp-reward">+{badge.xpReward} XP</span>
            </div>
          </div>
        </div>
        
        {showShareButton && (
          <div className="badge-notification-actions">
            <button className="share-button" onClick={handleShare}>
              <span className="twitter-icon">𝕏</span>
              Xでシェア
            </button>
            <button className="close-action-button" onClick={onClose}>
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeNotification;
