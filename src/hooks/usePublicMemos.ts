import { useState, useMemo } from 'react';
import type { Memo } from '../types';

export const usePublicMemos = (publicMemos: Memo[]) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterByDate, setFilterByDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // フィルタリングされたメモを取得
  const getFilteredMemos = useMemo(() => {
    let filtered = [...publicMemos];

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(memo => memo.status === statusFilter);
    }

    // タグフィルター
    if (tagFilter) {
      filtered = filtered.filter(memo => 
        memo.tags.some(tag => 
          tag.toLowerCase().includes(tagFilter.toLowerCase())
        )
      );
    }

    // 除外タグフィルター
    if (excludeTags.length > 0) {
      filtered = filtered.filter(memo => 
        !memo.tags.some(tag => excludeTags.includes(tag))
      );
    }

    // 日付フィルター
    if (filterByDate) {
      const filterDateStr = filterByDate.toISOString().split('T')[0];
      filtered = filtered.filter(memo => {
        const memoDateStr = new Date(memo.createdAt).toISOString().split('T')[0];
        return memoDateStr === filterDateStr;
      });
    }

    // 検索クエリフィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(memo => 
        memo.title?.toLowerCase().includes(query) ||
        memo.content?.toLowerCase().includes(query) ||
        memo.tags.some(tag => tag.toLowerCase().includes(query)) ||
        memo.author?.toLowerCase().includes(query)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      const aValue = sortBy === 'createdAt' ? new Date(a.createdAt).getTime() : new Date(a.updatedAt || a.createdAt).getTime();
      const bValue = sortBy === 'createdAt' ? new Date(b.createdAt).getTime() : new Date(b.updatedAt || b.createdAt).getTime();
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [publicMemos, statusFilter, tagFilter, excludeTags, filterByDate, searchQuery, sortBy, sortOrder]);

  // 利用可能なタグを取得
  const availableTags = useMemo(() => {
    const allTags = publicMemos.flatMap(memo => memo.tags);
    return Array.from(new Set(allTags)).sort();
  }, [publicMemos]);

  // フィルターをクリア
  const clearFilters = () => {
    setStatusFilter('all');
    setTagFilter('');
    setExcludeTags([]);
    setFilterByDate(null);
    setSearchQuery('');
  };

  // タグの除外を切り替え
  const toggleExcludeTag = (tag: string) => {
    setExcludeTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // ソート設定を変更
  const changeSort = (newSortBy: 'createdAt' | 'updatedAt', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // 日付フィルターを設定
  const setDateFilter = (date: Date | null) => {
    setFilterByDate(date);
  };

  return {
    // 状態
    statusFilter,
    setStatusFilter,
    tagFilter,
    setTagFilter,
    excludeTags,
    setExcludeTags,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterByDate,
    setFilterByDate,
    searchQuery,
    setSearchQuery,
    
    // 計算された値
    filteredMemos: getFilteredMemos,
    availableTags,
    
    // アクション
    clearFilters,
    toggleExcludeTag,
    changeSort,
    setDateFilter,
  };
};

