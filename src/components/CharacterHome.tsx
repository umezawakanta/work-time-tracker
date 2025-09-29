import React, { useState, useEffect } from 'react';
import { Character as CharacterType, UserCharacterSettings } from '../types/character';
import { characterManager } from '../utils/characterManager';
import CharacterDisplay from './CharacterDisplay';
import CharacterSelector from './CharacterSelector';
import CharacterProgress from './CharacterProgress';
import CharacterCustomizationComponent from './CharacterCustomization';
import CharacterMiniGame from './CharacterMiniGame';
import CharacterCollection from './CharacterCollection';
import CharacterShare from './CharacterShare';
import CharacterAchievementGallery from './CharacterAchievementGallery';
import './CharacterHome.css';

interface Character {
  id: string;
  name: string;
  author: string;
  svg: string;
  description: string;
  likes: number;
  createdAt: string;
  isPublic: boolean;
  tags: string[];
}

interface CharacterHomeProps {
  showCharacterHome: boolean;
  setShowCharacterHome: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  onSelectCharacter?: (character: Character) => void;
  currentCharacter?: Character | null;
  // 新しいキャラクター機能のプロパティ
  selectedCharacter?: CharacterType | null;
  characterSettings?: UserCharacterSettings;
  workState?: 'idle' | 'working' | 'break' | 'completed';
  onCharacterInteraction?: (interaction: string) => void;
  onCharacterLevelUp?: (newLevel: number) => void;
  onCharacterAchievement?: (achievementId: string) => void;
  onCharacterSelect?: (character: CharacterType) => void;
  onCharacterSettingsUpdate?: (updates: Partial<UserCharacterSettings>) => void;
}

