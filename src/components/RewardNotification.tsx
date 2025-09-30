import React, { useState, useEffect } from 'react';
import './RewardNotification.css';

interface RewardNotificationProps {
  reward: {
    badges: Array<{
      id: string;
      name: string;
      icon: string;
      xpReward: number;
    }>;
    experience: number;
    workCoins: number;
    leveledUp: boolean;
    newLevel: number;
    achievements: any[];
  };
  onClose: () => void;
}

const RewardNotification: React.FC<RewardNotificationProps> = ({ reward, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // アニメーション用の遅延
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // アニメーション完了後に閉じる
  };

  const totalRewards = reward.badges.length + (reward.experience > 0 ? 1 : 0) + (reward.workCoins > 0 ? 1 : 0) + (reward.leveledUp ? 1 : 0);

  return (
    <div className={`reward-notification-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`reward-notification ${isVisible ? 'visible' : ''}`}>
        <div className="reward-header">
          <h3>🎉 並べ替え完了！</h3>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="reward-content">
          <div className="reward-summary">
            <p>機能の並べ替えが完了しました！</p>
            <p className="reward-count">{totalRewards}個の報酬を獲得しました</p>
          </div>

          <div className="reward-items">
            {reward.badges.map((badge, index) => (
              <div key={badge.id} className="reward-item badge-item">
                <div className="reward-icon">🏆</div>
                <div className="reward-text">
                  <div className="reward-name">バッジ獲得: {badge.name}</div>
                  <div className="reward-description">{badge.icon} +{badge.xpReward}XP</div>
                </div>
              </div>
            ))}

            {reward.experience > 0 && (
              <div className="reward-item experience-item">
                <div className="reward-icon">⭐</div>
                <div className="reward-text">
                  <div className="reward-name">経験値獲得</div>
                  <div className="reward-description">+{reward.experience}XP</div>
                </div>
              </div>
            )}

            {reward.workCoins > 0 && (
              <div className="reward-item workcoins-item">
                <div className="reward-icon">🪙</div>
                <div className="reward-text">
                  <div className="reward-name">ワークコイン獲得</div>
                  <div className="reward-description">+{reward.workCoins}WC</div>
                </div>
              </div>
            )}

            {reward.leveledUp && (
              <div className="reward-item levelup-item">
                <div className="reward-icon">🎊</div>
                <div className="reward-text">
                  <div className="reward-name">レベルアップ！</div>
                  <div className="reward-description">レベル {reward.newLevel} に上がりました！</div>
                </div>
              </div>
            )}
          </div>

          <div className="reward-actions">
            <button 
              className="details-button"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '詳細を閉じる' : '詳細を見る'}
            </button>
            <button className="continue-button" onClick={handleClose}>
              続ける
            </button>
          </div>

          {showDetails && (
            <div className="reward-details">
              <h4>獲得した報酬の詳細</h4>
              <ul>
                {reward.badges.map(badge => (
                  <li key={badge.id}>
                    <strong>{badge.name}</strong> - {badge.xpReward}XP
                  </li>
                ))}
                {reward.experience > 0 && (
                  <li><strong>経験値</strong> - {reward.experience}XP</li>
                )}
                {reward.workCoins > 0 && (
                  <li><strong>ワークコイン</strong> - {reward.workCoins}WC</li>
                )}
                {reward.leveledUp && (
                  <li><strong>レベルアップ</strong> - レベル {reward.newLevel}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardNotification;
