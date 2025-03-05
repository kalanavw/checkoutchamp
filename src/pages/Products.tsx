import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {db, PRODUCT_COLLECTION} from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, where, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Product } from "@/types/product";
import { ProductsTable } from "@/components/products/ProductsTable";
import { SearchBar } from "@/components/products/SearchBar";
import { Plus, ListFilter, RefreshCw } from "lucide-react";
import { isCacheValid, saveToCache, getFromCache, clearCache } from "@/utils/cacheUtils";
import { useToast } from "@/components/ui/use-toast";
import { 
  COLLECTION_KEYS,
  saveCollectionUpdateTime,
  saveCollectionFetchTime,
  shouldFetchCollection,
  markCollectionUpdated
} from "@/utils/collectionUtils";

const PRODUCTS_CACHE_KEY = "products_cache";
const PRODUCTS_LIST_CACHE_KEY = `${PRODUCTS_CACHE_KEY}_list`;
const PRODUCTS_LAST_UPDATE_KEY = `${PRODUCTS_CACHE_KEY}_lastUpdate`;

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);

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

  const handleDelete = async (id: string) => {
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
    }
  };

  const handleViewProduct = (id: string) => {
    navigate(`/products/${id}`);
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">Products</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/add-product")} className="bg-primary hover:bg-primary/80">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="border-primary/30 hover:bg-primary/10">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={handleSearch} />
        </div>
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <select
            className="border rounded p-2 bg-background border-primary/30"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
      </div>

      <ProductsTable 
        products={products} 
        loading={loading} 
        onDelete={handleDelete} 
        onView={handleViewProduct}
      />

      {products.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchProducts(true)}
            disabled={products.length < 25 || loading}
            className="border-primary/30 hover:bg-primary/10"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;
