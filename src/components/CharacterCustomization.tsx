import React, { useState, useEffect } from 'react';
import { Character, UserCharacterSettings, CharacterCustomization } from '../types/character';
import { characterManager } from '../utils/characterManager';
import './CharacterCustomization.css';

interface CharacterCustomizationProps {
  character: Character | null;
  settings: UserCharacterSettings;
  onCustomizationChange: (customization: CharacterCustomization) => void;
  onClose: () => void;
}

const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({
  character,
  settings,
  onCustomizationChange,
  onClose
}) => {
  const [customization, setCustomization] = useState<CharacterCustomization>(
    character?.customization || {
      color: '#FF6B6B',
      size: 'medium',
      accessories: [],
      expressions: ['happy'],
      animations: ['idle']
    }
  );

  const [activeTab, setActiveTab] = useState<'color' | 'accessories' | 'expressions' | 'animations'>('color');

  // カスタマイズオプション
  const colorOptions = [
    { name: 'レッド', value: '#FF6B6B', preview: '🔴' },
    { name: 'ブルー', value: '#4ECDC4', preview: '🔵' },
    { name: 'グリーン', value: '#45B7D1', preview: '🟢' },
    { name: 'パープル', value: '#96CEB4', preview: '🟣' },
    { name: 'オレンジ', value: '#FFEAA7', preview: '🟠' },
    { name: 'ピンク', value: '#DDA0DD', preview: '🩷' },
    { name: 'イエロー', value: '#FDCB6E', preview: '🟡' },
    { name: 'グレー', value: '#A0A0A0', preview: '⚪' }
  ];

  const sizeOptions = [
    { name: '小', value: 'small', preview: '🔸' },
    { name: '中', value: 'medium', preview: '🔹' },
    { name: '大', value: 'large', preview: '🔶' }
  ];

  const accessoryOptions = [
    { id: 'crown', name: '王冠', emoji: '👑', unlocked: character?.level >= 5 },
    { id: 'wings', name: '翼', emoji: '🪽', unlocked: character?.level >= 10 },
    { id: 'halo', name: 'ハロー', emoji: '😇', unlocked: character?.level >= 15 },
    { id: 'glasses', name: 'メガネ', emoji: '🤓', unlocked: true },
    { id: 'hat', name: '帽子', emoji: '🎩', unlocked: true },
    { id: 'bow', name: 'リボン', emoji: '🎀', unlocked: true }
  ];

  const expressionOptions = [
    { id: 'happy', name: '嬉しい', emoji: '😊' },
    { id: 'excited', name: '興奮', emoji: '🤩' },
    { id: 'thinking', name: '考え中', emoji: '🤔' },
    { id: 'sleepy', name: '眠い', emoji: '😴' },
    { id: 'confident', name: '自信', emoji: '😎' },
    { id: 'shy', name: '恥ずかしい', emoji: '😳' }
  ];

  const animationOptions = [
    { id: 'idle', name: '待機', emoji: '😌' },
    { id: 'working', name: '作業中', emoji: '💪' },
    { id: 'celebrating', name: 'お祝い', emoji: '🎉' },
    { id: 'sleeping', name: '睡眠', emoji: '😴' },
    { id: 'thinking', name: '思考', emoji: '🤔' },
    { id: 'excited', name: '興奮', emoji: '🤩' }
  ];

  // カスタマイズを適用
  const applyCustomization = (newCustomization: Partial<CharacterCustomization>) => {
    const updatedCustomization = { ...customization, ...newCustomization };
    setCustomization(updatedCustomization);
    onCustomizationChange(updatedCustomization);
  };

  // 色を変更
  const handleColorChange = (color: string) => {
    applyCustomization({ color });
  };

  // サイズを変更
  const handleSizeChange = (size: 'small' | 'medium' | 'large') => {
    applyCustomization({ size });
  };

  // アクセサリーを切り替え
  const handleAccessoryToggle = (accessoryId: string) => {
    const newAccessories = customization.accessories.includes(accessoryId)
      ? customization.accessories.filter(id => id !== accessoryId)
      : [...customization.accessories, accessoryId];
    applyCustomization({ accessories: newAccessories });
  };

  // 表情を切り替え
  const handleExpressionToggle = (expressionId: string) => {
    const newExpressions = customization.expressions.includes(expressionId)
      ? customization.expressions.filter(id => id !== expressionId)
      : [...customization.expressions, expressionId];
    applyCustomization({ expressions: newExpressions });
  };

  // アニメーションを切り替え
  const handleAnimationToggle = (animationId: string) => {
    const newAnimations = customization.animations.includes(animationId)
      ? customization.animations.filter(id => id !== animationId)
      : [...customization.animations, animationId];
    applyCustomization({ animations: newAnimations });
  };

  // リセット
  const handleReset = () => {
    const defaultCustomization: CharacterCustomization = {
      color: '#FF6B6B',
      size: 'medium',
      accessories: [],
      expressions: ['happy'],
      animations: ['idle']
    };
    setCustomization(defaultCustomization);
    onCustomizationChange(defaultCustomization);
  };

  if (!character) {
    return (
      <div className="character-customization">
        <div className="no-character">
          <p>キャラクターを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="character-customization">
      <div className="customization-header">
        <h3>{character.name}のカスタマイズ</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="customization-tabs">
        <button
          className={`tab-button ${activeTab === 'color' ? 'active' : ''}`}
          onClick={() => setActiveTab('color')}
        >
          🎨 色
        </button>
        <button
          className={`tab-button ${activeTab === 'accessories' ? 'active' : ''}`}
          onClick={() => setActiveTab('accessories')}
        >
          👑 アクセサリー
        </button>
        <button
          className={`tab-button ${activeTab === 'expressions' ? 'active' : ''}`}
          onClick={() => setActiveTab('expressions')}
        >
          😊 表情
        </button>
        <button
          className={`tab-button ${activeTab === 'animations' ? 'active' : ''}`}
          onClick={() => setActiveTab('animations')}
        >
          🎭 アニメーション
        </button>
      </div>

      <div className="customization-content">
        {activeTab === 'color' && (
          <div className="color-section">
            <h4>色を選択</h4>
            <div className="color-grid">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className={`color-option ${customization.color === color.value ? 'selected' : ''}`}
                  onClick={() => handleColorChange(color.value)}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  <span className="color-preview">{color.preview}</span>
                </button>
              ))}
            </div>
            
            <h4>サイズを選択</h4>
            <div className="size-options">
              {sizeOptions.map((size) => (
                <button
                  key={size.value}
                  className={`size-option ${customization.size === size.value ? 'selected' : ''}`}
                  onClick={() => handleSizeChange(size.value as 'small' | 'medium' | 'large')}
                >
                  <span className="size-preview">{size.preview}</span>
                  <span className="size-name">{size.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="accessories-section">
            <h4>アクセサリーを選択</h4>
            <div className="accessories-grid">
              {accessoryOptions.map((accessory) => (
                <button
                  key={accessory.id}
                  className={`accessory-option ${customization.accessories.includes(accessory.id) ? 'selected' : ''} ${!accessory.unlocked ? 'locked' : ''}`}
                  onClick={() => accessory.unlocked && handleAccessoryToggle(accessory.id)}
                  disabled={!accessory.unlocked}
                  title={accessory.unlocked ? accessory.name : `${accessory.name} (未解放)`}
                >
                  <span className="accessory-emoji">{accessory.emoji}</span>
                  <span className="accessory-name">{accessory.name}</span>
                  {!accessory.unlocked && <span className="lock-icon">🔒</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'expressions' && (
          <div className="expressions-section">
            <h4>表情を選択</h4>
            <div className="expressions-grid">
              {expressionOptions.map((expression) => (
                <button
                  key={expression.id}
                  className={`expression-option ${customization.expressions.includes(expression.id) ? 'selected' : ''}`}
                  onClick={() => handleExpressionToggle(expression.id)}
                >
                  <span className="expression-emoji">{expression.emoji}</span>
                  <span className="expression-name">{expression.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'animations' && (
          <div className="animations-section">
            <h4>アニメーションを選択</h4>
            <div className="animations-grid">
              {animationOptions.map((animation) => (
                <button
                  key={animation.id}
                  className={`animation-option ${customization.animations.includes(animation.id) ? 'selected' : ''}`}
                  onClick={() => handleAnimationToggle(animation.id)}
                >
                  <span className="animation-emoji">{animation.emoji}</span>
                  <span className="animation-name">{animation.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="customization-footer">
        <button className="reset-button" onClick={handleReset}>
          🔄 リセット
        </button>
        <button className="save-button" onClick={onClose}>
          💾 保存
        </button>
      </div>
    </div>
  );
};

export default CharacterCustomization;
