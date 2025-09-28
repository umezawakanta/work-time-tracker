import React from 'react';
import { Character, UserCharacterSettings, CharacterAchievement } from '../types/character';
import { characterManager } from '../utils/characterManager';
import './CharacterProgress.css';

interface CharacterProgressProps {
  character: Character | null;
  settings: UserCharacterSettings;
  onAchievementClick?: (achievement: CharacterAchievement) => void;
}

const CharacterProgress: React.FC<CharacterProgressProps> = ({
  character,
  settings,
  onAchievementClick
}) => {
  if (!character) {
    return (
      <div className="character-progress">
        <div className="no-character">
          <p>キャラクターを選択してください</p>
        </div>
      </div>
    );
  }

  const achievements = characterManager.getAchievements();
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalExperience = settings.totalExperience;
  const playTime = settings.playTime;

  const getRequiredExperience = (level: number): number => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  };

  const requiredExp = getRequiredExperience(character.level);
  const progressPercentage = (character.experience / requiredExp) * 100;

  const formatPlayTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  return (
    <div className="character-progress">
      <div className="progress-header">
        <h3>{character.name}の進捗</h3>
        <div className="character-level">Lv.{character.level}</div>
      </div>

      <div className="progress-section">
        <h4>経験値</h4>
        <div className="exp-bar-container">
          <div className="exp-bar">
            <div 
              className="exp-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="exp-text">
            {character.experience} / {requiredExp} EXP
          </div>
        </div>
        <div className="exp-details">
          <span>総経験値: {totalExperience}</span>
          <span>次のレベルまで: {requiredExp - character.experience}</span>
        </div>
      </div>

      <div className="progress-section">
        <h4>統計</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">プレイ時間</span>
            <span className="stat-value">{formatPlayTime(playTime)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">アチーブメント</span>
            <span className="stat-value">{unlockedAchievements.length} / {achievements.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">レアリティ</span>
            <span className="stat-value">{character.rarity}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">タイプ</span>
            <span className="stat-value">{character.type}</span>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h4>アチーブメント</h4>
        <div className="achievements-list">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => achievement.unlocked && onAchievementClick?.(achievement)}
            >
              <div className="achievement-icon">
                {achievement.unlocked ? '🏆' : '🔒'}
              </div>
              <div className="achievement-info">
                <h5>{achievement.name}</h5>
                <p>{achievement.description}</p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <span className="unlocked-date">
                    獲得日: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="progress-section">
        <h4>レベル報酬</h4>
        <div className="level-rewards">
          <div className={`reward-item ${character.level >= 5 ? 'unlocked' : 'locked'}`}>
            <span className="reward-icon">👑</span>
            <span className="reward-text">王冠 (Lv.5)</span>
          </div>
          <div className={`reward-item ${character.level >= 10 ? 'unlocked' : 'locked'}`}>
            <span className="reward-icon">🪽</span>
            <span className="reward-text">翼 (Lv.10)</span>
          </div>
          <div className={`reward-item ${character.level >= 15 ? 'unlocked' : 'locked'}`}>
            <span className="reward-icon">😇</span>
            <span className="reward-text">ハロー (Lv.15)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterProgress;
