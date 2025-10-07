import React from 'react';
import type { MemoFiltersProps } from '../../types/memos';

const MemoFilters: React.FC<MemoFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onReset
}) => {
  return (
    <div className="memo-filters">
      <div className="filter-group">
        <label htmlFor="categoryFilter">カテゴリ:</label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">すべて</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      {selectedCategory !== 'all' && (
        <button
          onClick={onReset}
          className="reset-filter-button"
          title="フィルターをリセット"
        >
          🔄 リセット
        </button>
      )}
    </div>
  );
};

export default MemoFilters;
