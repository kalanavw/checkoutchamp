
import {useCallback, useEffect, useState} from "react";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import {Product} from "@/types/product";
import {db, PRODUCT_COLLECTION} from "@/lib/firebase";
import {clearCache, getFromCache, saveToCache} from "@/utils/cacheUtils";
import {Notifications} from "@/utils/notifications";
import {
  COLLECTION_KEYS,
  saveCollectionFetchTime,
  saveCollectionUpdateTime,
  shouldFetchCollection,
} from "@/utils/collectionUtils";
import {productService} from "@/services/ProductService";

const PRODUCTS_CACHE_KEY = "products_cache";
const PRODUCTS_CATEGORIES_CACHE_KEY = `${PRODUCTS_CACHE_KEY}_categories`;
const PRODUCTS_SUBCATEGORIES_CACHE_KEY = `${PRODUCTS_CACHE_KEY}_subcategories`;
const PAGE_SIZE = 10;

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Load categories and subcategories
  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, [refreshKey, forceRefresh]);

  // Load all products first
  useEffect(() => {
    fetchAllProducts();
  }, [refreshKey, forceRefresh]);

  // Filter products based on criteria
  useEffect(() => {
    if (allProducts.length > 0) {
      applyFilters();
    }
  }, [allProducts, categoryFilter, subcategoryFilter, searchQuery, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, subcategoryFilter, searchQuery]);

  // Fetch all products from ProductService
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const allProductsData = await productService.getAllProducts();
      setAllProducts(allProductsData);
    } catch (error) {
      console.error("Error fetching all products:", error);
    } finally {
      setLoading(false);
      setForceRefresh(false);
    }
  };

  // Apply filters to all products
  const applyFilters = () => {
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
    
    // Apply pagination
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    
    // Set products for current page
    setProducts(filtered.slice(startIndex, endIndex));
  };

  // Extract categories and subcategories from all products
  const fetchCategoriesAndSubcategories = async () => {
    try {
      const products = await productService.getAllProducts();
      
      const uniqueCategories = new Set<string>();
      const uniqueSubcategories = new Set<string>();

      products.forEach((product) => {
        if (product.category) uniqueCategories.add(product.category);
        if (product.subcategory) uniqueSubcategories.add(product.subcategory);
      });

      const categoriesArray = Array.from(uniqueCategories).sort();
      const subcategoriesArray = Array.from(uniqueSubcategories).sort();

      setCategories(categoriesArray);
      setSubcategories(subcategoriesArray);

      // Save to cache
      saveToCache(PRODUCTS_CATEGORIES_CACHE_KEY, categoriesArray);
      saveToCache(PRODUCTS_SUBCATEGORIES_CACHE_KEY, subcategoriesArray);
    } catch (error) {
      console.error("Error fetching categories and subcategories:", error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const userName = localStorage.getItem("userName") || "Unknown";
      
      // First update the modified date to track when the product was deleted
      await updateDoc(doc(db, PRODUCT_COLLECTION, id), {
        modifiedDate: serverTimestamp(),
        modifiedBy: userName
      });
      
      // Then delete the document
      await deleteDoc(doc(db, PRODUCT_COLLECTION, id));
      
      // Update the cache in ProductService
      await productService.deleteProduct(id);
      
      // Update the local state
      setAllProducts(allProducts.filter(p => p.id !== id));
      
      // Also update the current filtered list
      setProducts(products.filter(p => p.id !== id));
      
      saveCollectionUpdateTime(COLLECTION_KEYS.PRODUCTS);
      
      Notifications.success("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);
      Notifications.error("Failed to delete product.");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };
  
  const handleSubcategoryChange = (value: string) => {
    setSubcategoryFilter(value);
  };

  const handleRefresh = () => {
    setForceRefresh(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
    pageSize: PAGE_SIZE,
    handleSearch,
    handleCategoryChange,
    handleSubcategoryChange,
    handleRefresh,
    deleteProduct,
    handlePageChange,
  };
};
