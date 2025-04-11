
import React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface InvoiceFiltersProps {
  invoiceNumberFilter: string;
  setInvoiceNumberFilter: (value: string) => void;
  customerNameFilter: string;
  setCustomerNameFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  startDateFilter: Date | undefined;
  setStartDateFilter: (date: Date | undefined) => void;
  endDateFilter: Date | undefined;
  setEndDateFilter: (date: Date | undefined) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  resetFilters: () => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
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
  setIsFilterOpen,
  resetFilters
}) => {
  return (
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
  );
};

export default InvoiceFilters;
