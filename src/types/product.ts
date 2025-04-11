
export interface Product {
  id: string; //generate UUID when save
  name: string;
  productCode?: string;
  category: string;
  subcategory: string;
  keywords: string[];
  barcode?: string;
  imageUrl?: string;
  description?: string;
    createdDate?: Date;
  createdBy?: string;
  modifiedDate?: Date;
  modifiedBy?: string;
}


