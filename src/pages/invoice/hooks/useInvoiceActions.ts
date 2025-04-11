
import { useState } from 'react';
import { invoiceService } from '@/services/InvoiceService';
import { Invoice } from '@/types/invoce';
import { Notifications } from '@/utils/notifications';

export const useInvoiceActions = (refreshInvoices: () => Promise<void>) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status);
    setIsDialogOpen(true);
  };
  
  const updateInvoiceStatus = async () => {
    if (!selectedInvoice || !newStatus || newStatus === selectedInvoice.status) return;
    
    try {
      setUpdatingStatus(true);
      const success = await invoiceService.updateInvoiceStatus(selectedInvoice.id, newStatus);
      
      if (success) {
        Notifications.success(`Invoice status updated to ${newStatus}`);
        await refreshInvoices();
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
  
  const printInvoice = (invoiceId: string) => {
    Notifications.info("Preparing invoice for printing...");
    // Placeholder for print functionality
    // In a real app, this would navigate to a printable version or use a print service
  };
  
  return {
    selectedInvoice,
    isDialogOpen,
    setIsDialogOpen,
    newStatus,
    setNewStatus,
    updatingStatus,
    viewInvoiceDetails,
    updateInvoiceStatus,
    printInvoice
  };
};
