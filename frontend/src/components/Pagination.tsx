import { FC } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 7,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSiblings = Math.max(1, currentPage - 1);
      const rightSiblings = Math.min(totalPages, currentPage + 1);
      
      const shouldShowLeftDots = leftSiblings > 2;
      const shouldShowRightDots = rightSiblings < totalPages - 1;
      
      if (!shouldShowLeftDots && shouldShowRightDots) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        pages.push(1);
        pages.push('...');
        for (let i = leftSiblings; i <= rightSiblings; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            px-3 py-1 rounded-lg flex items-center
            ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100'}
          `}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Previous
        </button>
        
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`
                px-3 py-1 rounded-lg min-w-[40px]
                ${page === currentPage
                  ? 'bg-primary-600 text-white'
                  : page === '...'
                  ? 'bg-white text-gray-400 cursor-default'
                  : 'bg-white text-gray-700 hover:bg-gray-100'}
              `}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            px-3 py-1 rounded-lg flex items-center
            ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100'}
          `}
        >
          Next
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="text-sm text-gray-700">
        Page <span className="font-medium">{currentPage}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
      </div>
    </div>
  );
};
