import React, { useState, useEffect } from 'react';
import type { GenreManagementProps } from '../../types/memos';

const GenreManagementModal: React.FC<GenreManagementProps> = ({
  isOpen,
  onClose,
  customCategories,
  setCustomCategories,
  deletedDefaultCategories,
  setDeletedDefaultCategories,
  onSave,
  DEFAULT_CATEGORIES = []
}) => {
  const [newGenre, setNewGenre] = useState('');
  const [editingGenre, setEditingGenre] = useState<string | null>(null);
  const [editGenreValue, setEditGenreValue] = useState('');

  // モーダルが開かれたときに編集状態をリセット
  useEffect(() => {
    if (isOpen) {
      setNewGenre('');
      setEditingGenre(null);
      setEditGenreValue('');
    }
  }, [isOpen]);

  const handleAddGenre = () => {
    if (newGenre.trim() && !customCategories.includes(newGenre.trim())) {
      setCustomCategories([...customCategories, newGenre.trim()]);
      setNewGenre('');
    }
  };

  const handleEditGenre = (oldGenre: string) => {
    setEditingGenre(oldGenre);
    setEditGenreValue(oldGenre);
  };

  const handleSaveEditGenre = () => {
    if (editingGenre && editGenreValue.trim() && editGenreValue.trim() !== editingGenre) {
      setCustomCategories(customCategories.map(cat => 
        cat === editingGenre ? editGenreValue.trim() : cat
      ));
    }
    setEditingGenre(null);
    setEditGenreValue('');
  };

  const handleCancelEditGenre = () => {
    setEditingGenre(null);
    setEditGenreValue('');
  };

  const handleDeleteGenre = (genre: string) => {
    setCustomCategories(customCategories.filter(cat => cat !== genre));
  };

  const handleDeleteDefaultGenre = (genre: string) => {
    if (!deletedDefaultCategories.includes(genre)) {
      setDeletedDefaultCategories([...deletedDefaultCategories, genre]);
    }
  };

  const handleRestoreDefaultGenre = (genre: string) => {
    setDeletedDefaultCategories(deletedDefaultCategories.filter(cat => cat !== genre));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content genre-management-modal">
        <div className="modal-header">
          <h3>ジャンル管理</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {/* カスタムジャンル追加 */}
          <div className="genre-section">
            <h4>カスタムジャンルを追加</h4>
            <div className="genre-input-group">
              <input
                type="text"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                placeholder="新しいジャンル名を入力"
                onKeyPress={(e) => e.key === 'Enter' && handleAddGenre()}
                aria-label="新しいジャンル名を入力"
              />
              <button onClick={handleAddGenre} disabled={!newGenre.trim()}>
                追加
              </button>
            </div>
          </div>

          {/* カスタムジャンル一覧 */}
          <div className="genre-section">
            <h4>カスタムジャンル</h4>
            <div className="genre-list">
              {customCategories.map((genre) => (
                <div key={genre} className="genre-item">
                  {editingGenre === genre ? (
                    <div className="genre-edit-group">
                      <input
                        type="text"
                        value={editGenreValue}
                        onChange={(e) => setEditGenreValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEditGenre()}
                        autoFocus
                        aria-label="ジャンル名を編集"
                      />
                      <button onClick={handleSaveEditGenre}>保存</button>
                      <button onClick={handleCancelEditGenre}>キャンセル</button>
                    </div>
                  ) : (
                    <>
                      <span className="genre-name">{genre}</span>
                      <div className="genre-actions">
                        <button onClick={() => handleEditGenre(genre)}>編集</button>
                        <button onClick={() => handleDeleteGenre(genre)}>削除</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {customCategories.length === 0 && (
                <p className="no-genres">カスタムジャンルがありません</p>
              )}
            </div>
          </div>

          {/* デフォルトジャンル管理 */}
          <div className="genre-section">
            <h4>デフォルトジャンル</h4>
            <div className="genre-list">
              {(DEFAULT_CATEGORIES || []).map((genre) => {
                const isDeleted = deletedDefaultCategories.includes(genre);
                return (
                  <div key={genre} className={`genre-item ${isDeleted ? 'deleted' : ''}`}>
                    <span className="genre-name">{genre}</span>
                    <div className="genre-actions">
                      {isDeleted ? (
                        <button onClick={() => handleRestoreDefaultGenre(genre)}>
                          復元
                        </button>
                      ) : (
                        <button onClick={() => handleDeleteDefaultGenre(genre)}>
                          非表示
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            キャンセル
          </button>
          <button className="save-button" onClick={onSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenreManagementModal;
