import React, { useState, useEffect } from 'react';
import { Character, UserCharacterSettings, CHARACTER_TYPES, CHARACTER_RARITY } from '../types/character';
import { SAMPLE_CHARACTERS } from '../constants/characters';
import './CharacterSelector.css';

interface CharacterSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterSelect: (character: Character) => void;
  currentSettings: UserCharacterSettings;
  availableCharacters: Character[];
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  isOpen,
  onClose,
  onCharacterSelect,
  currentSettings,
  availableCharacters
}) => {
  // currentSettingsがundefinedの場合のデフォルト値
  const safeCurrentSettings = currentSettings || {
    selectedCharacterId: '',
    customizations: {},
    preferences: {
      animationSpeed: 'normal' as const,
      showAnimations: true,
      soundEffects: true,
      autoInteract: false
    },
    achievements: [],
    unlockedCharacters: [],
    totalExperience: 0,
    playTime: 0
  };
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'rarity' | 'level'>('name');

  useEffect(() => {
    if (isOpen) {
      const current = availableCharacters.find(c => c.id === safeCurrentSettings.selectedCharacterId);
      setSelectedCharacter(current || null);
    }
  }, [isOpen, safeCurrentSettings.selectedCharacterId, availableCharacters]);

  const filteredCharacters = availableCharacters
    .filter(character => {
      const matchesType = filterType === 'all' || character.type === filterType;
      const matchesRarity = filterRarity === 'all' || character.rarity === filterRarity;
      const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           character.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesRarity && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'rarity':
          const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
          return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        case 'level':
          return b.level - a.level;
        default:
          return 0;
      }
    });

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter);
      onClose();
    }
  };

  const getRarityColor = (rarity: string) => {
    return CHARACTER_RARITY[rarity as keyof typeof CHARACTER_RARITY]?.color || '#808080';
  };

  const getTypeColor = (type: string) => {
    return CHARACTER_TYPES[type as keyof typeof CHARACTER_TYPES]?.color || '#808080';
  };

  if (!isOpen) return null;

  return (
    <div className="character-selector-overlay">
      <div className="character-selector-modal">
        <div className="character-selector-header">
          <h3>🎭 キャラクター選択</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="character-selector-filters">
          <div className="filter-group">
            <label htmlFor="type-filter">タイプ:</label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">すべて</option>
              {Object.entries(CHARACTER_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="rarity-filter">レアリティ:</label>
            <select
              id="rarity-filter"
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="filter-select"
            >
              <option value="all">すべて</option>
              {Object.entries(CHARACTER_RARITY).map(([key, rarity]) => (
                <option key={key} value={key}>{rarity.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-select">並び順:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="name">名前</option>
              <option value="type">タイプ</option>
              <option value="rarity">レアリティ</option>
              <option value="level">レベル</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-input">検索:</label>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="キャラクター名で検索..."
              className="search-input"
            />
          </div>
        </div>

        <div className="character-selector-body">
          <div className="character-grid">
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                className={`character-card ${selectedCharacter?.id === character.id ? 'selected' : ''} ${!character.unlocked ? 'locked' : ''}`}
                onClick={() => character.unlocked && handleCharacterSelect(character)}
              >
                <div className="character-preview">
                  <div
                    className="character-avatar"
                    style={{
                      backgroundColor: character.customization.color,
                      borderColor: getRarityColor(character.rarity)
                    }}
                  >
                    {character.unlocked ? (
                      <span className="character-emoji">
                        {character.type === 'cute' && '🐱'}
                        {character.type === 'cool' && '🦁'}
                        {character.type === 'mysterious' && '🦄'}
                        {character.type === 'energetic' && '🐶'}
                      </span>
                    ) : (
                      <span className="lock-icon">🔒</span>
                    )}
                  </div>
                  
                  <div className="character-info">
                    <h4 className="character-name">{character.name}</h4>
                    <div className="character-meta">
                      <span
                        className="character-type"
                        style={{ color: getTypeColor(character.type) }}
                      >
                        {CHARACTER_TYPES[character.type]?.name}
                      </span>
                      <span
                        className="character-rarity"
                        style={{ color: getRarityColor(character.rarity) }}
                      >
                        {CHARACTER_RARITY[character.rarity]?.name}
                      </span>
                    </div>
                    <div className="character-level">
                      Lv.{character.level}
                    </div>
                  </div>
                </div>

                <div className="character-description">
                  {character.description}
                </div>

                {!character.unlocked && character.unlockConditions && (
                  <div className="unlock-conditions">
                    <h5>解放条件:</h5>
                    <ul>
                      {character.unlockConditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {character.unlocked && (
                  <div className="character-actions">
                    <button
                      className="select-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCharacterSelect(character);
                      }}
                    >
                      選択
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedCharacter && (
          <div className="character-preview-panel">
            <h4>選択中のキャラクター</h4>
            <div className="selected-character-info">
              <div
                className="selected-character-avatar"
                style={{
                  backgroundColor: selectedCharacter.customization.color,
                  borderColor: getRarityColor(selectedCharacter.rarity)
                }}
              >
                <span className="character-emoji">
                  {selectedCharacter.type === 'cute' && '🐱'}
                  {selectedCharacter.type === 'cool' && '🦁'}
                  {selectedCharacter.type === 'mysterious' && '🦄'}
                  {selectedCharacter.type === 'energetic' && '🐶'}
                </span>
              </div>
              <div className="selected-character-details">
                <h5>{selectedCharacter.name}</h5>
                <p>{selectedCharacter.description}</p>
                <div className="character-stats">
                  <span>レベル: {selectedCharacter.level}</span>
                  <span>経験値: {selectedCharacter.experience}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="character-selector-footer">
          <button className="cancel-button" onClick={onClose}>
            キャンセル
          </button>
          <button
            className="confirm-button"
            onClick={handleConfirm}
            disabled={!selectedCharacter}
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelector;
