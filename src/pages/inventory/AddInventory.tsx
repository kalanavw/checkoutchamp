import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PackagePlus, PlusCircle, Save, Trash2} from 'lucide-react';
import {v4 as uuidv4} from 'uuid';
import {toast} from 'sonner';

import AddLocationDialog from '@/components/AddLocationDialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {COLLECTION_KEYS, markCollectionUpdated} from '@/utils/collectionUtils';
import {getFromCache, saveToCache} from '@/utils/cacheUtils';
import {Product} from "@/types/product.ts";
import {Warehouse} from "@/types/warehouse.ts";
import {warehouseService} from "@/services/WarehouseService.ts";
import {productService} from "@/services/ProductService.ts";
import {Store} from "@/types/store.ts";
import {storeService} from "@/services/StoreService.ts";
import {Notifications} from "@/utils/notifications.ts";
import {SearchBar} from "@/components/products/SearchBar";
import {generateCustomUUID} from "@/utils/Util.ts";
import {STORE_CACHE_KEY} from "@/constants/cacheKeys.ts";

interface ProductInventoryItem {
    id: string;
    product: Product;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    discount?: number;
}

const AddInventory = () => {
    const navigate = useNavigate();
    const [grnNumber, setGrnNumber] = useState(`GRN-${new Date().getFullYear()}-${1000 + Math.floor(Math.random() * 9000)}`);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [items, setItems] = useState<ProductInventoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const fetchWarehouses = async () => {
        try {
            setIsLoading(true);
            const warehousesData = await warehouseService.fetchWarehouses();
            setWarehouses(warehousesData);

            if (warehousesData.length > 0 && !selectedLocation) {
                setSelectedLocation(warehousesData[0].id);
            }
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    // Search products using the enhanced ProductService
    useEffect(() => {
        const searchProducts = async () => {
            if (searchTerm.trim().length < 3) {
                setFilteredProducts([]);
                return;
            }

            try {
                setIsSearching(true);
                const products = await productService.searchProducts(searchTerm);
                setFilteredProducts(products);
            } catch (error) {
                console.error("Error searching products:", error);
                setFilteredProducts([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            searchProducts();
        }, 300); // Debounce the search

        return () => clearTimeout(timer);
    });

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        // If search term is empty, reset the filtered products
        if (!value.trim()) {
            setFilteredProducts([]);
        }
    };

    const handleAddProduct = (product: Product) => {
        const existingItemIndex = items.findIndex(item => item.product.id === product.id);

        if (existingItemIndex >= 0) {
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += 1;
            setItems(updatedItems);
        } else {
            setItems([...items, {
                id: uuidv4(),
                product,
                quantity: 0,
                costPrice: 0,
                sellingPrice: 0,
                discount: 0
            }]);
        }

        setSearchTerm('');
        setFilteredProducts([]);
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const handleUpdateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) return;

        setItems(items.map(item =>
            item.id === itemId ? {...item, quantity} : item
        ));
    };

    const handleUpdateCostPrice = (itemId: string, costPrice: number) => {
        if (costPrice < 0) return;

        setItems(items.map(item =>
            item.id === itemId ? {...item, costPrice} : item
        ));
    };

    const handleUpdateSellingPrice = (itemId: string, sellingPrice: number) => {
        if (sellingPrice < 0) return;

        setItems(items.map(item =>
            item.id === itemId ? {...item, sellingPrice} : item
        ));
    };

    const handleUpdateDiscount = (itemId: string, discount: number) => {
        if (discount < 0) return;

        setItems(items.map(item =>
            item.id === itemId ? {...item, discount} : item
        ));
    };

    const handleLocationAdded = async (locationId: string) => {
        await fetchWarehouses();
        setSelectedLocation(locationId);
    };

    const handleSaveInventory = async () => {
        if (!selectedLocation) {
            Notifications.error("Please select a warehouse");
            return;
        }

        if (items.length === 0) {
            Notifications.error("Please add at least one product");
            return;
        }

        const warehouse = warehouses.find(loc => loc.id === selectedLocation);
        if (!warehouse) {
            Notifications.error("Invalid warehouse selected");
            return;
        }

        try {
            setIsSaving(true);

            const storeItems: Store[] = items.map(item => ({
                id: generateCustomUUID(),
                costPrice: item.costPrice,
                sellingPrice: item.sellingPrice,
                location: {id: warehouse.id, name: warehouse.name, code: warehouse.code},
                discount: item.discount,
                grnNumber,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    productCode: item.product.productCode,
                    barcode: item.product.barcode,
                    imageUrl: item.product.imageUrl,
                    category: item.product.category,
                    subcategory: item.product.subcategory
                },
                qty: {
                    totalQty: item.quantity,
                    availableQty: item.quantity
                }
            }));

            // Save to Firebase and update cache
            const savedItems = await storeService.saveStoreItems(storeItems);

            // Mark collection as updated to ensure cache refresh
            markCollectionUpdated(COLLECTION_KEYS.STORE);

            // Update the cache directly
            const cachedItems = getFromCache<Store[]>(STORE_CACHE_KEY) || [];
            const updatedCache = [...cachedItems, ...savedItems];
            saveToCache(STORE_CACHE_KEY, updatedCache);

            toast.success("Inventory added successfully");
            setTimeout(() => {
                navigate('/store');
            }, 1500);
        } catch (error) {
            console.error("Error saving inventory:", error);
            Notifications.error("Failed to save inventory. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container px-4 py-6 mx-auto">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Add Inventory</h1>
                        <p className="text-muted-foreground">Add new inventory items to your store.</p>
                    </div>
                    <Button
                        className="gap-2"
                        onClick={handleSaveInventory}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin mr-2">⊚</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18}/>
                                Save Inventory
                            </>
                        )}
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <Label htmlFor="grn">GRN Number</Label>
                                <Input
                                    id="grn"
                                    value={grnNumber}
                                    onChange={(e) => setGrnNumber(e.target.value)}
                                    placeholder="Enter GRN Number"
                                />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="location">Warehouse</Label>
                                    <AddLocationDialog onLocationAdded={handleLocationAdded}/>
                                </div>
                                <Select
                                    value={selectedLocation}
                                    onValueChange={setSelectedLocation}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={isLoading ? "Loading warehouses..." : "Select warehouse"}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(warehouse => (
                                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name} ({warehouse.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Search Products</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <Label htmlFor="productSearch">Search by name, code, barcode, category or
                                    keywords</Label>
                                <SearchBar
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Start typing to search products..."
                                    disabled={isSearching}
                                />
                                {isSearching && (
                                    <div className="text-sm text-muted-foreground flex items-center">
                                        <span className="animate-spin mr-2">⊚</span>
                                        Searching...
                                    </div>
                                )}
                            </div>

                            {filteredProducts.length > 0 && (
                                <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredProducts.map(product => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <div
                                                                className="w-8 h-8 rounded overflow-hidden bg-muted mr-2">
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <span>{product.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{product.productCode}</TableCell>
                                                    <TableCell>{product.category}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleAddProduct(product)}
                                                        >
                                                            <PlusCircle size={16}/>
                                                            <span className="ml-2">Add</span>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PackagePlus className="mr-2" size={20}/>
                            Inventory Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Cost Price</TableHead>
                                            <TableHead>Selling Price</TableHead>
                                            <TableHead>Discount %</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded overflow-hidden bg-muted mr-2">
                                                            <img
                                                                src={item.product.imageUrl}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div>{item.product.name}</div>
                                                            <div
                                                                className="text-xs text-muted-foreground">SKU: {item.product.productCode}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                        className="w-20"
                                                        min="1"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.costPrice}
                                                        onChange={(e) => handleUpdateCostPrice(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-24"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.sellingPrice}
                                                        onChange={(e) => handleUpdateSellingPrice(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-24"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.discount || 0}
                                                        onChange={(e) => handleUpdateDiscount(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-20"
                                                        min="0"
                                                        max="100"
                                                        step="0.1"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                    >
                                                        <Trash2 size={16}/>
                                                        <span className="ml-2">Remove</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 border rounded-md">
                                <div className="mb-3 text-muted-foreground">
                                    <PackagePlus size={40} className="mx-auto"/>
                                </div>
                                <h3 className="text-lg font-medium mb-2">No items added yet</h3>
                                <p className="text-muted-foreground mb-4">Search for products and add them to the
                                    inventory</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddInventory;
