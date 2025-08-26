import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface CustomPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${currentPage === 1
          ? 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed'
          : 'text-primary-500 border-primary-600 hover:bg-blue-100'
          }`}
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        <FaArrowLeft />
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          className={`w-9 h-9 flex items-center justify-center rounded-full border border-primary-600 font-medium transition-colors ${page === currentPage
            ? 'bg-primary-500 text-white border-blue-600 font-bold'
            : 'text-pribg-primary-500 hover:bg-blue-100'
            }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${currentPage === totalPages
            ? 'text-gray-400 border-gray-400 cursor-not-allowed bg-gray-200'
            : 'text-primary-500 border-primary-600 hover:bg-blue-100'
          }`}
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <FaArrowRight />
      </button>


    </div>
  );
};

export default CustomPagination;