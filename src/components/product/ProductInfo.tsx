
import React from 'react';
import { Package } from "lucide-react";
import { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

// Export this as default rather than a named export
const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-muted-foreground" />
        <span className="text-lg font-medium">Product Details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
          <p>{product.description || "No description available"}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
            <p>{product.sku || "Not available"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Barcode</h3>
            <p>{product.barcode || "Not available"}</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {product.specifications ? (
            Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="border p-3 rounded-md">
                <h4 className="text-xs text-muted-foreground">{key}</h4>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))
          ) : (
            <p>No specifications available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
