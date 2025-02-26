import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileText, Plus, Printer, Download, Trash2, Save, Barcode, Minus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface InvoiceData {
  customerName: string;
  customerEmail: string;
  items: Omit<InvoiceItem, 'id'>[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
}

const Invoice = () => {
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const isMobile = useIsMobile();

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now(),
      description: "",
      quantity: 1,
      price: 0,
      discount: 0,
    };
    setItems([...items, newItem]);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would query your product database
    // For now, we'll just add a placeholder item
    if (barcodeInput.trim()) {
      const newItem: InvoiceItem = {
        id: Date.now(),
        description: `Item (Barcode: ${barcodeInput})`,
        quantity: 1,
        price: 0,
        discount: 0,
      };
      setItems([...items, newItem]);
      setBarcodeInput("");
      toast({
        title: "Item Added",
        description: "Product has been added to the invoice.",
      });
    }
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const adjustQuantity = (id: number, increment: boolean) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + (increment ? 1 : -1)) }
        : item
    ));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSaveInvoice = async () => {
    if (!customerName || !customerEmail || items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one item.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const invoiceData: InvoiceData = {
        customerName,
        customerEmail,
        items: items.map(({ id, ...item }) => item),
        subtotal,
        tax,
        total,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "invoices"), invoiceData);

      toast({
        title: "Success",
        description: "Invoice saved successfully!",
      });

      setCustomerName("");
      setCustomerEmail("");
      setItems([]);
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price;
    const discountAmount = itemTotal * ((item.discount || 0) / 100);
    return sum + (itemTotal - discountAmount);
  }, 0);
  
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
    toast({
      title: "Printing invoice",
      description: "The invoice has been sent to your printer.",
    });
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your invoice...",
      });

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`invoice-${Date.now()}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Your invoice has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl md:text-3xl font-semibold">Create Invoice</h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex-1 sm:flex-initial h-12 px-6"
          >
            <Printer className="mr-2 h-5 w-5" />
            Print
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial h-12 px-6"
          >
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </Button>
          <Button 
            onClick={handleSaveInvoice} 
            disabled={isSaving}
            className="flex-1 sm:flex-initial h-12 px-6 bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </div>

      <div ref={invoiceRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-6">
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Customer Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="customerName" className="text-base">Customer Name</Label>
                <Input 
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="customerEmail" className="text-base">Customer Email</Label>
                <Input 
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter customer email"
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* Barcode Scanner Section */}
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or enter product code"
                  className="pl-12 h-12"
                />
              </div>
              <Button type="submit" className="h-12">Add Item</Button>
            </form>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount (%)</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const itemTotal = item.quantity * item.price;
                    const discountAmount = itemTotal * ((item.discount || 0) / 100);
                    const finalTotal = itemTotal - discountAmount;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="min-w-[200px]">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                            className="h-12 text-base"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => adjustQuantity(item.id, false)}
                              className="h-8 w-8"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                              className="w-20 h-12 text-base text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => adjustQuantity(item.id, true)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                            className="w-28 h-12 text-base"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount || 0}
                            onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value))}
                            className="w-20 h-12 text-base"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-base">
                          ${finalTotal.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="h-12 w-12"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <Button 
                variant="outline" 
                onClick={addItem} 
                className="mt-6 h-12 px-6"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-6">
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex justify-between text-base">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoice;
