
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, where, doc, deleteDoc } from "firebase/firestore";
import { FileText, Search, RefreshCw, Printer, Download, MoreHorizontal, FileBarChart, Trash2, Eye } from "lucide-react";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  discount?: number;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchInvoices = async (searchTerm = "", reset = false) => {
    setIsRefreshing(true);
    setLoading(true);
    
    try {
      let invoicesQuery;
      
      if (searchTerm) {
        // Search query
        invoicesQuery = query(
          collection(db, "invoices"),
          where("customerName", ">=", searchTerm),
          where("customerName", "<=", searchTerm + '\uf8ff'),
          orderBy("customerName"),
          orderBy("createdAt", "desc"),
          limit(itemsPerPage)
        );
      } else if (lastVisible && !reset) {
        // Pagination query
        invoicesQuery = query(
          collection(db, "invoices"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(itemsPerPage)
        );
      } else {
        // Initial query
        invoicesQuery = query(
          collection(db, "invoices"),
          orderBy("createdAt", "desc"),
          limit(itemsPerPage)
        );
      }
      
      const snapshot = await getDocs(invoicesQuery);
      
      const fetchedInvoices: Invoice[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedInvoices.push({
          id: doc.id,
          customerName: data.customerName,
          invoiceNumber: data.invoiceNumber,
          invoiceDate: data.invoiceDate?.toDate() || new Date(),
          items: data.items || [],
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          total: data.total || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      
      if (reset || searchTerm) {
        setInvoices(fetchedInvoices);
        setCurrentPage(1);
      } else {
        setInvoices(prev => [...prev, ...fetchedInvoices]);
        setCurrentPage(prev => prev + 1);
      }
      
      // Set the last document for pagination
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setLastVisible(null);
      }
      
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices("", true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices(searchQuery, true);
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    
    try {
      await deleteDoc(doc(db, "invoices", selectedInvoice.id));
      
      setInvoices(invoices.filter(invoice => invoice.id !== selectedInvoice.id));
      
      toast({
        title: "Invoice Deleted",
        description: "The invoice has been deleted successfully.",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete the invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailDialogOpen(true);
  };

  const confirmDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-6 w-6" />
          <h1 className="text-2xl md:text-3xl font-semibold">Invoices</h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => fetchInvoices("", true)}
            disabled={isRefreshing}
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => navigate("/invoice")}
            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-lg pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="text-green-800 dark:text-green-300">Invoice List</CardTitle>
            <form onSubmit={handleSearch} className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search by customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-16"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2"
              >
                Search
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-green-50 dark:bg-green-900/10">
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
                {loading && invoices.length === 0 ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6} className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800"></TableCell>
                    </TableRow>
                  ))
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <p>No invoices found</p>
                        <Button 
                          variant="link" 
                          onClick={() => navigate("/invoice")} 
                          className="mt-2 text-green-600"
                        >
                          Create your first invoice
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10">
                      <TableCell>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-medium"
                          onClick={() => viewInvoiceDetails(invoice)}
                        >
                          {invoice.invoiceNumber}
                        </Button>
                      </TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoice.items.length} items</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewInvoiceDetails(invoice)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => confirmDeleteInvoice(invoice)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => fetchInvoices("", true)}
                  disabled={currentPage === 1 || loading}
                >
                  <PaginationPrevious className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{currentPage}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => fetchInvoices()}
                  disabled={!lastVisible || loading}
                >
                  <PaginationNext className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
      
      {/* Invoice Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Invoice #{selectedInvoice?.invoiceNumber} • {selectedInvoice && formatDate(selectedInvoice.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
                  <p className="text-lg font-semibold">{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Invoice Date</h3>
                  <p className="text-lg font-semibold">{formatDate(selectedInvoice.invoiceDate)}</p>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-800">
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => {
                      const itemTotal = item.quantity * item.price;
                      const discountAmount = itemTotal * ((item.discount || 0) / 100);
                      const finalTotal = itemTotal - discountAmount;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right">{item.discount || 0}%</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(finalTotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice #{selectedInvoice?.invoiceNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInvoice}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceList;
