export interface Store {
    id: string; //generate UUID when save
    costPrice: number;
    sellingPrice: number;
    location: { id: string; name: string; code: string };
    discount?: number;
    grnNumber?: string;
    product: { id: string; name: string; productCode: string; imageUrl: string; barcode: string };
    qty: StockQuantity;
    createdAt?: Date;
    createdBy?: string;
    modifiedDate?: Date;
    modifiedBy?: string;
}

export interface StockQuantity {
    totalQty: number; // received from the supplier
    availableQty: number; //after sale available
}
