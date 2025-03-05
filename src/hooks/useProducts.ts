
import { useState, useEffect } from "react";
import { db, PRODUCT_COLLECTION } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, where, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Product } from "@/types/product";
import { isCacheValid, saveToCache, getFromCache, clearCache } from "@/utils/cacheUtils";
import { useToast } from "@/components/ui/use-toast";
import { 
  COLLECTION_KEYS,
  saveCollectionUpdateTime,
  saveCollectionFetchTime,
  shouldFetchCollection,
} from "@/utils/collectionUtils";

const PRODUCTS_CACHE_KEY = "products_cache";
const PRODUCTS_LIST_CACHE_KEY = `${PRODUCTS_CACHE_KEY}_list`;
const PRODUCTS_LAST_UPDATE_KEY = `${PRODUCTS_CACHE_KEY}_lastUpdate`;

export const useProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [filter, refreshKey, forceRefresh]);

  const fetchProducts = async (next = false) => {
    try {
      setLoading(true);

      const skipCache = !!searchQuery || forceRefresh || next;
      
      const cacheKey = `${PRODUCTS_LIST_CACHE_KEY}_${filter}`;
      
      const shouldRefresh = shouldFetchCollection(COLLECTION_KEYS.PRODUCTS);
      
      if (!skipCache && !shouldRefresh && isCacheValid(cacheKey)) {
        const cachedProducts = getFromCache<Product[]>(cacheKey);
        if (cachedProducts && cachedProducts.length > 0) {
          setProducts(cachedProducts);
          setLoading(false);
          console.log("Using cached products list");
          return;
        }
      }

      let q;
      const productsCollection = collection(db, PRODUCT_COLLECTION);

      if (searchQuery) {
        q = query(
          productsCollection,
          where("name", ">=", searchQuery),
          where("name", "<=", searchQuery + "\uf8ff"),
          limit(25)
        );
      } else if (filter !== "all") {
        q = query(
          productsCollection,
          where("category", "==", filter),
          orderBy("name"),
          limit(25)
        );
      } else if (next && lastVisible) {
        q = query(
          productsCollection,
          orderBy("name"),
          startAfter(lastVisible),
          limit(25)
        );
      } else {
        q = query(productsCollection, orderBy("name"), limit(25));
      }

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === 25);
      } else {
        setHasMore(false);
      }

      const fetchedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        const productData = doc.data() as Record<string, any>;
        
        const productWithId: Product = {
          id: doc.id,
          name: productData.name || "",
          costPrice: productData.costPrice || 0,
          sellingPrice: productData.sellingPrice || 0,
          stock: productData.stock || 0,
          category: productData.category || "",
          subcategory: productData.subcategory || "",
          location: productData.location || "loc-1",
          keywords: productData.keywords || [],
          discount: productData.discount,
          grnNumber: productData.grnNumber,
          barcode: productData.barcode,
          imageUrl: productData.imageUrl,
          description: productData.description,
          sku: productData.sku,
          specifications: productData.specifications,
          createdAt: productData.createdAt ? new Date(productData.createdAt.toDate()) : undefined,
          createdBy: productData.createdBy || "Unknown",
          modifiedDate: productData.modifiedDate ? new Date(productData.modifiedDate.toDate()) : undefined,
          modifiedBy: productData.modifiedBy || "Unknown"
        };
        
        fetchedProducts.push(productWithId);
        
        saveToCache(`${PRODUCTS_CACHE_KEY}_${doc.id}`, productWithId);
      });

      if (next) {
        setProducts((prev) => {
          const newProducts = [...prev, ...fetchedProducts];
          return newProducts;
        });
      } else {
        setProducts(fetchedProducts);
        if (!searchQuery) {
          saveToCache(cacheKey, fetchedProducts);
        }
      }
      
      if (!next) {
        saveCollectionFetchTime(COLLECTION_KEYS.PRODUCTS);
        saveToCache(PRODUCTS_LAST_UPDATE_KEY, { timestamp: Date.now() });
      }
      
      setForceRefresh(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      
      if (!searchQuery) {
        const cacheKey = `${PRODUCTS_LIST_CACHE_KEY}_${filter}`;
        const cachedProducts = getFromCache<Product[]>(cacheKey);
        if (cachedProducts) {
          setProducts(cachedProducts);
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
      
      saveCollectionUpdateTime(COLLECTION_KEYS.PRODUCTS);
      saveToCache(PRODUCTS_LAST_UPDATE_KEY, { timestamp: Date.now() });
      
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setRefreshKey(prev => prev + 1);
    } else {
      fetchProducts();
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const handleRefresh = () => {
    setForceRefresh(true);
  };

  const loadMore = () => {
    fetchProducts(true);
  };

  return {
    products,
    loading,
    searchQuery,
    filter,
    hasMore,
    handleSearch,
    handleFilterChange,
    handleRefresh,
    deleteProduct,
    loadMore,
  };
};
