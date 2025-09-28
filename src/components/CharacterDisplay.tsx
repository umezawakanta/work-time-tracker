import React, { useState, useEffect, useRef } from 'react';
import { Character, UserCharacterSettings } from '../types/character';
import { MESSAGE_TEMPLATES, ANIMATION_CONFIG } from '../constants/characters';
import './CharacterDisplay.css';

interface CharacterDisplayProps {
  character: Character | null;
  settings: UserCharacterSettings;
  workState: 'idle' | 'working' | 'break' | 'completed';
  onInteraction?: (interaction: string) => void;
  onLevelUp?: (newLevel: number) => void;
  onAchievement?: (achievementId: string) => void;
  onProgressClick?: () => void;
  onCustomizeClick?: () => void;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  character,
  settings,
  workState,
  onInteraction,
  onLevelUp,
  onAchievement,
  onProgressClick,
  onCustomizeClick
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [lastInteraction, setLastInteraction] = useState<Date | null>(null);
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const interactionCooldownRef = useRef<NodeJS.Timeout | null>(null);

  // 作業状態に応じてアニメーションを変更
  useEffect(() => {
    if (!character) return;

    let newAnimation = 'idle';
    let message = '';

    switch (workState) {
      case 'working':
        newAnimation = 'working';
        message = character.personality.messages.encouragement[
          Math.floor(Math.random() * character.personality.messages.encouragement.length)
        ];
        break;
      case 'break':
        newAnimation = 'sleeping';
        message = character.personality.messages.reminder[
          Math.floor(Math.random() * character.personality.messages.reminder.length)
        ];
        break;
      case 'completed':
        newAnimation = 'celebrating';
        message = character.personality.messages.celebration[
          Math.floor(Math.random() * character.personality.messages.celebration.length)
        ];
        break;
      default:
        newAnimation = 'idle';
        break;
    }

    setCurrentAnimation(newAnimation);
    
    if (message && settings.preferences.showAnimations) {
      showTemporaryMessage(message);
    }
  }, [workState, character, settings.preferences.showAnimations]);

  // 定期的なアイドルアニメーション
  useEffect(() => {
    if (!character || workState !== 'idle' || !settings.preferences.showAnimations) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30%の確率でランダムアニメーション
        const randomAnimations = ['thinking', 'excited'];
        const randomAnimation = randomAnimations[Math.floor(Math.random() * randomAnimations.length)];
        setCurrentAnimation(randomAnimation);
        
        setTimeout(() => {
          setCurrentAnimation('idle');
        }, ANIMATION_CONFIG.durations[randomAnimation as keyof typeof ANIMATION_CONFIG.durations] * 1000);
      }
    }, 10000); // 10秒ごと

    return () => clearInterval(interval);
  }, [character, workState, settings.preferences.showAnimations]);

  const showTemporaryMessage = (message: string) => {
    setCurrentMessage(message);
    setShowMessage(true);
    
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
      setCurrentMessage('');
    }, 3000);
  };

  const handleCharacterClick = () => {
    if (!character || !settings.preferences.showAnimations) return;

    // クールダウン中は無視
    if (lastInteraction && Date.now() - lastInteraction.getTime() < 2000) return;

    setLastInteraction(new Date());
    
    // ランダムなインタラクション
    const interactions = ['thinking', 'excited'];
    const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
    
    setCurrentAnimation(randomInteraction);
    setIsAnimating(true);
    
    // ランダムなメッセージを表示
    const messages = [
      ...character.personality.messages.greeting,
      ...character.personality.messages.encouragement
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showTemporaryMessage(randomMessage);

    // アニメーション終了
    setTimeout(() => {
      setCurrentAnimation('idle');
      setIsAnimating(false);
    }, ANIMATION_CONFIG.durations[randomInteraction as keyof typeof ANIMATION_CONFIG.durations] * 1000);

    onInteraction?.(randomInteraction);
  };

  const getAccessoryEmoji = (accessory: string): string => {
    const accessoryMap: { [key: string]: string } = {
      'crown': '👑',
      'wings': '🪽',
      'halo': '😇',
      'glasses': '🤓',
      'hat': '🎩',
      'bow': '🎀'
    };
    return accessoryMap[accessory] || '✨';
  };

  const getAnimationClass = () => {
    const baseClass = 'character-display';
    const animationClass = `character-${currentAnimation}`;
    const sizeClass = `character-${character?.customization.size || 'medium'}`;
    const speedClass = `animation-${settings.preferences.animationSpeed}`;
    
    return `${baseClass} ${animationClass} ${sizeClass} ${speedClass}`.trim();
  };

  const getCharacterStyle = () => {
    if (!character) return {};
    
    return {
      backgroundColor: character.customization.color,
      borderColor: character.customization.color,
      animationDuration: `${ANIMATION_CONFIG.durations[currentAnimation as keyof typeof ANIMATION_CONFIG.durations] * 
        ANIMATION_CONFIG.speeds[settings.preferences.animationSpeed]}s`
    };
  };

  if (!character) {
    return (
      <div className="character-display character-empty">
        <div className="character-placeholder">
          <span className="placeholder-icon">🎭</span>
          <p>キャラクターを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="character-display-container">
      <div
        className={getAnimationClass()}
        style={getCharacterStyle()}
        onClick={handleCharacterClick}
        role="button"
        tabIndex={0}
        aria-label={`${character.name}とインタラクション`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCharacterClick();
          }
        }}
        style={{
          '--character-color': character.customization?.color || '#FF6B6B',
          '--character-size': character.customization?.size || 'medium'
        } as React.CSSProperties}
      >
        <div 
          className="character-avatar"
          data-size={character.customization?.size || 'medium'}
        >
          <span className="character-emoji">
            {character.type === 'cute' && '🐱'}
            {character.type === 'cool' && '🦁'}
            {character.type === 'mysterious' && '🦄'}
            {character.type === 'energetic' && '🐶'}
          </span>
        </div>
        
        {character.customization.accessories.length > 0 && (
          <div className="character-accessories">
            {character.customization.accessories.map((accessory, index) => (
              <span key={index} className={`accessory accessory-${accessory}`}>
                {getAccessoryEmoji(accessory)}
              </span>
            ))}
          </div>
        )}
      </div>

      {showMessage && (
        <div className="character-message">
          <div className="message-bubble">
            <p>{currentMessage}</p>
          </div>
        </div>
      )}

      <div className="character-info">
        <h4 className="character-name">{character.name}</h4>
        <div className="character-level">Lv.{character.level}</div>
        <div className="character-experience">
          <div className="exp-bar">
            <div 
              className="exp-fill"
              style={{ 
                width: `${(character.experience % 100) / 100 * 100}%` 
              }}
            />
          </div>
          <span className="exp-text">{character.experience} EXP</span>
        </div>
        <div className="character-actions">
          {onProgressClick && (
            <button 
              className="progress-button"
              onClick={onProgressClick}
              title="進捗を表示"
            >
              📊 進捗
            </button>
          )}
          {onCustomizeClick && (
            <button 
              className="customize-button"
              onClick={onCustomizeClick}
              title="カスタマイズ"
            >
              🎨 カスタマイズ
            </button>
          )}
        </div>
      </div>

      {settings.preferences.soundEffects && (
        <audio
          className="character-sound"
          preload="none"
          onEnded={() => {
            // 音效終了時の処理
          }}
        />
      )}
    </div>
  );
};

export default CharacterDisplay;
