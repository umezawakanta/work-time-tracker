import React, { useState, useEffect } from 'react';
import { Character, CharacterAchievement } from '../types/character';
import { characterManager } from '../utils/characterManager';
import './CharacterCollection.css';

interface CharacterCollectionProps {
  character: Character | null;
  onClose: () => void;
}

interface CollectionItem {
  id: string;
  name: string;
  description: string;
  type: 'character' | 'accessory' | 'achievement' | 'item';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  emoji: string;
  category: string;
}

const CharacterCollection: React.FC<CharacterCollectionProps> = ({
  character,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'accessories' | 'achievements' | 'items'>('characters');
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  // コレクションアイテムを生成
  useEffect(() => {
    const items: CollectionItem[] = [];

    // キャラクター
    const characters = characterManager.getAvailableCharacters();
    characters.forEach(char => {
      items.push({
        id: `char_${char.id}`,
        name: char.name,
        description: char.description,
        type: 'character',
        rarity: char.rarity,
        unlocked: true, // 選択可能なキャラクターは全てアンロック済み
        emoji: char.type === 'cute' ? '🐱' : char.type === 'cool' ? '🦁' : char.type === 'mysterious' ? '🦄' : '🐶',
        category: 'キャラクター'
      });
    });

    // アクセサリー
    const accessories = [
      { id: 'crown', name: '王冠', description: '高貴な王冠', rarity: 'epic' as const, emoji: '👑' },
      { id: 'wings', name: '翼', description: '美しい翼', rarity: 'epic' as const, emoji: '🪽' },
      { id: 'halo', name: 'ハロー', description: '神聖な光輪', rarity: 'legendary' as const, emoji: '😇' },
      { id: 'glasses', name: 'メガネ', description: '知的なメガネ', rarity: 'common' as const, emoji: '🤓' },
      { id: 'hat', name: '帽子', description: 'おしゃれな帽子', rarity: 'common' as const, emoji: '🎩' },
      { id: 'bow', name: 'リボン', description: '可愛いリボン', rarity: 'common' as const, emoji: '🎀' }
    ];

    accessories.forEach(accessory => {
      const unlocked = character?.level >= (accessory.id === 'crown' ? 5 : accessory.id === 'wings' ? 10 : accessory.id === 'halo' ? 15 : 1);
      items.push({
        id: `acc_${accessory.id}`,
        name: accessory.name,
        description: accessory.description,
        type: 'accessory',
        rarity: accessory.rarity,
        unlocked,
        emoji: accessory.emoji,
        category: 'アクセサリー'
      });
    });

    // アチーブメント
    const achievements = characterManager.getAchievements();
    achievements.forEach(achievement => {
      items.push({
        id: `ach_${achievement.id}`,
        name: achievement.name,
        description: achievement.description,
        type: 'achievement',
        rarity: achievement.rarity,
        unlocked: achievement.unlocked,
        unlockedAt: achievement.unlockedAt,
        emoji: '🏆',
        category: 'アチーブメント'
      });
    });

    // アイテム（ゲーム報酬など）
    const gameItems = [
      { id: 'golden_coin', name: 'ゴールドコイン', description: '高得点の証', rarity: 'rare' as const, emoji: '🪙' },
      { id: 'combo_master', name: 'コンボマスター', description: '連続ヒットの達人', rarity: 'epic' as const, emoji: '⚡' },
      { id: 'speed_demon', name: 'スピードデーモン', description: '素早い反応の証', rarity: 'rare' as const, emoji: '💨' }
    ];

    gameItems.forEach(item => {
      const unlocked = character ? characterManager.hasGameItem(character.id, item.id) : false;
      items.push({
        id: `item_${item.id}`,
        name: item.name,
        description: item.description,
        type: 'item',
        rarity: item.rarity,
        unlocked,
        emoji: item.emoji,
        category: 'アイテム'
      });
    });

    setCollectionItems(items);
  }, [character]);

  // フィルタリング
  const getFilteredItems = () => {
    return collectionItems.filter(item => {
      switch (activeTab) {
        case 'characters':
          return item.type === 'character';
        case 'accessories':
          return item.type === 'accessory';
        case 'achievements':
          return item.type === 'achievement';
        case 'items':
          return item.type === 'item';
        default:
          return true;
      }
    });
  };

  // レアリティの色を取得
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6c757d';
      case 'rare': return '#007bff';
      case 'epic': return '#6f42c1';
      case 'legendary': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  // レアリティの日本語名を取得
  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'コモン';
      case 'rare': return 'レア';
      case 'epic': return 'エピック';
      case 'legendary': return 'レジェンダリー';
      default: return 'コモン';
    }
  };

  const filteredItems = getFilteredItems();
  const unlockedCount = filteredItems.filter(item => item.unlocked).length;
  const totalCount = filteredItems.length;

  return (
    <div className="character-collection">
      <div className="collection-header">
        <h3>📚 コレクション</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="collection-tabs">
        <button
          className={`tab-button ${activeTab === 'characters' ? 'active' : ''}`}
          onClick={() => setActiveTab('characters')}
        >
          🎭 キャラクター ({collectionItems.filter(item => item.type === 'character').length})
        </button>
        <button
          className={`tab-button ${activeTab === 'accessories' ? 'active' : ''}`}
          onClick={() => setActiveTab('accessories')}
        >
          👑 アクセサリー ({collectionItems.filter(item => item.type === 'accessory').length})
        </button>
        <button
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 アチーブメント ({collectionItems.filter(item => item.type === 'achievement').length})
        </button>
        <button
          className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          🎁 アイテム ({collectionItems.filter(item => item.type === 'item').length})
        </button>
      </div>

      <div className="collection-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          {unlockedCount} / {totalCount} コレクション完了
        </span>
      </div>

      <div className="collection-content">
        <div className="collection-grid">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`collection-item ${item.unlocked ? 'unlocked' : 'locked'} ${item.rarity}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="item-emoji">{item.emoji}</div>
              <div className="item-info">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-description">{item.description}</p>
                <div className="item-rarity" style={{ color: getRarityColor(item.rarity) }}>
                  {getRarityName(item.rarity)}
                </div>
                {item.unlocked && item.unlockedAt && (
                  <div className="item-unlocked-date">
                    獲得日: {new Date(item.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              {!item.unlocked && <div className="lock-overlay">🔒</div>}
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div className="item-detail-modal">
          <div className="item-detail-overlay" onClick={() => setSelectedItem(null)} />
          <div className="item-detail-content">
            <button className="close-detail-button" onClick={() => setSelectedItem(null)}>
              ×
            </button>
            <div className="detail-emoji">{selectedItem.emoji}</div>
            <h3 className="detail-name">{selectedItem.name}</h3>
            <p className="detail-description">{selectedItem.description}</p>
            <div className="detail-rarity" style={{ color: getRarityColor(selectedItem.rarity) }}>
              レアリティ: {getRarityName(selectedItem.rarity)}
            </div>
            <div className="detail-category">
              カテゴリ: {selectedItem.category}
            </div>
            {selectedItem.unlocked ? (
              <div className="detail-status unlocked">
                ✅ アンロック済み
                {selectedItem.unlockedAt && (
                  <div className="detail-unlocked-date">
                    獲得日: {new Date(selectedItem.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="detail-status locked">
                🔒 未アンロック
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCollection;
