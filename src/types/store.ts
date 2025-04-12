export interface Store {
    id: string; //generate UUID when save
    costPrice: number;
    sellingPrice: number;
    location: { id: string; name: string; code: string };
    discount?: number;
    grnNumber?: string;
    product: {
        id: string;
        name: string;
        productCode: string;
        imageUrl: string;
        barcode: string;
        category: string,
        subcategory: string
    };
    qty: StockQuantity;
    createdDate?: Date;
    createdBy?: string;
    modifiedDate?: Date;
    modifiedBy?: string;
}

export interface StockQuantity {
    totalQty: number; // received from the supplier
    availableQty: number; //after sale available
}
