
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Download, Save, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomerInfo } from "@/components/invoice/CustomerInfo";
import { BarcodeScanner } from "@/components/invoice/BarcodeScanner";
import { InvoiceItems } from "@/components/invoice/InvoiceItems";
import { InvoiceSummary } from "@/components/invoice/InvoiceSummary";
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
  invoiceNumber: string;
  invoiceDate: Date;
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
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const isMobile = useIsMobile();

  // Generate invoice number on component mount
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const prefix = "INV";
      const date = new Date();
      const timestamp = date.getTime().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${prefix}-${timestamp}-${random}`;
    };
    
    setInvoiceNumber(generateInvoiceNumber());
  }, []);

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
    if (!customerName || items.length === 0 || !invoiceNumber || !invoiceDate) {
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
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
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

      // Reset form for a new invoice
      setCustomerName("");
      setItems([]);
      // Generate a new invoice number
      const prefix = "INV";
      const date = new Date();
      const timestamp = date.getTime().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setInvoiceNumber(`${prefix}-${timestamp}-${random}`);
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
  
  const tax = subtotal * 0.1;
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
      pdf.save(`invoice-${invoiceNumber}.pdf`);

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
            className="flex-1 sm:flex-initial h-10 px-4"
          >
            <Printer className="mr-2 h-5 w-5" />
            Print
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial h-10 px-4"
          >
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </Button>
          <Button 
            onClick={handleSaveInvoice} 
            disabled={isSaving}
            className="flex-1 sm:flex-initial h-10 px-4 bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </div>

      <div ref={invoiceRef} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="p-4">
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <CustomerInfo
                  customerName={customerName}
                  onNameChange={setCustomerName}
                />
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="invoiceNumber" className="text-base">Invoice Number</Label>
                  <Input 
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Enter invoice number"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="invoiceDate" className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Invoice Date
                  </Label>
                  <Input 
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>

            <BarcodeScanner
              value={barcodeInput}
              onChange={setBarcodeInput}
              onSubmit={handleBarcodeSubmit}
            />

            <InvoiceItems
              items={items}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAdjustQuantity={adjustQuantity}
              onAddItem={addItem}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <InvoiceSummary
              subtotal={subtotal}
              tax={tax}
              total={total}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoice;
