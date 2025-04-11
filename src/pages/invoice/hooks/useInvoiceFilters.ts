
import { useState, useEffect } from 'react';
import { Invoice } from '@/types/invoce';

export const useInvoiceFilters = (invoices: Invoice[]) => {
  // Filter states
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("");
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Apply filters whenever filter criteria or invoice list changes
  useEffect(() => {
    applyFilters();
  }, [invoices, invoiceNumberFilter, customerNameFilter, statusFilter, startDateFilter, endDateFilter]);
  
  const applyFilters = () => {
    let filtered = [...invoices];
    
    // Filter by invoice number - case insensitive
    if (invoiceNumberFilter) {
      const lowerCaseFilter = invoiceNumberFilter.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(lowerCaseFilter)
      );
    }
    
    // Filter by customer name - case insensitive
    if (customerNameFilter) {
      const lowerCaseFilter = customerNameFilter.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.customerName.toLowerCase().includes(lowerCaseFilter)
      );
    }
    
    // Filter by status - case insensitive
    if (statusFilter !== "all") {
      const lowerCaseStatus = statusFilter.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.status.toLowerCase() === lowerCaseStatus
      );
    }
    
    // Filter by date range
    if (startDateFilter && endDateFilter) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = invoice.invoiceDate instanceof Date 
          ? invoice.invoiceDate 
          : new Date(invoice.invoiceDate);
        
        return invoiceDate >= startDateFilter && invoiceDate <= endDateFilter;
      });
    } else if (startDateFilter) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = invoice.invoiceDate instanceof Date 
          ? invoice.invoiceDate 
          : new Date(invoice.invoiceDate);
        
        return invoiceDate >= startDateFilter;
      });
    } else if (endDateFilter) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = invoice.invoiceDate instanceof Date 
          ? invoice.invoiceDate 
          : new Date(invoice.invoiceDate);
        
        return invoiceDate <= endDateFilter;
      });
    }
    
    setFilteredInvoices(filtered);
  };

  const resetFilters = () => {
    setInvoiceNumberFilter("");
    setCustomerNameFilter("");
    setStatusFilter("all");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setIsFilterOpen(false);
  };
  
  const openFilters = () => setIsFilterOpen(true);
  
  return {
    filteredInvoices,
    filterStates: {
      invoiceNumberFilter,
      setInvoiceNumberFilter,
      customerNameFilter,
      setCustomerNameFilter,
      statusFilter,
      setStatusFilter,
      startDateFilter,
      setStartDateFilter,
      endDateFilter,
      setEndDateFilter,
      isFilterOpen,
      setIsFilterOpen
    },
    resetFilters,
    openFilters
  };
};
