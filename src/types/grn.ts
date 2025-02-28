
export interface GRNItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
}

export interface GRN {
  id: string;
  grnNumber: string;
  supplierName: string;
  receivedDate: Date;
  items: GRNItem[];
  createdBy: string;
  notes?: string;
}
