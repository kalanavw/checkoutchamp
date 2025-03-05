
import { useState } from "react";
import { Product } from "@/types/product";
import { ProductsTable } from "@/components/products/ProductsTable";
import { Button } from "@/components/ui/button";

interface ProductsListProps {
  products: Product[];
  loading: boolean;
  onLoadMore: () => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  hasMore: boolean;
}

export const ProductsList = ({ 
  products, 
  loading, 
  onLoadMore, 
  onDelete, 
  onView,
  hasMore
}: ProductsListProps) => {
  return (
    <div className="space-y-4">
      <ProductsTable 
        products={products} 
        loading={loading} 
        onDelete={onDelete} 
        onView={onView}
      />

      {products.length > 0 && hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="border-primary/30 hover:bg-primary/10"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};
