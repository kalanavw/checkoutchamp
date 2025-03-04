
export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
  subcategory: string;
  location: "loc-1" | "loc-2";
  keywords: string[];
  discount?: number;
  grnNumber?: string;
  barcode?: string;
  imageUrl?: string;
  description?: string;
  sku?: string;
  specifications?: Record<string, string>;
  createdAt?: Date;
  createdBy?: string;
  modifiedDate?: Date;
  modifiedBy?: string;
}
