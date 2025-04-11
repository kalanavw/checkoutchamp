
import React from "react";
import { format, isValid } from "date-fns";
import { Calendar, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Invoice } from "@/types/invoce";
import { formatSafeDate } from "../utils/dateUtils";

interface InvoiceTableProps {
  invoices: Invoice[];
  viewInvoiceDetails: (invoice: Invoice) => void;
  printInvoice: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  viewInvoiceDetails,
  printInvoice
}) => {
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

  return (
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
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10">
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.customerName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  <span>
                    {formatSafeDate(invoice.invoiceDate, 'MMM dd, yyyy')}
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
  );
};

export default InvoiceTable;
