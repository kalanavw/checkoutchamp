
export interface Invoice {
    id: string; // Changed from optional to required
    invoiceNumber: string; //generate invoice number ex - INV-{ddMMyy)-0001, increment from last generated number, none editable lable
    invoiceDate: Date; //show the date in the form, none editable lable
    customerName: string; // searchable dropdown from customer collection, if user not available add + button to save
    products: InvoiceItem[]; // can be able to search by name, id or barcode from the store collection and add the item to table
    subTotal: number;
    tax: number;
    shippingFees:number;
    total: number;
    paymentType: string; // cash, card, cheque
    //if paymentType cash,
    amountPaid: number,
    balance: number
    status: string; // Pending, Paid, Overdue, Canceled
    createdAt?: Date;
    createdBy?: string;
    modifiedDate?: Date;
    modifiedBy?: string;
}


export interface InvoiceItem {
    id?: string; //generate UUID when save
    product: InvoiceProduct;
    quantity: number;
    costPrice: number;
    sellingPrice: number; // should be editable in the item table
    discount: number;
    subTotal: number; //before tax
    storeId: string;
}

export interface InvoiceProduct {
    id: string; // selected product id from store
    name: string // selected product name from store
}
