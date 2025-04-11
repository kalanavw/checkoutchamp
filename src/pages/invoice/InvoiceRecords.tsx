
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Printer,
  RefreshCcw,
  Search,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Notifications } from "@/utils/notifications";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { DatePicker } from "@/components/ui/date-picker";
import { invoiceService } from "@/services/InvoiceService";
import { Invoice, InvoiceItem } from "@/types/invoce";

const InvoiceRecords = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("");
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(""); 

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, invoiceNumberFilter, customerNameFilter, statusFilter, startDateFilter, endDateFilter]);

  const fetchInvoices = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      if (forceRefresh) setIsRefreshing(true);
      
      const fetchedInvoices = await invoiceService.getInvoices(forceRefresh);
      setInvoices(fetchedInvoices);
      
      // Set initially filtered invoices
      setFilteredInvoices(fetchedInvoices);
      
      // Calculate total pages
      setTotalPages(Math.ceil(fetchedInvoices.length / pageSize));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      Notifications.error("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];
    
    // Filter by invoice number
    if (invoiceNumberFilter) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(invoiceNumberFilter.toLowerCase())
      );
    }
    
    // Filter by customer name
    if (customerNameFilter) {
      filtered = filtered.filter(invoice => 
        invoice.customerName.toLowerCase().includes(customerNameFilter.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
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
    setTotalPages(Math.ceil(filtered.length / pageSize));
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setInvoiceNumberFilter("");
    setCustomerNameFilter("");
    setStatusFilter("all");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setIsFilterOpen(false);
  };

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status);
    setIsDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const printInvoice = (invoiceId: string) => {
    Notifications.info("Preparing invoice for printing...");
    // Placeholder for print functionality
    // In a real app, this would navigate to a printable version or use a print service
  };

  const getStatusBadgeVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (status.toLowerCase()) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      case "canceled":
        return "outline";
      default:
        return "outline";
    }
  };

  const updateInvoiceStatus = async () => {
    if (!selectedInvoice || !newStatus || newStatus === selectedInvoice.status) return;
    
    try {
      setUpdatingStatus(true);
      const success = await invoiceService.updateInvoiceStatus(selectedInvoice.id, newStatus);
      
      if (success) {
        Notifications.success(`Invoice status updated to ${newStatus}`);
        
        // Update the local state
        setInvoices(prev => 
          prev.map(inv => 
            inv.id === selectedInvoice.id 
              ? {...inv, status: newStatus, modifiedDate: new Date()} 
              : inv
          )
        );
        
        setSelectedInvoice(prev => prev ? {...prev, status: newStatus} : null);
      } else {
        Notifications.error("Failed to update invoice status");
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      Notifications.error("An error occurred while updating the status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Calculate range of pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add pagination items
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            href="#"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
            </>
          )}
          
          {pages}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(totalPages);
                  }}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-semibold text-green-800 dark:text-green-300">Invoice Records</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search invoices..."
              className="pl-10 min-w-[200px]"
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => fetchInvoices(true)}
            disabled={isRefreshing}
            className="flex items-center"
          >
            <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => navigate("/invoice")}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Filter Popover */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Invoices</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="invoice-number" className="text-sm font-medium">Invoice Number</label>
                <Input
                  id="invoice-number"
                  placeholder="Enter invoice number..."
                  value={invoiceNumberFilter}
                  onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="customer-name" className="text-sm font-medium">Customer Name</label>
                <Input
                  id="customer-name"
                  placeholder="Enter customer name..."
                  value={customerNameFilter}
                  onChange={(e) => setCustomerNameFilter(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status-filter" className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
                  <DatePicker 
                    selected={startDateFilter} 
                    onSelect={setStartDateFilter} 
                    placeholder="From" 
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
                  <DatePicker 
                    selected={endDateFilter} 
                    onSelect={setEndDateFilter} 
                    placeholder="To" 
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
              <Button onClick={() => setIsFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                onClick={() => navigate("/invoice")}
              >
                Create your first invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span>
                            {invoice.invoiceDate instanceof Date 
                              ? format(invoice.invoiceDate, 'MMM dd, yyyy') 
                              : format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${invoice.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => viewInvoiceDetails(invoice)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => printInvoice(invoice.id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredInvoices.length > 0 && renderPagination()}
          
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredInvoices.length)} to {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Items per page:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="50" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      {selectedInvoice && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Invoice #{selectedInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-semibold mb-1">Customer</h3>
                <p>{selectedInvoice.customerName}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Date</h3>
                <p>
                  {selectedInvoice.invoiceDate instanceof Date 
                    ? format(selectedInvoice.invoiceDate, 'MMMM dd, yyyy') 
                    : format(new Date(selectedInvoice.invoiceDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.products.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.sellingPrice.toFixed(2)}</TableCell>
                      <TableCell>${item.discount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.subTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>${selectedInvoice.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>
                <span>${selectedInvoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Shipping Fees:</span>
                <span>${selectedInvoice.shippingFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-semibold text-lg">${selectedInvoice.total.toFixed(2)}</span>
              </div>
              
              {selectedInvoice.paymentType === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount Paid:</span>
                    <span>${selectedInvoice.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Balance:</span>
                    <span>${selectedInvoice.balance.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Payment Type:</span>
                <span>{selectedInvoice.paymentType}</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Select value={newStatus} onValueChange={setNewStatus} disabled={updatingStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={updateInvoiceStatus}
                  disabled={updatingStatus || newStatus === selectedInvoice.status}
                >
                  {updatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => printInvoice(selectedInvoice.id)}
                  className="flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InvoiceRecords;
