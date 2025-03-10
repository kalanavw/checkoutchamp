import {Product} from "@/types/product.ts";
import {Warehouse} from "@/types/warehouse.ts";

export interface Store {
    id: string; //generate UUID when save
    costPrice: number;
    sellingPrice: number;
    location: Warehouse;
    discount?: number;
    grnNumber?: string;
    product: Product;
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
