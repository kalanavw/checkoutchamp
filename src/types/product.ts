
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  location: "loc-1" | "loc-2";
  barcode?: string;
}
