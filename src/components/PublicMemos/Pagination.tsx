import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  position?: 'top' | 'bottom';
  showInfo?: boolean;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  position = 'bottom',
  showInfo = true,
  maxVisiblePages = 5
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * 10 + 1; // 仮のアイテム数
  const endItem = Math.min(currentPage * 10, 100); // 仮の総アイテム数

  return (
    <div className={`pagination ${position === 'top' ? 'pagination-top' : 'pagination-bottom'}`}>
      {showInfo && (
        <div className="pagination-info">
          {startItem}-{endItem}件を表示
        </div>
      )}
      
      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="最初のページ"
        >
          «
        </button>
        
        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="前のページ"
        >
          ‹
        </button>
        
        {visiblePages[0] > 1 && (
          <>
            <button
              className="pagination-button"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className="pagination-ellipsis">...</span>
            )}
          </>
        )}
        
        {visiblePages.map(page => (
          <button
            key={page}
            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              className="pagination-button"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="次のページ"
        >
          ›
        </button>
        
        <button
          className="pagination-button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="最後のページ"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;

