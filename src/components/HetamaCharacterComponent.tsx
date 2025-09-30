import React from 'react';
import './HetamaCharacterComponent.css';
import type { Character } from '../types/character';

interface HetamaCharacterComponentProps {
  currentCharacter?: Character | null;
  userActivity?: {
    totalExperience: number;
    badgeCount: number;
    workHours: number;
    level: number;
  };
  showActivityReaction?: boolean;
}

const HetamaCharacterComponent: React.FC<HetamaCharacterComponentProps> = ({ 
  currentCharacter, 
  userActivity, 
  showActivityReaction = false 
}) => {
  // ユーザー活動に基づく装飾レベルを計算
  const getDecorationLevel = () => {
    if (!userActivity) return 0;
    
    let level = 0;
    if (userActivity.totalExperience > 1000) level += 1;
    if (userActivity.badgeCount > 5) level += 1;
    if (userActivity.workHours > 50) level += 1;
    if (userActivity.level > 10) level += 1;
    
    return Math.min(level, 4); // 最大4レベル
  };

  const decorationLevel = getDecorationLevel();

  return (
    <div className="bottom-right-character">
      {/* 既存のヘタウマキャラクター - 絶対に変更しない */}
      <div className="hetama-character">
        <div className="hetama-halo"></div>
        <div className="hetama-wings">
          <div className="hetama-wing left-hetama-wing"></div>
          <div className="hetama-wing right-hetama-wing"></div>
        </div>
        <div className="hetama-face">
          <div className="hetama-eyes">
            <div className="hetama-eye left-hetama-eye"></div>
            <div className="hetama-eye right-hetama-eye"></div>
          </div>
          <div className="hetama-mouth"></div>
        </div>
        <div className="hetama-body"></div>
        <div className="hetama-arms">
          <div className="hetama-arm left-hetama-arm"></div>
          <div className="hetama-arm right-hetama-arm"></div>
        </div>
        <div className="hetama-legs">
          <div className="hetama-leg left-hetama-leg"></div>
          <div className="hetama-leg right-hetama-leg"></div>
        </div>
        <div className="hetama-sparkles">
          <div className="hetama-sparkle sparkle-1">✨</div>
          <div className="hetama-sparkle sparkle-2">⭐</div>
          <div className="hetama-sparkle sparkle-3">💫</div>
        </div>
      </div>

      {/* 新しい機能 - 既存デザインの上にオーバーレイ */}
      {showActivityReaction && userActivity && (
        <>
          {/* 活動レベルに応じた装飾 */}
          {decorationLevel >= 1 && (
            <div className="hetama-decoration-level-1">
              <div className="decoration-star">🌟</div>
            </div>
          )}
          
          {decorationLevel >= 2 && (
            <div className="hetama-decoration-level-2">
              <div className="decoration-crown">👑</div>
            </div>
          )}
          
          {decorationLevel >= 3 && (
            <div className="hetama-decoration-level-3">
              <div className="decoration-wings">🕊️</div>
            </div>
          )}
          
          {decorationLevel >= 4 && (
            <div className="hetama-decoration-level-4">
              <div className="decoration-rainbow">🌈</div>
            </div>
          )}

          {/* 経験値に応じた特別エフェクト */}
          {userActivity.totalExperience > 5000 && (
            <div className="hetama-special-effects">
              <div className="special-sparkle special-1">💎</div>
              <div className="special-sparkle special-2">💎</div>
              <div className="special-sparkle special-3">💎</div>
            </div>
          )}

          {/* バッジ数に応じたハートエフェクト */}
          {userActivity.badgeCount > 10 && (
            <div className="hetama-heart-effects">
              <div className="heart-effect heart-1">💖</div>
              <div className="heart-effect heart-2">💖</div>
              <div className="heart-effect heart-3">💖</div>
            </div>
          )}

          {/* 作業時間に応じた努力エフェクト */}
          {userActivity.workHours > 100 && (
            <div className="hetama-effort-effects">
              <div className="effort-sweat">💦</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HetamaCharacterComponent;
