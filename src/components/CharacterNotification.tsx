import React, { useState, useEffect } from 'react';
import { CharacterAchievement } from '../types/character';
import './CharacterNotification.css';

interface CharacterNotificationProps {
  isVisible: boolean;
  type: 'levelup' | 'achievement';
  characterName: string;
  level?: number;
  achievement?: CharacterAchievement;
  onClose: () => void;
}

const CharacterNotification: React.FC<CharacterNotificationProps> = ({
  isVisible,
  type,
  characterName,
  level,
  achievement,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 2000); // 2秒後に自動で閉じる
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`character-notification ${isAnimating ? 'show' : ''}`}>
      <div className="notification-content">
        {type === 'levelup' && (
          <div className="levelup-notification">
            <div className="celebration-icon">🎉</div>
            <div className="notification-text">
              <h3>レベルアップ！</h3>
              <p>{characterName}がレベル{level}に到達しました！</p>
            </div>
          </div>
        )}
        
        {type === 'achievement' && achievement && (
          <div className="achievement-notification">
            <div className="achievement-icon">🏆</div>
            <div className="notification-text">
              <h3>アチーブメント獲得！</h3>
              <p>{achievement.name}</p>
              <p className="achievement-description">{achievement.description}</p>
            </div>
          </div>
        )}
        
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default CharacterNotification;
