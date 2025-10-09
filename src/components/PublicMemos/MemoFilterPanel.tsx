import React from 'react';

interface MemoFilterPanelProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  tagFilter: string;
  setTagFilter: (tag: string) => void;
  excludeTags: string[];
  toggleExcludeTag: (tag: string) => void;
  availableTags: string[];
  onClearFilters: () => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  sortBy: 'createdAt' | 'updatedAt';
  setSortBy: (sortBy: 'createdAt' | 'updatedAt') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
}

const MemoFilterPanel: React.FC<MemoFilterPanelProps> = ({
  statusFilter,
  setStatusFilter,
  tagFilter,
  setTagFilter,
  excludeTags,
  toggleExcludeTag,
  availableTags,
  onClearFilters,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  const statusOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'pending', label: '保留中' },
    { value: 'in_progress', label: '対応中' },
    { value: 'resolved', label: '解決済み' },
    { value: 'rejected', label: '却下' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: '作成日' },
    { value: 'updatedAt', label: '更新日' }
  ];

  const orderOptions = [
    { value: 'desc', label: '新しい順' },
    { value: 'asc', label: '古い順' }
  ];

  return (
    <div className="memo-filter-panel">
      <div className="filter-header">
        <h3>フィルター</h3>
        <button className="clear-filters-button" onClick={onClearFilters}>
          クリア
        </button>
      </div>
      
      <div className="filter-content">
        {/* 検索 */}
        <div className="filter-group">
          <label htmlFor="search-query">検索</label>
          <input
            id="search-query"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトル、内容、タグ、作者で検索..."
            className="filter-input"
          />
        </div>

        {/* ステータスフィルター */}
        <div className="filter-group">
          <label htmlFor="status-filter">ステータス</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* タグフィルター */}
        <div className="filter-group">
          <label htmlFor="tag-filter">タグ</label>
          <input
            id="tag-filter"
            type="text"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="タグで検索..."
            className="filter-input"
          />
        </div>

        {/* 除外タグ */}
        <div className="filter-group">
          <label>除外タグ</label>
          <div className="exclude-tags">
            {availableTags.map(tag => (
              <button
                key={tag}
                className={`exclude-tag-button ${excludeTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleExcludeTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ソート設定 */}
        <div className="filter-group">
          <label htmlFor="sort-by">並び順</label>
          <div className="sort-controls">
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'updatedAt')}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="filter-select"
            >
              {orderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoFilterPanel;