const CharacterHome: React.FC<CharacterHomeProps> = ({ 
  showCharacterHome, 
  setShowCharacterHome, 
  closeOtherFeatures, 
  onSelectCharacter, 
  currentCharacter,
  selectedCharacter = null,
  characterSettings = {
    selectedCharacterId: '',
    customizations: {
      color: '#FF6B6B',
      size: 'medium',
      expression: 'happy',
      accessories: []
    },
    preferences: {
      animationSpeed: 'normal',
      showAnimations: true,
      soundEffects: true,
      autoInteract: false
    },
    achievements: [],
    unlockedCharacters: [],
    totalExperience: 0,
    playTime: 0
  },
  workState = 'idle',
  onCharacterInteraction = () => {},
  onCharacterLevelUp = () => {},
  onCharacterAchievement = () => {},
  onCharacterSelect = () => {},
  onCharacterSettingsUpdate = () => {}
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newCharacter, setNewCharacter] = useState<Partial<Character>>({
    name: '',
    description: '',
    svg: '',
    tags: [],
    isPublic: true
  });

  // 新しいキャラクター機能の状態
  const [activeTab, setActiveTab] = useState<'home' | 'characters' | 'progress' | 'customization' | 'minigame' | 'collection' | 'share' | 'gallery'>('home');
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showCharacterProgress, setShowCharacterProgress] = useState(false);
  const [showCharacterCustomization, setShowCharacterCustomization] = useState(false);
  const [showCharacterMiniGame, setShowCharacterMiniGame] = useState(false);
  const [showCharacterCollection, setShowCharacterCollection] = useState(false);
  const [showCharacterShare, setShowCharacterShare] = useState(false);
  const [showCharacterAchievementGallery, setShowCharacterAchievementGallery] = useState(false);

  // デフォルトキャラクター
  const defaultCharacters: Character[] = [
    {
      id: 'default-1',
      name: 'メインキャラクター',
      author: 'システム',
      svg: `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#1DA1F2" rx="112" ry="112"/>
        <ellipse cx="256" cy="360" rx="135" ry="110" fill="#3a4556" stroke="#2c3344" stroke-width="12"/>
        <ellipse cx="256" cy="360" rx="110" ry="85" fill="#4CAF50"/>
        <circle cx="256" cy="190" r="120" fill="#3a4556" stroke="#2c3344" stroke-width="12"/>
        <circle cx="256" cy="190" r="95" fill="#FFD700"/>
        <circle cx="225" cy="175" r="10" fill="#1a1a1a"/>
        <circle cx="287" cy="175" r="10" fill="#1a1a1a"/>
        <ellipse cx="256" cy="215" rx="30" ry="25" fill="#1a1a1a"/>
      </svg>`,
      description: '青い背景に黄色い頭と緑色の体のメインキャラクターです。',
      likes: 0,
      createdAt: new Date().toISOString(),
      isPublic: true,
      tags: ['デフォルト', 'クラシック']
    }
  ];

  useEffect(() => {
    // ローカルストレージからキャラクターを読み込み
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    } else {
      setCharacters(defaultCharacters);
      localStorage.setItem('characters', JSON.stringify(defaultCharacters));
    }
  }, []);

  const filteredCharacters = characters.filter(character => {
    const matchesCategory = selectedCategory === 'all' || 
      character.tags.includes(selectedCategory) ||
      (selectedCategory === 'my' && character.author !== 'システム');
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateCharacter = () => {
    if (!newCharacter.name || !newCharacter.svg) {
      return;
    }

    const character: Character = {
      id: `char-${Date.now()}`,
      name: newCharacter.name!,
      author: 'ユーザー',
      svg: newCharacter.svg!,
      description: newCharacter.description || '',
      likes: 0,
      createdAt: new Date().toISOString(),
      isPublic: newCharacter.isPublic || false,
      tags: newCharacter.tags || []
    };

    const updatedCharacters = [...characters, character];
    setCharacters(updatedCharacters);
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
    
    setNewCharacter({
      name: '',
      description: '',
      svg: '',
      tags: [],
      isPublic: true
    });
    setShowCreateForm(false);
  };

  const handleLikeCharacter = (characterId: string) => {
    const updatedCharacters = characters.map(char => 
      char.id === characterId ? { ...char, likes: char.likes + 1 } : char
    );
    setCharacters(updatedCharacters);
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (window.confirm('このキャラクターを削除しますか？')) {
      const updatedCharacters = characters.filter(char => char.id !== characterId);
      setCharacters(updatedCharacters);
      localStorage.setItem('characters', JSON.stringify(updatedCharacters));
    }
  };

  // 新しいキャラクター機能のハンドラー
  const handleCharacterSelect = (character: CharacterType) => {
    onCharacterSelect?.(character);
    setShowCharacterSelector(false);
  };

  const handleCharacterInteraction = (interaction: string) => {
    onCharacterInteraction?.(interaction);
  };

  const handleCharacterLevelUp = (newLevel: number) => {
    onCharacterLevelUp?.(newLevel);
  };

  const handleCharacterAchievement = (achievementId: string) => {
    onCharacterAchievement?.(achievementId);
  };

  const handleCharacterSettingsUpdate = (updates: Partial<UserCharacterSettings>) => {
    onCharacterSettingsUpdate?.(updates);
  };

  const handleMiniGameComplete = (score: number, rewards: { experience: number; items: string[] }) => {
    console.log('Mini game completed:', { score, rewards });
    // 経験値を追加
    if (selectedCharacter) {
      const result = characterManager.addExperience(rewards.experience);
      if (result.leveledUp) {
        handleCharacterLevelUp(result.newLevel);
      }
      if (result.achievements.length > 0) {
        result.achievements.forEach(achievement => {
          handleCharacterAchievement(achievement.id);
        });
      }
    }
  };

  return (
    <div className="character-home">
      <div className="character-home-header">
        <h1>🏠 キャラクター達のお家</h1>
        <p>みんなが作ったキャラクターが集まる場所です</p>
      </div>

      {/* タブナビゲーション */}
      <div className="character-tabs">
        <button
          className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 ホーム
        </button>
        <button
          className={`tab-button ${activeTab === 'characters' ? 'active' : ''}`}
          onClick={() => setActiveTab('characters')}
        >
          🎭 キャラクター
        </button>
        <button
          className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📊 進捗
        </button>
        <button
          className={`tab-button ${activeTab === 'customization' ? 'active' : ''}`}
          onClick={() => setActiveTab('customization')}
        >
          🎨 カスタマイズ
        </button>
        <button
          className={`tab-button ${activeTab === 'minigame' ? 'active' : ''}`}
          onClick={() => setActiveTab('minigame')}
        >
          🎮 ゲーム
        </button>
        <button
          className={`tab-button ${activeTab === 'collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          📚 コレクション
        </button>
        <button
          className={`tab-button ${activeTab === 'share' ? 'active' : ''}`}
          onClick={() => setActiveTab('share')}
        >
          📤 共有
        </button>
        <button
          className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          🏆 ギャラリー
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="character-tab-content">
        {activeTab === 'home' && (
          <div className="home-content">
            {/* 現在のキャラクター表示 */}
            {selectedCharacter && characterSettings && (
              <div className="current-character-section">
                <h3>現在のキャラクター</h3>
                <CharacterDisplay
                  character={selectedCharacter}
                  settings={characterSettings}
                  workState={workState}
                  onInteraction={handleCharacterInteraction}
                  onLevelUp={handleCharacterLevelUp}
                  onAchievement={handleCharacterAchievement}
                  onProgressClick={() => setShowCharacterProgress(true)}
                  onCustomizeClick={() => setShowCharacterCustomization(true)}
                  onMiniGameClick={() => setShowCharacterMiniGame(true)}
                  onCollectionClick={() => setShowCharacterCollection(true)}
                  onShareClick={() => setShowCharacterShare(true)}
                  onAchievementGalleryClick={() => setShowCharacterAchievementGallery(true)}
                />
              </div>
            )}

            {/* キャラクター選択ボタン */}
            <div className="character-actions">
              <button
                className="select-character-btn"
                onClick={() => setShowCharacterSelector(true)}
              >
                🎭 キャラクターを選択
              </button>
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="characters-content">
            <div className="character-controls">
              <div className="search-section">
                <input
                  type="text"
                  placeholder="キャラクターを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-section">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                  aria-label="キャラクターカテゴリを選択"
                >
                  <option value="all">すべて</option>
                  <option value="my">私のキャラクター</option>
                  <option value="デフォルト">デフォルト</option>
                  <option value="クラシック">クラシック</option>
                  <option value="かわいい">かわいい</option>
                  <option value="クール">クール</option>
                </select>
              </div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="create-character-btn"
              >
                ✨ 新しいキャラクターを作る
              </button>
            </div>

            <div className="character-grid">
              {filteredCharacters.map(character => (
                <div key={character.id} className="character-card">
                  <div className="character-preview">
                    <div 
                      className="character-svg"
                      dangerouslySetInnerHTML={{ __html: character.svg }}
                    />
                  </div>
                  <div className="character-info">
                    <h3>{character.name}</h3>
                    <p>{character.description}</p>
                    <div className="character-meta">
                      <span className="author">by {character.author}</span>
                      <span className="likes">❤️ {character.likes}</span>
                    </div>
                    <div className="character-tags">
                      {character.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="character-actions">
                    <button
                      onClick={() => onSelectCharacter?.(character)}
                      className="select-btn"
                    >
                      選択
                    </button>
                    <button
                      onClick={() => handleLikeCharacter(character.id)}
                      className="like-btn"
                    >
                      ❤️
                    </button>
                    {character.author === 'ユーザー' && (
                      <button
                        onClick={() => handleDeleteCharacter(character.id)}
                        className="delete-btn"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="progress-content">
            {selectedCharacter && characterSettings ? (
              <div className="progress-wrapper">
                <CharacterProgress
                  character={selectedCharacter}
                  settings={characterSettings}
                  onClose={() => setShowCharacterProgress(false)}
                />
              </div>
            ) : (
              <div className="no-character-message">
                <p>キャラクターを選択してください</p>
                <button
                  className="select-character-btn"
                  onClick={() => setShowCharacterSelector(true)}
                >
                  🎭 キャラクターを選択
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'customization' && (
          <div className="customization-content">
            {selectedCharacter && characterSettings ? (
              <div className="customization-wrapper">
                <CharacterCustomizationComponent
                  character={selectedCharacter}
                  settings={characterSettings}
                  onCustomizationChange={handleCharacterSettingsUpdate}
                  onClose={() => setShowCharacterCustomization(false)}
                />
              </div>
            ) : (
              <div className="no-character-message">
                <p>キャラクターを選択してください</p>
                <button
                  className="select-character-btn"
                  onClick={() => setShowCharacterSelector(true)}
                >
                  🎭 キャラクターを選択
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'minigame' && (
          <div className="minigame-content">
            {selectedCharacter ? (
              <div className="minigame-wrapper">
                <CharacterMiniGame
                  character={selectedCharacter}
                  onGameComplete={handleMiniGameComplete}
                  onClose={() => setShowCharacterMiniGame(false)}
                />
              </div>
            ) : (
              <div className="no-character-message">
                <p>キャラクターを選択してください</p>
                <button
                  className="select-character-btn"
                  onClick={() => setShowCharacterSelector(true)}
                >
                  🎭 キャラクターを選択
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="collection-content">
            {selectedCharacter ? (
              <div className="collection-wrapper">
                <CharacterCollection
                  character={selectedCharacter}
                  onClose={() => setShowCharacterCollection(false)}
                />
              </div>
            ) : (
              <div className="no-character-message">
                <p>キャラクターを選択してください</p>
                <button
                  className="select-character-btn"
                  onClick={() => setShowCharacterSelector(true)}
                >
                  🎭 キャラクターを選択
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'share' && (
          <div className="share-content">
            {selectedCharacter ? (
              <div className="share-wrapper">
                <CharacterShare
                  character={selectedCharacter}
                  onClose={() => setShowCharacterShare(false)}
                />
              </div>
            ) : (
              <div className="no-character-message">
                <p>キャラクターを選択してください</p>
                <button
                  className="select-character-btn"
                  onClick={() => setShowCharacterSelector(true)}
                >
                  🎭 キャラクターを選択
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-content">
            {selectedCharacter ? (
              <div className="gallery-wrapper">
                <CharacterAchievementGallery
                  character={selectedCharacter}
                  onClose={() => setShowCharacterAchievementGallery(false)}
                />
              </div>
            ) : (
              <div className="no-character-message">
                <p>キャラクターを選択してください</p>
                <button
                  className="select-character-btn"
                  onClick={() => setShowCharacterSelector(true)}
                >
                  🎭 キャラクターを選択
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* キャラクター作成フォーム */}
      {showCreateForm && (
        <div className="create-character-modal">
          <div className="modal-content">
            <h3>新しいキャラクターを作る</h3>
            <div className="form-group">
              <label>キャラクター名</label>
              <input
                type="text"
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                placeholder="キャラクターの名前を入力"
              />
            </div>
            <div className="form-group">
              <label>説明</label>
              <textarea
                value={newCharacter.description}
                onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
                placeholder="キャラクターの説明を入力"
              />
            </div>
            <div className="form-group">
              <label>SVGコード</label>
              <textarea
                value={newCharacter.svg}
                onChange={(e) => setNewCharacter({...newCharacter, svg: e.target.value})}
                placeholder="SVGコードを入力"
                rows={10}
              />
            </div>
            <div className="form-group">
              <label>タグ（カンマ区切り）</label>
              <input
                type="text"
                value={newCharacter.tags?.join(', ') || ''}
                onChange={(e) => setNewCharacter({...newCharacter, tags: e.target.value.split(', ').filter(tag => tag.trim())})}
                placeholder="タグをカンマ区切りで入力"
              />
            </div>
            <div className="form-actions">
              <button onClick={handleCreateCharacter} className="create-btn">
                作成
              </button>
              <button onClick={() => setShowCreateForm(false)} className="cancel-btn">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* モーダルコンポーネント */}
      {showCharacterSelector && (
        <CharacterSelector
          onSelectCharacter={handleCharacterSelect}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}

      {showCharacterProgress && selectedCharacter && characterSettings && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CharacterProgress
              character={selectedCharacter}
              settings={characterSettings}
              onClose={() => setShowCharacterProgress(false)}
            />
          </div>
        </div>
      )}

      {showCharacterCustomization && selectedCharacter && characterSettings && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CharacterCustomizationComponent
              character={selectedCharacter}
              settings={characterSettings}
              onCustomizationChange={handleCharacterSettingsUpdate}
              onClose={() => setShowCharacterCustomization(false)}
            />
          </div>
        </div>
      )}

      {showCharacterMiniGame && selectedCharacter && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CharacterMiniGame
              character={selectedCharacter}
              onGameComplete={handleMiniGameComplete}
              onClose={() => setShowCharacterMiniGame(false)}
            />
          </div>
        </div>
      )}

      {showCharacterCollection && selectedCharacter && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CharacterCollection
              character={selectedCharacter}
              onClose={() => setShowCharacterCollection(false)}
            />
          </div>
        </div>
      )}

      {showCharacterShare && selectedCharacter && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CharacterShare
              character={selectedCharacter}
              onClose={() => setShowCharacterShare(false)}
            />
          </div>
        </div>
      )}

      {showCharacterAchievementGallery && selectedCharacter && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CharacterAchievementGallery
              character={selectedCharacter}
              onClose={() => setShowCharacterAchievementGallery(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterHome;