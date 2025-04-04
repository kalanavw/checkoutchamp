
import { useState, useEffect } from "react";
import { Product } from "@/types/product";

export const PAGE_SIZE = 10;

export const useProductPagination = (filteredProducts: Product[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

  // Apply pagination
  useEffect(() => {
    // Reset to page 1 when filtered products change
    if (currentPage !== 1 && filteredProducts.length > 0) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    
    // Set products for current page
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    currentPage,
    paginatedProducts,
    pageSize: PAGE_SIZE,
    handlePageChange,
  };
};
