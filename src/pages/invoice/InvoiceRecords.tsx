
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Notifications } from "@/utils/notifications";
import { invoiceService } from "@/services/InvoiceService";
import { Invoice } from "@/types/invoce";

// Import components
import InvoiceHeader from "./components/InvoiceHeader";
import InvoiceFilters from "./components/InvoiceFilters";
import InvoiceTable from "./components/InvoiceTable";
import InvoiceDetailDialog from "./components/InvoiceDetailDialog";
import InvoicePagination from "./components/InvoicePagination";

// Import hooks
import { useInvoiceFilters } from "./hooks/useInvoiceFilters";
import { useInvoicePagination } from "./hooks/useInvoicePagination";
import { useInvoiceActions } from "./hooks/useInvoiceActions";

const InvoiceRecords = () => {
  // State for invoices data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize custom hooks
  const fetchInvoices = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      if (forceRefresh) setIsRefreshing(true);
      
      const fetchedInvoices = await invoiceService.getInvoices(forceRefresh);
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      Notifications.error("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Use custom hooks
  const { 
    filteredInvoices, 
    filterStates, 
    resetFilters, 
    openFilters 
  } = useInvoiceFilters(invoices);
  
  const {
    currentPage,
    totalPages,
    pageSize,
    setPageSize,
    handlePageChange,
    paginatedInvoices
  } = useInvoicePagination(filteredInvoices);
  
  const {
    selectedInvoice,
    isDialogOpen,
    setIsDialogOpen,
    newStatus,
    setNewStatus,
    updatingStatus,
    viewInvoiceDetails,
    updateInvoiceStatus,
    printInvoice
  } = useInvoiceActions(() => fetchInvoices(true));

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <InvoiceHeader
        setCustomerNameFilter={filterStates.setCustomerNameFilter}
        customerNameFilter={filterStates.customerNameFilter}
        openFilters={openFilters}
        refreshInvoices={() => fetchInvoices(true)}
        isRefreshing={isRefreshing}
      />

      {/* Filters Dialog */}
      <InvoiceFilters
        {...filterStates}
        resetFilters={resetFilters}
      />

      {/* Invoice Table Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 pb-2">
          <CardTitle>Invoice Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No invoices found.</p>
              <Button 
                variant="link" 
                className="mt-2 text-green-600"
                onClick={() => window.location.href = "/invoice"}
              >
                Create your first invoice
              </Button>
            </div>
          ) : (
            <>
              <InvoiceTable
                invoices={paginatedInvoices}
                viewInvoiceDetails={viewInvoiceDetails}
                printInvoice={printInvoice}
              />
              
              {filteredInvoices.length > 0 && (
                <InvoicePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  handlePageChange={handlePageChange}
                  itemCount={filteredInvoices.length}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <InvoiceDetailDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        selectedInvoice={selectedInvoice}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        updatingStatus={updatingStatus}
        updateInvoiceStatus={updateInvoiceStatus}
        printInvoice={printInvoice}
      />
    </div>
  );
};

export default InvoiceRecords;
