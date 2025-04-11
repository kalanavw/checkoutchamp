
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Printer } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Invoice } from "@/types/invoce";
import { formatSafeDate } from "../utils/dateUtils";

interface InvoiceDetailDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedInvoice: Invoice | null;
  newStatus: string;
  setNewStatus: (status: string) => void;
  updatingStatus: boolean;
  updateInvoiceStatus: () => Promise<void>;
  printInvoice: (id: string) => void;
}

const InvoiceDetailDialog: React.FC<InvoiceDetailDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedInvoice,
  newStatus,
  setNewStatus,
  updatingStatus,
  updateInvoiceStatus,
  printInvoice
}) => {
  if (!selectedInvoice) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              {formatSafeDate(selectedInvoice.invoiceDate, 'MMMM dd, yyyy')}
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>
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
  );
};

export default InvoiceDetailDialog;
