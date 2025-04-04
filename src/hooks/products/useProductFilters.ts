
import { useState, useEffect } from "react";
import { Product } from "@/types/product";

export const useProductFilters = (allProducts: Product[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Apply filters to all products
  useEffect(() => {
    let filtered = [...allProducts];
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Apply subcategory filter
    if (subcategoryFilter !== "all") {
      filtered = filtered.filter(product => product.subcategory === subcategoryFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const searchTermLower = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        // Check product name
        if (product.name.toLowerCase().includes(searchTermLower)) return true;
        
        // Check product code
        if (product.productCode && product.productCode.toLowerCase().includes(searchTermLower)) return true;
        
        // Check barcode
        if (product.barcode && product.barcode.toLowerCase().includes(searchTermLower)) return true;
        
        // Check category
        if (product.category.toLowerCase().includes(searchTermLower)) return true;
        
        // Check subcategory
        if (product.subcategory.toLowerCase().includes(searchTermLower)) return true;
        
        // Check keywords
        if (product.keywords && product.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTermLower))) return true;
        
        return false;
      });
    }
    
    // Set total count
    setTotalProducts(filtered.length);
    setFilteredProducts(filtered);
  }, [allProducts, categoryFilter, subcategoryFilter, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };
  
  const handleSubcategoryChange = (value: string) => {
    setSubcategoryFilter(value);
  };

  return {
    searchQuery,
    categoryFilter,
    subcategoryFilter,
    filteredProducts,
    totalProducts,
    handleSearch,
    handleCategoryChange,
    handleSubcategoryChange,
  };
};
