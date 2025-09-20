import React, { useState, useEffect } from 'react';
import './SelfEncyclopediaComponent.css';
import type { EncyclopediaEntry, EncyclopediaCategory } from '../types';

const SelfEncyclopediaComponent: React.FC = () => {
  const [entries, setEntries] = useState<EncyclopediaEntry[]>([]);
  const [categories, setCategories] = useState<EncyclopediaCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // デフォルトカテゴリを設定
  useEffect(() => {
    const defaultCategories: EncyclopediaCategory[] = [
      {
        id: 'all',
        name: 'すべて',
        description: 'すべてのエントリを表示',
        icon: '📚',
        color: '#667eea',
        order: 0
      },
      {
        id: 'personal',
        name: '個人情報',
        description: '自分の基本情報やプロフィール',
        icon: '👤',
        color: '#ff6b6b',
        order: 1
      },
      {
        id: 'skills',
        name: 'スキル・能力',
        description: '持っているスキルや能力',
        icon: '💪',
        color: '#4ecdc4',
        order: 2
      },
      {
        id: 'interests',
        name: '興味・関心',
        description: '興味のある分野や関心事',
        icon: '🌟',
        color: '#45b7d1',
        order: 3
      },
      {
        id: 'experiences',
        name: '経験・体験',
        description: 'これまでの経験や体験談',
        icon: '🎯',
        color: '#f9ca24',
        order: 4
      },
      {
        id: 'goals',
        name: '目標・夢',
        description: '将来の目標や夢',
        icon: '🚀',
        color: '#6c5ce7',
        order: 5
      }
    ];
    setCategories(defaultCategories);
  }, []);

  // エントリを読み込み
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      // ローカルストレージからエントリを読み込み
      const savedEntries = localStorage.getItem('encyclopediaEntries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt)
        }));
        setEntries(parsedEntries);
      }
    } catch (error) {
      console.error('エントリの読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesCategory = selectedCategory === 'all' || entry.category.id === selectedCategory;
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateEntry = () => {
    // 新しいエントリ作成の処理（次のステップで実装）
    console.log('新しいエントリを作成');
  };

  if (isLoading) {
    return (
      <div className="encyclopedia-container">
        <div className="encyclopedia-loading">
          <div className="loading-spinner"></div>
          <p>じぶん図鑑を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="encyclopedia-container">
      <div className="encyclopedia-header">
        <h2>📚 じぶん図鑑</h2>
        <p>自分自身について記録し、整理するための図鑑です</p>
      </div>

      <div className="encyclopedia-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="エントリを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-section">
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                data-color={category.color}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="encyclopedia-content">
        <div className="entries-grid">
          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>エントリがありません</h3>
              <p>新しいエントリを作成して、自分自身について記録してみましょう</p>
              <button 
                className="create-entry-btn"
                onClick={handleCreateEntry}
              >
                + 新しいエントリを作成
              </button>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-category">
                    <span className="category-icon">{entry.category.icon}</span>
                    <span className="category-name">{entry.category.name}</span>
                  </div>
                  <div className="entry-stats">
                    <span className="views">👁️ {entry.views}</span>
                    <span className="likes">❤️ {entry.likes}</span>
                  </div>
                </div>
                
                <div className="entry-content">
                  <h3 className="entry-title">{entry.title}</h3>
                  <p className="entry-description">{entry.description}</p>
                  
                  {entry.tags.length > 0 && (
                    <div className="entry-tags">
                      {entry.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="entry-footer">
                  <span className="entry-date">
                    {entry.updatedAt.toLocaleDateString('ja-JP')}
                  </span>
                  <div className="entry-actions">
                    <button className="action-btn view-btn">👁️ 表示</button>
                    <button className="action-btn edit-btn">✏️ 編集</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfEncyclopediaComponent;
