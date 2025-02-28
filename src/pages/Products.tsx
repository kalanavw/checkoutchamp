import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Filter, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  where,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 10;

const Products = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<string>("");
  
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    fetchProductsCount();
    fetchProducts();
  }, [locationFilter]);

  const fetchProductsCount = async () => {
    try {
      let q = collection(db, "products");
      
      if (locationFilter) {
        q = query(q, where("location", "==", locationFilter));
      }
      
      const snapshot = await getDocs(q);
      const count = snapshot.size;
      setTotalProducts(count);
      setTotalPages(Math.max(1, Math.ceil(count / ITEMS_PER_PAGE)));
    } catch (error) {
      console.error("Error fetching products count:", error);
    }
  };

  const fetchProducts = async (direction: 'next' | 'prev' | 'first' = 'first') => {
    setLoading(true);
    try {
      let q = collection(db, "products");
      
      if (locationFilter) {
        q = query(q, where("location", "==", locationFilter));
      }
      
      q = query(q, orderBy("name"));
      
      if (direction === 'next' && lastVisible) {
        q = query(q, startAfter(lastVisible), limit(ITEMS_PER_PAGE));
        setPage(prev => prev + 1);
      } else if (direction === 'prev' && firstVisible) {
        q = query(q, endBefore(firstVisible), limitToLast(ITEMS_PER_PAGE));
        setPage(prev => prev - 1);
      } else {
        q = query(q, limit(ITEMS_PER_PAGE));
        setPage(1);
      }
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      
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
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      category: "General",
      subcategory: "",
      location: "loc-1" as const,
      keywords: [],
      discount: 0,
    };

    try {
      const docRef = await addDoc(collection(db, "products"), newProduct);
      
      fetchProducts();
      
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

  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData(product);
    setIsDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct || !editFormData) return;
    
    try {
      const productRef = doc(db, "products", selectedProduct.id);
      await updateDoc(productRef, editFormData);
      
      const updatedProducts = products.map(product => 
        product.id === selectedProduct.id ? { ...product, ...editFormData } : product
      );
      setProducts(updatedProducts);
      
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
      
      setIsDialogOpen(false);
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
      
      const filteredProducts = products.filter(product => product.id !== id);
      setProducts(filteredProducts);
      
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
      
      if (filteredProducts.length === 0 && page > 1) {
        fetchProducts('prev');
      } else {
        fetchProductsCount();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditChange = (field: keyof Product, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && editFormData.keywords && !editFormData.keywords.includes(keywordInput.trim())) {
      handleEditChange("keywords", [...editFormData.keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    if (editFormData.keywords) {
      handleEditChange("keywords", editFormData.keywords.filter(k => k !== keyword));
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.keywords?.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 w-full animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-semibold text-green-800 dark:text-green-300">Products</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.location.href = "/add-product"} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/grn"}>
            <Plus className="mr-2 h-4 w-4" />
            New GRN
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-lg pb-2">
          <CardTitle className="text-green-800 dark:text-green-300">Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center">
              <Label htmlFor="locationFilter" className="mr-2">Location:</Label>
              <Select
                value={locationFilter}
                onValueChange={setLocationFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="loc-1">Location 1</SelectItem>
                  <SelectItem value="loc-2">Location 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-green-50 dark:bg-green-900/10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700"></div>
                        <span className="ml-2">Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.category}
                        {product.subcategory && <span className="text-xs text-muted-foreground block">{product.subcategory}</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.location === "loc-1" ? "Location 1" : "Location 2"}</Badge>
                      </TableCell>
                      <TableCell>${product.costPrice?.toFixed(2)}</TableCell>
                      <TableCell>${product.sellingPrice?.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Showing page {page} of {totalPages} ({totalProducts} items)
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchProducts('first')}
                disabled={page === 1 || loading}
              >
                First
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchProducts('prev')}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchProducts('next')}
                disabled={page === totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={editFormData.name || ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editFormData.category || ""}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={editFormData.subcategory || ""}
                    onChange={(e) => handleEditChange("subcategory", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={editFormData.location}
                    onValueChange={(value) => handleEditChange("location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loc-1">Location 1</SelectItem>
                      <SelectItem value="loc-2">Location 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.costPrice || 0}
                    onChange={(e) => handleEditChange("costPrice", parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.sellingPrice || 0}
                    onChange={(e) => handleEditChange("sellingPrice", parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={editFormData.discount || 0}
                    onChange={(e) => handleEditChange("discount", parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={editFormData.stock || 0}
                    onChange={(e) => handleEditChange("stock", parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grnNumber">GRN Number</Label>
                  <Input
                    id="grnNumber"
                    value={editFormData.grnNumber || ""}
                    onChange={(e) => handleEditChange("grnNumber", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    id="keywords"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Enter keywords for search"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                  <Button type="button" onClick={addKeyword}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editFormData.keywords?.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                      {keyword}
                      <button type="button" onClick={() => removeKeyword(keyword)} className="ml-1 text-xs">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} className="bg-green-600 hover:bg-green-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
