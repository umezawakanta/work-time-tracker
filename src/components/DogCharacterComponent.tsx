import React from "react";
import "./DogCharacterComponent.css";
import type { Character } from "../types/character";

interface DogCharacterComponentProps {
  currentCharacter?: Character | null;
  workActivity?: {
    totalWorkHours: number;
    consecutiveDays: number;
    projectCount: number;
    memoCount: number;
  };
  showWorkReaction?: boolean;
}

const DogCharacterComponent: React.FC<DogCharacterComponentProps> = ({ 
  currentCharacter, 
  workActivity, 
  showWorkReaction = false 
}) => {
  // 作業活動に基づく反応レベルを計算
  const getWorkReactionLevel = () => {
    if (!workActivity) return 0;
    
    let level = 0;
    if (workActivity.totalWorkHours > 10) level += 1;
    if (workActivity.consecutiveDays > 3) level += 1;
    if (workActivity.projectCount > 2) level += 1;
    if (workActivity.memoCount > 10) level += 1;
    
    return Math.min(level, 4); // 最大4レベル
  };

  const workReactionLevel = getWorkReactionLevel();

  return (
    <div className="dog-character-component">
      {/* 既存の犬キャラクター - 絶対に変更しない */}
      <div className="dog-character">
        {/* 犬の耳 */}
        <div className="dog-ear dog-ear-left"></div>
        <div className="dog-ear dog-ear-right"></div>
        
        {/* 犬の顔 */}
        <div className="dog-face">
          {/* 犬の目 */}
          <div className="dog-eye dog-eye-left"></div>
          <div className="dog-eye dog-eye-right"></div>
          
          {/* 犬の鼻 */}
          <div className="dog-nose"></div>
          
          {/* 犬の口 */}
          <div className="dog-mouth"></div>
          
          {/* 犬の舌 */}
          <div className="dog-tongue"></div>
        </div>
        
        {/* 犬の体 */}
        <div className="dog-body">
          {/* 犬の前足 */}
          <div className="dog-paw dog-paw-left"></div>
          <div className="dog-paw dog-paw-right"></div>
          
          {/* 犬のしっぽ */}
          <div className="dog-tail"></div>
        </div>
        
        {/* 犬の天使の輪っか */}
        <div className="dog-halo"></div>
        
        {/* 犬のハートエフェクト */}
        <div className="dog-heart dog-heart-1">💕</div>
        <div className="dog-heart dog-heart-2">💖</div>
        <div className="dog-heart dog-heart-3">💝</div>
      </div>

      {/* 新しい機能 - 既存デザインの上にオーバーレイ */}
      {showWorkReaction && workActivity && (
        <>
          {/* 作業レベルに応じた装飾 */}
          {workReactionLevel >= 1 && (
            <div className="dog-decoration-level-1">
              <div className="dog-work-badge">💼</div>
            </div>
          )}
          
          {workReactionLevel >= 2 && (
            <div className="dog-decoration-level-2">
              <div className="dog-achievement-star">⭐</div>
            </div>
          )}
          
          {workReactionLevel >= 3 && (
            <div className="dog-decoration-level-3">
              <div className="dog-success-crown">🏆</div>
            </div>
          )}
          
          {workReactionLevel >= 4 && (
            <div className="dog-decoration-level-4">
              <div className="dog-master-badge">👑</div>
            </div>
          )}

          {/* 連続作業日数に応じた特別エフェクト */}
          {workActivity.consecutiveDays > 7 && (
            <div className="dog-streak-effects">
              <div className="streak-fire">🔥</div>
            </div>
          )}

          {/* プロジェクト完了時の特別エフェクト */}
          {workActivity.projectCount > 5 && (
            <div className="dog-project-effects">
              <div className="project-sparkle sparkle-1">✨</div>
              <div className="project-sparkle sparkle-2">✨</div>
              <div className="project-sparkle sparkle-3">✨</div>
            </div>
          )}

          {/* メモ投稿数に応じた思考エフェクト */}
          {workActivity.memoCount > 20 && (
            <div className="dog-thinking-effects">
              <div className="thinking-bubble">💭</div>
            </div>
          )}

          {/* 作業時間に応じた疲労エフェクト */}
          {workActivity.totalWorkHours > 50 && (
            <div className="dog-tired-effects">
              <div className="tired-zzz">😴</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DogCharacterComponent;
