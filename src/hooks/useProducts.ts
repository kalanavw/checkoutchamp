
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { productService } from "@/services/ProductService";
import { useProductFilters } from "./products/useProductFilters";
import { useProductPagination, PAGE_SIZE } from "./products/useProductPagination";
import { useProductMetadata } from "./products/useProductMetadata";
import { useProductOperations } from "./products/useProductOperations";

export const useProducts = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  
  // Use the smaller, focused hooks
  const { 
    categories, 
    subcategories, 
    loading: metadataLoading 
  } = useProductMetadata(forceRefresh);
  
  const {
    searchQuery,
    categoryFilter,
    subcategoryFilter,
    filteredProducts,
    totalProducts,
    handleSearch,
    handleCategoryChange,
    handleSubcategoryChange,
  } = useProductFilters(allProducts);
  
  const {
    currentPage,
    paginatedProducts: products,
    pageSize,
    handlePageChange,
  } = useProductPagination(filteredProducts);
  
  const {
    loading: operationsLoading,
    deleteProduct,
    refreshProducts,
  } = useProductOperations(setAllProducts);

  // Loading state combines all loading states
  const loading = metadataLoading || operationsLoading;

  // Load all products first
  useEffect(() => {
    fetchAllProducts();
  }, [refreshKey, forceRefresh]);

  // Fetch all products from ProductService
  const fetchAllProducts = async () => {
    try {
      const allProductsData = await productService.getAllProducts();
      setAllProducts(allProductsData);
    } catch (error) {
      console.error("Error fetching all products:", error);
    } finally {
      setForceRefresh(false);
    }
  };

  const handleRefresh = () => {
    setForceRefresh(true);
    refreshProducts();
  };

  return {
    products,
    loading,
    searchQuery,
    categoryFilter,
    subcategoryFilter,
    categories,
    subcategories,
    totalProducts,
    currentPage,
    pageSize,
    handleSearch,
    handleCategoryChange,
    handleSubcategoryChange,
    handleRefresh,
    deleteProduct,
    handlePageChange,
  };
};
