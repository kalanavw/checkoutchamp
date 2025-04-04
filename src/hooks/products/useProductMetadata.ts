
import { useState, useEffect } from "react";
import { productService } from "@/services/ProductService";
import { PRODUCTS_CATEGORIES_CACHE_KEY, PRODUCTS_SUBCATEGORIES_CACHE_KEY } from "@/constants/cacheKeys";
import { saveToCache } from "@/utils/cacheUtils";

export const useProductMetadata = (forceRefresh: boolean) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, [forceRefresh]);

  const fetchCategoriesAndSubcategories = async () => {
    try {
      setLoading(true);
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
  };
};
