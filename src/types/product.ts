
export interface Product {
  id: string;
  name: string;
  productCode?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
  subcategory: string;
  location: string;
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

export interface Location {
  id: string;
  name: string;
  code: string;
  description?: string;
}
