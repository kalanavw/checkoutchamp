
import React, {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Input} from '@/components/ui/input.tsx';
import {Label} from '@/components/ui/label.tsx';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import {Badge} from '@/components/ui/badge.tsx';
import AddCustomerDialog from '@/components/AddCustomerDialog.tsx';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CreditCard, DollarSign, FileCheck, FileText, Printer, Save, Search, Trash2} from 'lucide-react';
import {invoiceService} from '@/services/InvoiceService.ts';
import {customerService,} from '@/services/CustomerService.ts';
import {Notifications} from "@/utils/notifications.ts";
import {Invoice, InvoiceItem, InvoiceProduct} from "@/types/invoce.ts";
import {Customer} from "@/types/customer.ts";
import {Product} from "@/types/product.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {storeService} from "@/services/StoreService.ts";
import {Store} from "@/types/store.ts";
import {handleAfterDiscount} from "@/utils/Util.ts";

const CreateInvoice: React.FC = () => {
    // State to track invoice data
    const [invoiceDate] = useState<Date>(new Date());
    const [customerName, setCustomerName] = useState<string>('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [shippingFees, setShippingFees] = useState<number>(0);
    const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'cheque'>('cash');
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [status, setStatus] = useState<'pending' | 'paid' | 'overdue' | 'canceled' | 'draft'>('pending');

    // State for search functionality
    const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
    const [productSearchTerm, setProductSearchTerm] = useState<string>('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchedProducts, setSearchedProducts] = useState<Store[]>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);
    const [showProductDropdown, setShowProductDropdown] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const allCustomers = await customerService.getCustomers();
                setCustomers(allCustomers);
            } catch (error) {
                console.error("Failed to load initial data:", error);
                Notifications.error("Failed to load customer data")
            }
        };

        loadInitialData();
    }, []);

    // Search for customers
    useEffect(() => {
        const searchForCustomers = async () => {
            if (customerSearchTerm.length < 2) {
                setShowCustomerDropdown(false);
                return;
            }

            try {
                const results = await customerService.searchCustomers(customerSearchTerm);
                setCustomers(results);
                setShowCustomerDropdown(true);
            } catch (error) {
                console.error("Failed to search customers:", error);
            }
        };

        const timeoutId = setTimeout(searchForCustomers, 300);
        return () => clearTimeout(timeoutId);
    }, [customerSearchTerm]);

    // Search for products
    useEffect(() => {
        const searchForProducts = async () => {
            if (productSearchTerm.length < 2) {
                setShowProductDropdown(false);
                return;
            }
            try {
                const storeItems = await storeService.getStoreItems();
                // Enhanced filtering with case-insensitive search across multiple fields
                const results = storeItems.filter(item => {
                    const searchTermLower = productSearchTerm.toLowerCase();
                    
                    return (
                        // Product fields
                        item.product.name.toLowerCase().includes(searchTermLower) ||
                        item.product.productCode.toLowerCase().includes(searchTermLower) ||
                        (item.product.barcode && item.product.barcode.toLowerCase().includes(searchTermLower)) ||
                        item.product.category.toLowerCase().includes(searchTermLower) ||
                        item.product.subcategory.toLowerCase().includes(searchTermLower) ||
                        
                        // GRN number
                        (item.grnNumber && item.grnNumber.toLowerCase().includes(searchTermLower))
                    );
                });
                
                setSearchedProducts(results);
                setShowProductDropdown(true);
            } catch (error) {
                console.error("Failed to search products:", error);
            }
        };

        const timeoutId = setTimeout(searchForProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [productSearchTerm]);

    // Calculate totals
    const subTotal = useMemo(() => {
        return invoiceItems.reduce((sum, item) => sum + item.subTotal, 0);
    }, [invoiceItems]);

    const taxAmount = useMemo(() => {
        return invoiceItems.reduce((sum, item) => {
            const product = item.product as unknown as Product;
            // return sum + (item.subTotal * (product.taxRate || 0));
            return sum;
        }, 0);
    }, [invoiceItems]);

    const total = useMemo(() => {
        return subTotal + taxAmount + shippingFees;
    }, [subTotal, taxAmount, shippingFees]);

    const balance = useMemo(() => {
        return total - amountPaid;
    }, [total, amountPaid]);

    // Handle adding a product to the invoice
    const handleAddProduct = (store: Store) => {
        const invoiceProduct: InvoiceProduct = {
            id: store.product.id,
            name: store.product.name
        };

        const newItem: InvoiceItem = {
            id: uuidv4(),
            product: invoiceProduct,
            quantity: 1,
            costPrice: store.costPrice,
            sellingPrice: store.sellingPrice,
            discount: store.discount,
            subTotal: handleAfterDiscount(store),
            storeId: store.id
        };

        setInvoiceItems(prev => [...prev, newItem]);
        setProductSearchTerm('');
        setShowProductDropdown(false);
    };

    // Handle updating an item's quantity
    const handleUpdateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;

        setInvoiceItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const updatedSubTotal = (item.sellingPrice - item.discount) * quantity;
                    return {...item, quantity, subTotal: updatedSubTotal};
                }
                return item;
            })
        );
    };

    // Handle updating an item's selling price
    const handleUpdateSellingPrice = (id: string, sellingPrice: number) => {
        if (sellingPrice < 0) return;

        setInvoiceItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const updatedSubTotal = (sellingPrice - item.discount) * item.quantity;
                    return {...item, sellingPrice, subTotal: updatedSubTotal};
                }
                return item;
            })
        );
    };

    // Handle updating an item's discount
    const handleUpdateDiscount = (id: string, discount: number) => {
        if (discount < 0) return;

        setInvoiceItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    if (discount > item.sellingPrice) {
                        Notifications.warning("Discount cannot be greater than selling price")
                        return item;
                    }

                    const updatedSubTotal = (item.sellingPrice - discount) * item.quantity;
                    return {...item, discount, subTotal: updatedSubTotal};
                }
                return item;
            })
        );
    };

    // Handle removing an item from the invoice
    const handleRemoveItem = (id: string) => {
        setInvoiceItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // Handle choosing a customer
    const handleSelectCustomer = (customer: Customer) => {
        setCustomerName(customer.name);
        setShowCustomerDropdown(false);
        setCustomerSearchTerm('');
    };

    // Handle adding a new customer
    const handleCustomerAdded = (name: string) => {
        setCustomerName(name);
    };

    // Handle creating the invoice
    const handleCreateInvoice = async (isDraft: boolean = false) => {
        if (!customerName) {
            Notifications.warning("Please select a customer for this invoice")
            return;
        }

        if (invoiceItems.length === 0) {
            Notifications.error("Please add at least one product to the invoice");
            return;
        }

        // If payment type is cash and not a draft, and balance is not 0, make sure amount paid is valid
        if (!isDraft && paymentType === 'cash' && balance !== 0 && amountPaid <= 0) {
            Notifications.error("Please enter a valid amount paid");
            return;
        }

        try {
            setIsSubmitting(true);

            // Set status to draft if saving as draft
            const invoiceStatus = isDraft ? 'draft' : status;

            // Prepare invoice data
            const invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'invoiceDate'> = {
                customerName,
                products: invoiceItems,
                subTotal,
                tax: taxAmount,
                shippingFees,
                total,
                paymentType,
                amountPaid,
                balance,
                status: invoiceStatus
            };

            // Create the invoice
            const newInvoice = await invoiceService.createInvoice(invoiceData);

            Notifications.info(isDraft
                ? `Draft invoice has been saved successfully`
                : `Invoice ${newInvoice.invoiceNumber} has been created successfully`)
            // Reset form
            setCustomerName('');
            setInvoiceItems([]);
            setShippingFees(0);
            setPaymentType('cash');
            setAmountPaid(0);
            setStatus('pending');

        } catch (error) {
            console.error("Failed to create invoice:", error);
            Notifications.error(`Failed to ${isDraft ? 'save draft' : 'create invoice'}`)
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container px-4 py-6 mx-auto">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
                        <p className="text-muted-foreground">Create a new invoice for your customers</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleCreateInvoice(true)}
                            disabled={isSubmitting}
                            className="gap-1"
                        >
                            <FileCheck size={16}/>
                            <span>Save as Draft</span>
                        </Button>
                        <Button variant="outline" className="gap-1">
                            <Printer size={16}/>
                            <span className="hidden md:inline">Print Preview</span>
                        </Button>
                        <Button
                            onClick={() => handleCreateInvoice(false)}
                            disabled={isSubmitting}
                            className="gap-1"
                        >
                            <Save size={16}/>
                            <span>Save Invoice</span>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Invoice Header */}
                    <Card className="md:col-span-3">
                        <CardContent className="p-6">
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                                    <div id="invoiceDate" className="mt-1 p-2 bg-muted rounded text-sm">
                                        {formatDate(invoiceDate)}
                                    </div>
                                </div>

                                <div className="relative">
                                    <Label htmlFor="customerSearch">Customer</Label>
                                    <div className="mt-1 flex">
                                        {customerName ? (
                                            <div
                                                className="flex flex-1 items-center justify-between bg-muted p-2 rounded">
                                                <span>{customerName}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCustomerName('')}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    &times;
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative flex-1">
                                                    <Search
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                                    <Input
                                                        id="customerSearch"
                                                        placeholder="Search customer..."
                                                        className="pl-8 pr-4"
                                                        value={customerSearchTerm}
                                                        onChange={e => setCustomerSearchTerm(e.target.value)}
                                                        onFocus={() => {
                                                            if (customerSearchTerm.length >= 2) {
                                                                setShowCustomerDropdown(true);
                                                            }
                                                        }}
                                                    />
                                                    {showCustomerDropdown && (
                                                        <div
                                                            className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
                                                            {customers.length > 0 ? (
                                                                customers.map(customer => (
                                                                    <div
                                                                        key={customer.id}
                                                                        className="p-2 hover:bg-accent cursor-pointer"
                                                                        onClick={() => handleSelectCustomer(customer)}
                                                                    >
                                                                        <div
                                                                            className="font-medium">{customer.name}</div>
                                                                        <div
                                                                            className="text-xs text-muted-foreground">{customer.phone}</div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div
                                                                    className="p-2 text-center text-muted-foreground">No
                                                                    customers found</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <AddCustomerDialog onCustomerAdded={handleCustomerAdded}/>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={status} 
                                        onValueChange={(value) => setStatus(value as 'pending' | 'paid' | 'overdue' | 'canceled' | 'draft')}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                            <SelectItem value="canceled">Canceled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card className="md:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl">Invoice Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                                <Search
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                <Input
                                    placeholder="Search by product name, ID, barcode, category, subcategory or GRN..."
                                    className="pl-8 pr-4"
                                    value={productSearchTerm}
                                    onChange={e => setProductSearchTerm(e.target.value)}
                                    onFocus={() => {
                                        if (productSearchTerm.length >= 2) {
                                            setShowProductDropdown(true);
                                        }
                                    }}
                                />
                                {showProductDropdown && (
                                    <div
                                        className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
                                        {searchedProducts.length > 0 ? (
                                            searchedProducts.map(store => (
                                                <div
                                                    key={store.id}
                                                    className="p-2 hover:bg-accent cursor-pointer"
                                                    onClick={() => handleAddProduct(store)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium">{store.product?.name}</div>
                                                        <Badge
                                                            variant="outline">Rs:{store.sellingPrice.toFixed(2)}</Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex justify-between">
                                                        <span>Code: {store.product.productCode}</span>
                                                        <span>Stock: {store.qty.availableQty}</span>
                                                    </div>
                                                    {(store.product.category || store.product.subcategory) && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {store.product.category && `Category: ${store.product.category}`}
                                                            {store.product.category && store.product.subcategory && " | "}
                                                            {store.product.subcategory && `Subcategory: ${store.product.subcategory}`}
                                                        </div>
                                                    )}
                                                    {store.grnNumber && (
                                                        <div className="text-xs text-muted-foreground">
                                                            GRN: {store.grnNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-muted-foreground">No products
                                                found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="w-[100px] text-right">Qty</TableHead>
                                            <TableHead className="w-[120px] text-right">Price</TableHead>
                                            <TableHead className="w-[100px] text-right">Disc</TableHead>
                                            <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoiceItems.length > 0 ? (
                                            invoiceItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.product.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={e => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                                                            min={1}
                                                            className="w-16 p-1 h-8 text-right"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Input
                                                            type="number"
                                                            value={item.sellingPrice}
                                                            onChange={e => handleUpdateSellingPrice(item.id, parseFloat(e.target.value))}
                                                            min={0}
                                                            step={0.01}
                                                            className="w-20 p-1 h-8 text-right"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Input
                                                            type="number"
                                                            value={item.discount}
                                                            onChange={e => handleUpdateDiscount(item.id, parseFloat(e.target.value))}
                                                            min={0}
                                                            step={0.01}
                                                            className="w-16 p-1 h-8 text-right"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        Rs: {item.subTotal.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="h-8 w-8 p-0 text-destructive"
                                                        >
                                                            <Trash2 size={16}/>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6}
                                                           className="text-center py-4 text-muted-foreground">
                                                    No items added. Search for products above to add them to the
                                                    invoice.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl">Invoice Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>Rs: {subTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax:</span>
                                    <span>Rs: {taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Shipping:</span>
                                    <Input
                                        type="number"
                                        value={shippingFees}
                                        onChange={e => setShippingFees(parseFloat(e.target.value) || 0)}
                                        min={0}
                                        step={0.01}
                                        className="w-24 h-8 text-right"
                                    />
                                </div>
                            </div>

                            <Separator/>

                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total:</span>
                                <span>Rs: {total.toFixed(2)}</span>
                            </div>

                            <Separator/>

                            <div className="space-y-3">
                                <Label htmlFor="paymentType">Payment Method</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        type="button"
                                        variant={paymentType === 'cash' ? 'default' : 'outline'}
                                        className="flex flex-col items-center justify-center h-20 p-2"
                                        onClick={() => setPaymentType('cash')}
                                    >
                                        <DollarSign className="h-6 w-6 mb-1"/>
                                        <span className="text-xs font-medium">Cash</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={paymentType === 'card' ? 'default' : 'outline'}
                                        className="flex flex-col items-center justify-center h-20 p-2"
                                        onClick={() => setPaymentType('card')}
                                    >
                                        <CreditCard className="h-6 w-6 mb-1"/>
                                        <span className="text-xs font-medium">Card</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={paymentType === 'cheque' ? 'default' : 'outline'}
                                        className="flex flex-col items-center justify-center h-20 p-2"
                                        onClick={() => setPaymentType('cheque')}
                                    >
                                        <FileText className="h-6 w-6 mb-1"/>
                                        <span className="text-xs font-medium">Cheque</span>
                                    </Button>
                                </div>

                                {paymentType === 'cash' && (
                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="amountPaid">Amount Paid</Label>
                                            <Input
                                                id="amountPaid"
                                                type="number"
                                                value={amountPaid}
                                                onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                                                min={0}
                                                step={0.01}
                                            />
                                        </div>

                                        <div className="flex justify-between font-medium">
                                            <span>Balance:</span>
                                            <span
                                                className={balance < 0 ? 'text-green-600' : balance > 0 ? 'text-red-600' : ''}>
                        Rs: {balance.toFixed(2)}
                      </span>
                                        </div>

                                        {/* Quick amount buttons */}
                                        <div className="grid grid-cols-3 gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setAmountPaid(total)}
                                                className="text-xs h-8"
                                            >
                                                Exact
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setAmountPaid(Math.ceil(total / 10) * 10)}
                                                className="text-xs h-8"
                                            >
                                                Round ↑
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setAmountPaid(Math.ceil(total / 100) * 100)}
                                                className="text-xs h-8"
                                            >
                                                Next 100
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                            <Button
                                className="w-full gap-1"
                                onClick={() => handleCreateInvoice(false)}
                                disabled={isSubmitting}
                            >
                                <FileText size={16}/>
                                <span>{isSubmitting ? 'Creating...' : 'Create Invoice'}</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full gap-1"
                                onClick={() => handleCreateInvoice(true)}
                                disabled={isSubmitting}
                            >
                                <FileCheck size={16}/>
                                <span>{isSubmitting ? 'Saving...' : 'Save as Draft'}</span>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoice;
