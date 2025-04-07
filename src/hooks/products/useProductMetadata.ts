
import { useState, useEffect } from "react";
import { productService } from "@/services/ProductService";
import { getFromCache, saveToCache } from "@/utils/cacheUtils";
import { PRODUCTS_CATEGORIES_CACHE_KEY, PRODUCTS_SUBCATEGORIES_CACHE_KEY } from "@/constants/cacheKeys";

export const useProductMetadata = (forceRefresh: boolean = false) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, [forceRefresh]);

  const fetchCategoriesAndSubcategories = async () => {
    try {
      setLoading(true);
      
      // Try getting from cache first
      const cachedCategories = getFromCache<string[]>(PRODUCTS_CATEGORIES_CACHE_KEY);
      const cachedSubcategories = getFromCache<string[]>(PRODUCTS_SUBCATEGORIES_CACHE_KEY);
      
      if (!forceRefresh && cachedCategories && cachedSubcategories) {
        setCategories(cachedCategories);
        setSubcategories(cachedSubcategories);
        setLoading(false);
        return;
      }
      
      // If not in cache or force refreshing, get from service
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
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    subcategories,
    loading,
    refresh: fetchCategoriesAndSubcategories
  };
};
