import {useCallback, useEffect, useState} from "react";
import {db, PRODUCT_COLLECTION} from "@/lib/firebase";
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
import {clearCache, getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils";
import {Notifications} from "@/utils/notifications";
import {
  COLLECTION_KEYS,
  saveCollectionFetchTime,
  saveCollectionUpdateTime,
  shouldFetchCollection,
} from "@/utils/collectionUtils";

const PRODUCTS_CACHE_KEY = "products_cache";
const PRODUCTS_PAGE_CACHE_KEY = `${PRODUCTS_CACHE_KEY}_page`;
const PRODUCTS_LAST_UPDATE_KEY = `${PRODUCTS_CACHE_KEY}_lastUpdate`;
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

  // Load categories and subcategories
  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, [refreshKey, forceRefresh]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, subcategoryFilter, currentPage, refreshKey, forceRefresh]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, subcategoryFilter, searchQuery]);

  // Handle search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch distinct categories and subcategories
  const fetchCategoriesAndSubcategories = async () => {
    try {
      // Try to get from cache first
      const shouldRefresh = shouldFetchCollection(COLLECTION_KEYS.PRODUCTS);

      if (!shouldRefresh && !forceRefresh) {
        const cachedCategories = getFromCache<string[]>(PRODUCTS_CATEGORIES_CACHE_KEY);
        const cachedSubcategories = getFromCache<string[]>(PRODUCTS_SUBCATEGORIES_CACHE_KEY);

        if (cachedCategories && cachedSubcategories) {
          setCategories(cachedCategories);
          setSubcategories(cachedSubcategories);
          return;
        }
      }

      // Fetch from Firestore
      const productsCollection = collection(db, PRODUCT_COLLECTION);
      const q = query(productsCollection);
      const querySnapshot = await getDocs(q);

      const uniqueCategories = new Set<string>();
      const uniqueSubcategories = new Set<string>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category) uniqueCategories.add(data.category);
        if (data.subcategory) uniqueSubcategories.add(data.subcategory);
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

  // Get total count of products based on filters
  const fetchTotalProducts = useCallback(async () => {
    try {
      const productsCollection = collection(db, PRODUCT_COLLECTION);
      let q = query(productsCollection);
      
      if (categoryFilter !== "all") {
        q = query(q, where("category", "==", categoryFilter));
      }
      
      if (subcategoryFilter !== "all") {
        q = query(q, where("subcategory", "==", subcategoryFilter));
      }
      
      if (searchQuery) {
        // We can't get exact count with text search, we'll estimate
        return null;
      }
      
      const countSnapshot = await getCountFromServer(q);
      return countSnapshot.data().count;
    } catch (error) {
      console.error("Error fetching product count:", error);
      return null;
    }
  }, [categoryFilter, subcategoryFilter, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Calculate cache key based on filters and pagination
      const cacheKey = `${PRODUCTS_PAGE_CACHE_KEY}_${categoryFilter}_${subcategoryFilter}_${currentPage}_${PAGE_SIZE}`;
      const searchCacheKey = `${PRODUCTS_PAGE_CACHE_KEY}_search_${searchQuery.toLowerCase()}_${currentPage}`;
      
      const skipCache = forceRefresh || searchQuery !== "";
      const shouldRefresh = shouldFetchCollection(COLLECTION_KEYS.PRODUCTS);
      
      // Try to get from cache if not searching and cache is valid
      if (!skipCache && !shouldRefresh && isCacheValid(cacheKey)) {
        const cachedData = getFromCache<{products: Product[], total: number}>(cacheKey);
        if (cachedData) {
          setProducts(cachedData.products);
          setTotalProducts(cachedData.total);
          setLoading(false);
          console.log("Using cached products page");
          return;
        }
      }
      
      // Firestore query construction
      const productsCollection = collection(db, PRODUCT_COLLECTION);
      let q;
      
      // Base query with filters
      let baseQuery = query(productsCollection);
      
      if (categoryFilter !== "all") {
        baseQuery = query(baseQuery, where("category", "==", categoryFilter));
      }
      
      if (subcategoryFilter !== "all") {
        baseQuery = query(baseQuery, where("subcategory", "==", subcategoryFilter));
      }
      
      // Get total count if not searching
      let totalCount = null;
      if (!searchQuery) {
        totalCount = await fetchTotalProducts();
      }
      
      // Handle search query
      if (searchQuery) {
        // First search by name (case insensitive - convert to lowercase for comparison)
        const searchLower = searchQuery.toLowerCase();
        
        // We need to fetch all products to do complex filtering in memory for search across multiple fields
        const allProductsSnapshot = await getDocs(baseQuery);
        const allProducts: Product[] = [];
        
        allProductsSnapshot.forEach((doc) => {
          const productData = doc.data() as Record<string, any>;
          const product: Product = {
            id: doc.id,
            name: productData.name || "",
            productCode: productData.productCode || "",
            category: productData.category || "",
            subcategory: productData.subcategory || "",
            keywords: productData.keywords || [],
            barcode: productData.barcode,
            imageUrl: productData.imageUrl,
            description: productData.description,
            createdAt: productData.createdAt ? new Date(productData.createdAt.toDate()) : undefined,
            createdBy: productData.createdBy || "Unknown",
            modifiedDate: productData.modifiedDate ? new Date(productData.modifiedDate.toDate()) : undefined,
            modifiedBy: productData.modifiedBy || "Unknown"
          };
          
          allProducts.push(product);
        });
        
        // Filter by name, code, keywords, or other fields (case insensitive)
        const filteredProducts = allProducts.filter(product => {
          // Check product name
          if (product.name.toLowerCase().includes(searchLower)) return true;
          
          // Check product code
          if (product.productCode && product.productCode.toLowerCase().includes(searchLower)) return true;
          
          // Check barcode
          if (product.barcode && product.barcode.toLowerCase().includes(searchLower)) return true;
          
          // Check category
          if (product.category.toLowerCase().includes(searchLower)) return true;
          
          // Check subcategory
          if (product.subcategory.toLowerCase().includes(searchLower)) return true;
          
          // Check keywords
          if (product.keywords && product.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchLower))) return true;
          
          return false;
        });
        
        // Update total count
        totalCount = filteredProducts.length;
        
        // Paginate in memory
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts);
        setTotalProducts(totalCount);
        
        // Cache search results
        if (filteredProducts.length > 0) {
          saveToCache(searchCacheKey, {
            products: paginatedProducts,
            total: totalCount
          });
        }
      } else {
        // Not searching - use Firestore pagination
        const offset = (currentPage - 1) * PAGE_SIZE;
        
        q = query(
          baseQuery,
          orderBy("name"),
          limit(PAGE_SIZE)
        );

        const querySnapshot = await getDocs(q);
        
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          const productData = doc.data() as Record<string, any>;
          
          const productWithId: Product = {
            id: doc.id,
            name: productData.name || "",
            productCode: productData.productCode || "",
            category: productData.category || "",
            subcategory: productData.subcategory || "",
            keywords: productData.keywords || [],
            barcode: productData.barcode,
            imageUrl: productData.imageUrl,
            description: productData.description,
            createdAt: productData.createdAt ? new Date(productData.createdAt.toDate()) : undefined,
            createdBy: productData.createdBy || "Unknown",
            modifiedDate: productData.modifiedDate ? new Date(productData.modifiedDate.toDate()) : undefined,
            modifiedBy: productData.modifiedBy || "Unknown"
          };
          
          fetchedProducts.push(productWithId);
          
          // Cache individual product
          saveToCache(`${PRODUCTS_CACHE_KEY}_${doc.id}`, productWithId);
        });
        
        setProducts(fetchedProducts);
        
        if (totalCount !== null) {
          setTotalProducts(totalCount);
          
          // Cache paginated results
          saveToCache(cacheKey, {
            products: fetchedProducts,
            total: totalCount
          });
        }
      }
      
      if (!searchQuery) {
        saveCollectionFetchTime(COLLECTION_KEYS.PRODUCTS);
        saveToCache(PRODUCTS_LAST_UPDATE_KEY, { timestamp: Date.now() });
      }
      
      setForceRefresh(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      
      if (!searchQuery) {
        const cacheKey = `${PRODUCTS_PAGE_CACHE_KEY}_${categoryFilter}_${subcategoryFilter}_${currentPage}_${PAGE_SIZE}`;
        const cachedData = getFromCache<{products: Product[], total: number}>(cacheKey);
        if (cachedData) {
          setProducts(cachedData.products);
          setTotalProducts(cachedData.total);
          console.log("Using cached products after fetch error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const userName = localStorage.getItem("userName") || "Unknown";
      
      await updateDoc(doc(db, PRODUCT_COLLECTION, id), {
        modifiedDate: serverTimestamp(),
        modifiedBy: userName
      });
      
      await deleteDoc(doc(db, PRODUCT_COLLECTION, id));
      setProducts(products.filter(product => product.id !== id));
      
      clearCache(`${PRODUCTS_CACHE_KEY}_${id}`);
      
      // Clear all paginated caches
      Object.keys(localStorage)
        .filter(key => key.startsWith(PRODUCTS_PAGE_CACHE_KEY))
        .forEach(key => clearCache(key));
      
      saveCollectionUpdateTime(COLLECTION_KEYS.PRODUCTS);
      saveToCache(PRODUCTS_LAST_UPDATE_KEY, { timestamp: Date.now() });
      
      // Refresh categories and subcategories
      fetchCategoriesAndSubcategories();
      
      // Refresh product counts and current page
      fetchProducts();
      
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
