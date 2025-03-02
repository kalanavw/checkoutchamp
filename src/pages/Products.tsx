
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {db, PRODUCT_COLLECTION} from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, where, deleteDoc, doc } from "firebase/firestore";
import { Product } from "@/types/product";
import { ProductsTable } from "@/components/products/ProductsTable";
import { SearchBar } from "@/components/products/SearchBar";
import { Plus, ListFilter, RefreshCw } from "lucide-react";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [filter, refreshKey]);

  const fetchProducts = async (next = false) => {
    try {
      setLoading(true);

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
        const data = doc.data();
        fetchedProducts.push({ 
          id: doc.id, 
          ...data as Omit<Product, 'id'>
        });
      });

      if (next) {
        setProducts((prev) => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, PRODUCT_COLLECTION, id));
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleViewProduct = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/add-product")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
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
            className="border rounded p-2 bg-background"
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
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;
