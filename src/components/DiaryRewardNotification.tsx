// 日記投稿報酬通知コンポーネント

import React from 'react';
import { DiaryRewardResult } from '../utils/diaryRewardManager';

interface DiaryRewardNotificationProps {
  rewardResult: DiaryRewardResult;
  onClose: () => void;
  isVisible: boolean;
}

const DiaryRewardNotification: React.FC<DiaryRewardNotificationProps> = ({
  rewardResult,
  onClose,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="diary-reward-notification">
      <div className="reward-content">
        <h3>🎉 日記投稿完了！</h3>
        
        {rewardResult.badges.length > 0 && (
          <div className="reward-section">
            <h4>🏆 獲得したバッジ</h4>
            <div className="badges-list">
              {rewardResult.badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  <span className="badge-icon">{badge.icon}</span>
                  <span className="badge-name">{badge.name}</span>
                  <span className="badge-xp">+{badge.xpReward}XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {rewardResult.experience > 0 && (
          <div className="reward-section">
            <h4>⭐ 経験値</h4>
            <p className="reward-amount">+{rewardResult.experience} 経験値を獲得しました！</p>
          </div>
        )}

        {rewardResult.workCoins > 0 && (
          <div className="reward-section">
            <h4>🪙 ワークコイン</h4>
            <p className="reward-amount">+{rewardResult.workCoins} ワークコインを獲得しました！</p>
          </div>
        )}

        {rewardResult.leveledUp && (
          <div className="reward-section level-up">
            <h4>🎊 レベルアップ！</h4>
            <p className="reward-amount">キャラクターがレベル{rewardResult.newLevel}に上がりました！</p>
          </div>
        )}

        {rewardResult.achievements.length > 0 && (
          <div className="reward-section">
            <h4>🏅 新たなアチーブメント</h4>
            <div className="achievements-list">
              {rewardResult.achievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <span className="achievement-icon">🏆</span>
                  <span className="achievement-text">{achievement.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="close-button" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
};

export default DiaryRewardNotification;
