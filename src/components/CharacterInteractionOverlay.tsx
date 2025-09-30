// キャラクター間の相互作用を表示するオーバーレイコンポーネント

import React, { useState, useEffect } from 'react';
import { CharacterInteractionResult } from '../utils/characterInteractionManager';
import './CharacterInteractionOverlay.css';

interface CharacterInteractionOverlayProps {
  interactionResult: CharacterInteractionResult | null;
  onComplete: () => void;
}

const CharacterInteractionOverlay: React.FC<CharacterInteractionOverlayProps> = ({
  interactionResult,
  onComplete
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (interactionResult && interactionResult.messages.length > 0) {
      setIsVisible(true);
      setCurrentMessageIndex(0);
      
      // メッセージを順次表示
      const timer = setTimeout(() => {
        if (currentMessageIndex < interactionResult.messages.length - 1) {
          setCurrentMessageIndex(prev => prev + 1);
        } else {
          // 全てのメッセージを表示後、オーバーレイを閉じる
          setTimeout(() => {
            setIsVisible(false);
            onComplete();
          }, 2000);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [interactionResult, currentMessageIndex, onComplete]);

  if (!isVisible || !interactionResult) {
    return null;
  }

  const currentMessage = interactionResult.messages[currentMessageIndex];
  const currentAnimation = interactionResult.animations[currentMessageIndex];

  return (
    <div className="character-interaction-overlay">
      <div className="interaction-backdrop" />
      
      <div className="interaction-content">
        <div className="interaction-message">
          <div className="message-bubble">
            <div className="message-text">{currentMessage}</div>
            <div className="message-indicator">
              {currentMessageIndex + 1} / {interactionResult.messages.length}
            </div>
          </div>
        </div>
        
        <div className="interaction-animations">
          {currentAnimation && (
            <div className={`animation-effect ${currentAnimation}`}>
              <div className="sparkle sparkle-1"></div>
              <div className="sparkle sparkle-2"></div>
              <div className="sparkle sparkle-3"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterInteractionOverlay;
