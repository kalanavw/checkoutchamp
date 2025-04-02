import React from 'react';
import {Package} from "lucide-react";
import {Product} from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-lg font-medium text-green-800 dark:text-green-300">Product Details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Description</h3>
          <p className="text-green-800 dark:text-green-200">{product.description || "No description available"}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-green-700 dark:text-green-400">SKU</h3>
              <p className="text-green-800 dark:text-green-200">{product.productCode || "Not available"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Barcode</h3>
            <p className="text-green-800 dark:text-green-200">{product.barcode || "Not available"}</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <p className="text-green-800/70 dark:text-green-300/70">No specifications available</p>

        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
