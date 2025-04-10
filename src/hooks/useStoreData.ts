
import { useState, useEffect, useMemo } from "react";
import { StoreService } from "@/services/StoreService";
import { Store } from "@/types/store";
import { getFromCache, saveToCache } from "@/utils/cacheUtils";
import { STORE_CACHE_KEY } from "@/constants/cacheKeys"; 

export const useStoreData = (initialPageSize: number = 50) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");

  // Fetch store data
  const fetchStores = async (forceRefresh: boolean = false) => {
    try {
      setError(null);
      
      if (forceRefresh) {
        setIsRefreshing(true);
      } else if (!loading) {
        setLoading(true);
      }
      
      const storeService = new StoreService();
      const fetchedStores = await storeService.getStoreItems(forceRefresh);
      
      setStores(fetchedStores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Failed to load store data. Please try again later.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Extract unique categories and subcategories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(stores.map(store => store.product?.category).filter(Boolean))
    );
    return uniqueCategories as string[];
  }, [stores]);

  const subcategories = useMemo(() => {
    const uniqueSubcategories = Array.from(
      new Set(stores.map(store => store.product?.subcategory).filter(Boolean))
    );
    return uniqueSubcategories as string[];
  }, [stores]);

  // Filter store data
  const filteredData = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = !searchTerm
        ? true
        : (store.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           store.product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           store.product?.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           store.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           store.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' 
        ? true 
        : store.product?.category === categoryFilter;
      
      const matchesSubcategory = subcategoryFilter === 'all' 
        ? true 
        : store.product?.subcategory === subcategoryFilter;
      
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [stores, searchTerm, categoryFilter, subcategoryFilter]);

  // Paginate data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData, pageSize]);

  // Reset search and filters
  const resetSearch = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setSubcategoryFilter("all");
    setCurrentPage(1);
  };

  // Refresh data
  const refreshData = () => {
    setCurrentPage(1);
    fetchStores(true);
  };

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filteredData,
    currentData,
    totalPages,
    resetSearch,
    isLoading: loading,
    isRefreshing,
    error,
    refreshData,
    categoryFilter,
    setCategoryFilter,
    subcategoryFilter,
    setSubcategoryFilter,
    categories,
    subcategories
  };
};
