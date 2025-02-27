
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { ProductsTable } from "@/components/products/ProductsTable";
import { SearchBar } from "@/components/products/SearchBar";
import { Product } from "@/types/product";

const Products = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    const newProduct = {
      name: "New Product",
      price: 0,
      stock: 0,
      category: "General",
    };

    try {
      const docRef = await addDoc(collection(db, "products"), newProduct);
      const productWithId = { ...newProduct, id: docRef.id };
      setProducts([...products, productWithId]);
      toast({
        title: "Success",
        description: "Product added successfully.",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async (id: string, field: keyof Product, value: string | number) => {
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { [field]: value });
      
      setProducts(products.map(product => 
        product.id === id ? { ...product, [field]: value } : product
      ));

      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter(product => product.id !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 w-full animate-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Products</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <ProductsTable
            products={filteredProducts}
            loading={loading}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
