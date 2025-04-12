import React from 'react';
import {CalendarClock, Package, Tag, User} from "lucide-react";
import {Product} from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  // Format dates if they exist and are valid
  const formatDate = (dateValue: Date | string | undefined) => {
    if (!dateValue) return "Not available";
    
    // If dateValue is a string (from Firebase), convert it to a Date object
    //const date = dateValue instanceof Date ? dateValue : parseISO(dateValue as string);
    
    // Check if the date is valid before formatting
    return ''
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-lg font-medium text-green-800 dark:text-green-300">Product Details</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {product.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="max-h-64 object-contain rounded-md border border-green-200 dark:border-green-800 shadow-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Description</h3>
              <p className="text-green-800 dark:text-green-200 mt-1">{product.description || "No description available"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Categories</h3>
              <div className="mt-1">
                <span className="inline-block bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full px-3 py-1 text-sm mr-2">
                  {product.category}
                </span>
                {product.subcategory && (
                  <span className="inline-block bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full px-3 py-1 text-sm">
                    {product.subcategory}
                  </span>
                )}
              </div>
            </div>

            {product.keywords && product.keywords.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Keywords
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.keywords.map((keyword, idx) => (
                    <span 
                      key={idx} 
                      className="inline-block bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-300 rounded-full px-2 py-0.5 text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Product Code</h3>
              <p className="text-green-800 dark:text-green-200 mt-1">{product.productCode || "Not available"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Barcode</h3>
              <p className="text-green-800 dark:text-green-200 mt-1">{product.barcode || "Not available"}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" /> Created
                </h3>
                <div className="text-green-800/70 dark:text-green-200/70 text-sm mt-1">
                  <div>{formatDate(product.createdDate)}</div>
                  {product.createdBy && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <User className="h-3 w-3" />
                      <span>{product.createdBy}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" /> Modified
                </h3>
                <div className="text-green-800/70 dark:text-green-200/70 text-sm mt-1">
                  <div>{formatDate(product.modifiedDate)}</div>
                  {product.modifiedBy && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <User className="h-3 w-3" />
                      <span>{product.modifiedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
