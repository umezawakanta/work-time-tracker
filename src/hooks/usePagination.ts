import { useState, useMemo } from 'react';

export const usePagination = (totalItems: number, itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  // 総ページ数を計算
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  // ページネーションされたアイテムを取得
  const getPaginatedItems = <T>(items: T[]): T[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // ページを変更
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 次のページに移動
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 前のページに移動
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 最初のページに移動
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  // 最後のページに移動
  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  // ページネーション情報を取得
  const getPaginationInfo = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return {
      startItem,
      endItem,
      totalItems,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  };

  // 表示するページ番号の配列を取得
  const getVisiblePages = (maxVisible: number = 5): number[] => {
    const pages: number[] = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // ページネーションをリセット
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // アイテム数が変更されたときにページを調整
  const adjustPageForItemCount = (newTotalItems: number) => {
    const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    getPaginatedItems,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    getPaginationInfo,
    getVisiblePages,
    resetPagination,
    adjustPageForItemCount,
  };
};