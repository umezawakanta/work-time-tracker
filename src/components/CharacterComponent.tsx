import React from 'react';
import './CharacterComponent.css';
import type { Character } from '../types/character';

interface CharacterComponentProps {
  isTimeTrackingActive: boolean;
  currentCharacter?: Character | null;
  showCharacterInfo?: boolean;
}

const CharacterComponent: React.FC<CharacterComponentProps> = ({ 
  isTimeTrackingActive, 
  currentCharacter, 
  showCharacterInfo = false 
}) => {
  return (
    <div className="character-container">
      {/* 既存のキャラクターデザイン - 絶対に変更しない */}
      <div className={`character ${isTimeTrackingActive ? 'running' : ''}`}>
        <div className="character-halo"></div>
        <div className="character-wings">
          <div className="wing left-wing"></div>
          <div className="wing right-wing"></div>
        </div>
        <div className="character-face">
          <div className="character-eyes">
            <div className="eye left-eye"></div>
            <div className="eye right-eye"></div>
          </div>
          <div className="character-mouth"></div>
        </div>
        <div className="character-body"></div>
        <div className="character-arms">
          <div className="arm left-arm"></div>
          <div className="arm right-arm"></div>
        </div>
        <div className="sparkles">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
          <div className="sparkle sparkle-4"></div>
          <div className="sparkle sparkle-5"></div>
          <div className="sparkle sparkle-6"></div>
        </div>
        {/* 走っている時のエフェクト */}
        {isTimeTrackingActive && (
          <div className="running-effects">
            <div className="running-dust dust-1"></div>
            <div className="running-dust dust-2"></div>
            <div className="running-dust dust-3"></div>
            <div className="running-dust dust-4"></div>
            <div className="running-dust dust-5"></div>
          </div>
        )}
      </div>

      {/* 新しい機能 - 既存デザインの上にオーバーレイ */}
      {showCharacterInfo && currentCharacter && (
        <>
          {/* レベル表示 */}
          <div className="character-level-badge">
            <span className="level-text">Lv.{currentCharacter.level}</span>
          </div>

          {/* 経験値バー */}
          <div className="character-exp-bar">
            <div 
              className="exp-fill"
              style={{ 
                width: `${Math.min((currentCharacter.experience / (currentCharacter.level * 100)) * 100, 100)}%` 
              }}
            />
          </div>

          {/* バッジ表示 */}
          {currentCharacter.badges && currentCharacter.badges.length > 0 && (
            <div className="character-badges">
              {currentCharacter.badges.slice(0, 3).map((badgeId, index) => (
                <div 
                  key={badgeId} 
                  className="character-badge"
                  style={{ 
                    animationDelay: `${index * 0.2}s` 
                  }}
                >
                  🏆
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CharacterComponent;
