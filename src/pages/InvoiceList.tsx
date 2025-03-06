
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Updated import path
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, Search } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
}

const InvoiceList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const invoicesQuery = query(
        collection(db, "invoices"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(invoicesQuery);
      
      const fetchedInvoices: Invoice[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Ensure we handle dates properly
        const createdAt = data.createdAt?.toDate() || new Date();
        const invoiceDate = data.invoiceDate?.toDate() || new Date();
        
        fetchedInvoices.push({
          id: doc.id,
          customerName: data.customerName || 'Unknown Customer',
          invoiceNumber: data.invoiceNumber || `INV-${doc.id.substring(0, 6)}`,
          invoiceDate,
          items: data.items || [],
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          total: data.total || 0,
          createdAt
        });
      });
      
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-semibold text-green-800 dark:text-green-300">Invoices</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search invoices..."
              className="pl-10 min-w-[250px]"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button 
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => navigate("/invoice")}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 pb-2">
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : invoices.length === 0 ? (
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
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span>{format(invoice.invoiceDate, 'MMM dd, yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoice.items.length} items</Badge>
                      </TableCell>
                      <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewInvoiceDetails(invoice)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInvoice && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Invoice Details #{selectedInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-semibold mb-1">Customer</h3>
                <p>{selectedInvoice.customerName}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Date</h3>
                <p>{format(selectedInvoice.invoiceDate, 'MMMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>${selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>
                <span>${selectedInvoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-semibold text-lg">${selectedInvoice.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button>Print Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InvoiceList;
