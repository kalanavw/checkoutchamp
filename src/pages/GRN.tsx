
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  increment 
} from "firebase/firestore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GRN, GRNItem } from "@/types/grn";
import { Product } from "@/types/product";
import { Plus, Minus, X, Save, Truck, PackageSearch, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GRNPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState<{
    grnNumber: string;
    supplierName: string;
    receivedDate: string;
    notes: string;
    items: GRNItem[];
  }>({
    grnNumber: `GRN-${Date.now().toString().slice(-8)}`,
    supplierName: "",
    receivedDate: new Date().toISOString().split('T')[0],
    notes: "",
    items: [],
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Perform actual search in Firestore
      const productsQuery = query(
        collection(db, "products"),
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + "\uf8ff")
      );
      
      const snapshot = await getDocs(productsQuery);
      const products: Product[] = [];
      
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      // If no results with name, try searching by keywords
      if (products.length === 0) {
        const keywordQuery = query(
          collection(db, "products"),
          where("keywords", "array-contains", searchQuery.toLowerCase())
        );
        
        const keywordSnapshot = await getDocs(keywordQuery);
        keywordSnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() } as Product);
        });
      }
      
      setSearchResults(products);
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        title: "Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addItemToGRN = (product: Product) => {
    const newItem: GRNItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      costPrice: product.costPrice,
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setSearchQuery("");
    setSearchResults([]);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...formData.items];
    newItems[index].quantity = Math.max(1, quantity);
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const updateItemCostPrice = (index: number, costPrice: number) => {
    const newItems = [...formData.items];
    newItems[index].costPrice = costPrice;
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierName) {
      toast({
        title: "Error",
        description: "Supplier name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one item to the GRN.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create GRN document
      const grnData: Omit<GRN, "id"> = {
        grnNumber: formData.grnNumber,
        supplierName: formData.supplierName,
        receivedDate: new Date(formData.receivedDate),
        items: formData.items,
        notes: formData.notes,
        createdBy: localStorage.getItem("userName") || "Admin",
      };
      
      const grnRef = await addDoc(collection(db, "grns"), {
        ...grnData,
        createdAt: serverTimestamp()
      });
      
      // Update product stock and cost price
      for (const item of formData.items) {
        const productRef = doc(db, "products", item.productId);
        await updateDoc(productRef, {
          stock: increment(item.quantity),
          costPrice: item.costPrice,
          grnNumber: formData.grnNumber
        });
      }
      
      toast({
        title: "Success",
        description: "GRN created and product stock updated successfully.",
      });
      
      navigate("/products");
    } catch (error) {
      console.error("Error creating GRN:", error);
      toast({
        title: "Error",
        description: "Failed to create GRN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalCost = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in">
      <div className="flex items-center gap-3 mb-6">
        <Truck className="h-6 w-6 text-green-600" />
        <h1 className="text-3xl font-semibold text-green-800 dark:text-green-300">Create GRN</h1>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-300 flex items-center gap-2">
            <span>Goods Received Note</span>
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="grnNumber" className="text-sm font-normal">GRN #:</Label>
              <Input
                id="grnNumber"
                value={formData.grnNumber}
                onChange={(e) => handleChange("grnNumber", e.target.value)}
                className="w-48 h-9"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => handleChange("supplierName", e.target.value)}
                  placeholder="Enter supplier name"
                  required
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receivedDate" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Received Date
                </Label>
                <Input
                  id="receivedDate"
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) => handleChange("receivedDate", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="text-lg font-medium">GRN Items</h3>
                <div className="flex gap-2 w-full sm:w-auto max-w-md">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          searchProducts();
                        }
                      }}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={searchProducts}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PackageSearch className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <Card className="border border-green-200 dark:border-green-800">
                  <CardContent className="p-2">
                    <div className="max-h-48 overflow-auto">
                      {searchResults.map((product) => (
                        <div 
                          key={product.id} 
                          className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer rounded flex justify-between items-center"
                          onClick={() => addItemToGRN(product)}
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.category} • Stock: {product.stock} • ${product.costPrice.toFixed(2)}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-green-50 dark:bg-green-900/10">
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No items added. Search for products to add them to the GRN.
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                className="h-7 w-7"
                                type="button"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                                className="w-20 h-9 text-base text-center"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                className="h-7 w-7"
                                type="button"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.costPrice}
                              onChange={(e) => updateItemCostPrice(index, parseFloat(e.target.value))}
                              className="w-28 h-9"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            ${(item.quantity * item.costPrice).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    
                    {formData.items.length > 0 && (
                      <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total Cost:
                        </TableCell>
                        <TableCell className="font-bold text-green-700 dark:text-green-400">
                          ${getTotalCost().toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Add notes about this delivery (optional)"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || formData.items.length === 0} 
                className="min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Save GRN</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GRNPage;
