import React, { useState, useEffect } from 'react';
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
  onSelectCharacter: (character: Character) => void;
  currentCharacter: Character | null;
}

const CharacterHome: React.FC<CharacterHomeProps> = ({ onSelectCharacter, currentCharacter }) => {
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

  // デフォルトキャラクター
  const defaultCharacters: Character[] = [
    {
      id: 'default-1',
      name: 'メインキャラクター',
      author: 'システム',
      svg: `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <!-- 角丸の背景（iOSアイコン風） -->
        <rect width="512" height="512" fill="#1DA1F2" rx="112" ry="112"/>
        
        <!-- 体の黒い輪郭 -->
        <ellipse cx="256" cy="360" rx="135" ry="110" fill="#3a4556" stroke="#2c3344" stroke-width="12"/>
        
        <!-- 体の緑色部分 -->
        <ellipse cx="256" cy="360" rx="110" ry="85" fill="#4CAF50"/>
        
        <!-- 頭の黒い輪郭 -->
        <circle cx="256" cy="190" r="120" fill="#3a4556" stroke="#2c3344" stroke-width="12"/>
        
        <!-- 頭の黄色い顔 -->
        <circle cx="256" cy="190" r="95" fill="#FFD700"/>
        
        <!-- 左目 -->
        <circle cx="225" cy="175" r="10" fill="#1a1a1a"/>
        
        <!-- 右目 -->
        <circle cx="287" cy="175" r="10" fill="#1a1a1a"/>
        
        <!-- 口（大きく開いた黒い楕円） -->
        <ellipse cx="256" cy="215" rx="30" ry="25" fill="#1a1a1a"/>
      </svg>`,
      description: '青い背景に黄色い頭と緑色の体のメインキャラクターです。',
      likes: 0,
      createdAt: new Date().toISOString(),
      isPublic: true,
      tags: ['デフォルト', 'メイン']
    },
    {
      id: 'default-2',
      name: 'クラシックキャラクター',
      author: 'システム',
      svg: `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <!-- 背景 -->
        <rect width="512" height="512" fill="#3b82f6" rx="80"/>
        
        <!-- キャラクターの頭（明るい黄色） -->
        <circle cx="256" cy="220" r="100" fill="#ffff00" stroke="#1f2937" stroke-width="8"/>
        
        <!-- 目（大きな黒い円形） -->
        <circle cx="230" cy="200" r="12" fill="#1f2937"/>
        <circle cx="282" cy="200" r="12" fill="#1f2937"/>
        
        <!-- 目のハイライト（白い点） -->
        <circle cx="235" cy="195" r="3" fill="#ffffff"/>
        <circle cx="287" cy="195" r="3" fill="#ffffff"/>
        
        <!-- 口（上下逆さまの半円形） -->
        <path d="M 220 240 A 20 15 0 0 0 292 240" fill="#1f2937"/>
        
        <!-- 舌（白い楕円形） -->
        <ellipse cx="256" cy="235" rx="8" ry="5" fill="#ffffff"/>
        
        <!-- 胴体（緑色、小さく） -->
        <ellipse cx="256" cy="370" rx="50" ry="40" fill="#22c55e" stroke="#1f2937" stroke-width="8"/>
      </svg>`,
      description: 'シンプルで可愛いクラシックなデザインのキャラクターです。',
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
    if (!newCharacter.name || !newCharacter.svg) return;

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

  return (
    <div className="character-home">
      <div className="character-home-header">
        <h1>🏠 キャラクター達のお家</h1>
        <p>みんなが作ったキャラクターが集まる場所です</p>
      </div>

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
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>SVGコード</label>
              <textarea
                value={newCharacter.svg}
                onChange={(e) => setNewCharacter({...newCharacter, svg: e.target.value})}
                placeholder="SVGコードを貼り付けてください"
                rows={10}
              />
            </div>
            <div className="form-group">
              <label>タグ（カンマ区切り）</label>
              <input
                type="text"
                value={newCharacter.tags?.join(', ') || ''}
                onChange={(e) => setNewCharacter({...newCharacter, tags: e.target.value.split(',').map(tag => tag.trim())})}
                placeholder="例: かわいい, クール, シンプル"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newCharacter.isPublic}
                  onChange={(e) => setNewCharacter({...newCharacter, isPublic: e.target.checked})}
                />
                みんなに公開する
              </label>
            </div>
            <div className="modal-buttons">
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

      <div className="character-gallery">
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
              <p className="character-author">by {character.author}</p>
              <p className="character-description">{character.description}</p>
              <div className="character-tags">
                {character.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="character-actions">
                <button
                  onClick={() => onSelectCharacter(character)}
                  className={`select-btn ${currentCharacter?.id === character.id ? 'selected' : ''}`}
                >
                  {currentCharacter?.id === character.id ? '選択中' : '選択'}
                </button>
                <button
                  onClick={() => handleLikeCharacter(character.id)}
                  className="like-btn"
                >
                  ❤️ {character.likes}
                </button>
                {character.author === 'ユーザー' && (
                  <button
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="no-characters">
          <p>キャラクターが見つかりませんでした</p>
        </div>
      )}
    </div>
  );
};

export default CharacterHome;
