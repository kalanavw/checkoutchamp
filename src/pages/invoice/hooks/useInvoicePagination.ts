
import { useState, useEffect } from 'react';
import { Invoice } from '@/types/invoce';

export const useInvoicePagination = (filteredInvoices: Invoice[]) => {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  
  // Update total pages when filtered invoices change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredInvoices.length / pageSize));
    // Reset to first page when filters change or page size changes
    setCurrentPage(1);
  }, [filteredInvoices, pageSize]);
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  // Get current page of invoices
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  return {
    currentPage,
    totalPages,
    pageSize,
    setPageSize,
    handlePageChange,
    paginatedInvoices
  };
};
