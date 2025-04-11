
import React from "react";
import { useNavigate } from "react-router-dom";
import { Filter, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InvoiceHeaderProps {
  setCustomerNameFilter: (value: string) => void;
  customerNameFilter: string;
  openFilters: () => void;
  refreshInvoices: () => void;
  isRefreshing: boolean;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  setCustomerNameFilter,
  customerNameFilter,
  openFilters,
  refreshInvoices,
  isRefreshing
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-3xl font-semibold text-green-800 dark:text-green-300">Invoice Records</h1>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={openFilters}
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
          onClick={refreshInvoices}
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
  );
};

export default InvoiceHeader;
