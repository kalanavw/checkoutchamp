
import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useStoreData} from '@/hooks/useStoreData';
import {useNavigate} from 'react-router-dom';
import {Warehouse} from '@/types/warehouse';
import {Product} from '@/types/product';
import {warehouseService} from '@/services/WarehouseService';
import {productService} from '@/services/ProductService';
import {getFromCache, saveToCache} from '@/utils/cacheUtils';
import {PRODUCTS_CACHE_KEY, WAREHOUSE_CACHE_KEY} from "@/constants/cacheKeys";
import {Notifications} from "@/utils/notifications";
import {generateCustomUUID} from "@/utils/Util";
import {COLLECTION_KEYS, saveCollectionUpdateTime} from "@/utils/collectionUtils";
import {Package} from "lucide-react";

const AddInventory = () => {
    const navigate = useNavigate();
    const { stores } = useStoreData(); // Now correctly accessing the stores property
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState({
        storeId: '',
        warehouseId: '',
        productId: '',
        quantity: 0,
        notes: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWarehouses();
        fetchProducts();
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            let cachedWarehouses = getFromCache<Warehouse[]>(WAREHOUSE_CACHE_KEY);
            if (!cachedWarehouses) {
                cachedWarehouses = await warehouseService.fetchWarehouses();
                saveToCache<Warehouse[]>(WAREHOUSE_CACHE_KEY, cachedWarehouses);
            }
            setWarehouses(cachedWarehouses);
        } catch (error) {
            console.error("Error fetching warehouses:", error);
            Notifications.error("Failed to fetch warehouses. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let cachedProducts = getFromCache<Product[]>(PRODUCTS_CACHE_KEY);
            if (!cachedProducts) {
                cachedProducts = await productService.getAllProducts();
                saveToCache<Product[]>(PRODUCTS_CACHE_KEY, cachedProducts);
            }
            setProducts(cachedProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
            Notifications.error("Failed to fetch products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.storeId || !formData.warehouseId || !formData.productId || !formData.quantity) {
            Notifications.error("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            const inventoryData = {
                id: generateCustomUUID(),
                storeId: formData.storeId,
                warehouseId: formData.warehouseId,
                productId: formData.productId,
                quantity: Number(formData.quantity),
                notes: formData.notes,
                createdAt: new Date(),
            };

            // Save to Firestore (replace with your actual Firestore logic)
            // await addDoc(collection(db, 'inventory'), inventoryData);

            Notifications.success("Inventory added successfully!");
            saveCollectionUpdateTime(COLLECTION_KEYS.PRODUCTS);
            navigate('/inventory');
        } catch (error) {
            console.error("Error adding inventory:", error);
            Notifications.error("Failed to add inventory. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Package className="mr-2 h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Add New Inventory</h1>
            </div>

            <Card className="bg-secondary/30 border-theme-light">
                <CardHeader className="bg-gradient-to-r from-secondary to-secondary/50 rounded-t-lg">
                    <CardTitle>Inventory Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="storeId">Store</Label>
                            <Select onValueChange={(value) => handleSelectChange('storeId', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a store" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stores && stores.map(store => (
                                        <SelectItem key={store.id} value={store.id}>{store.product?.name || 'Unnamed Store'}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="warehouseId">Warehouse</Label>
                            <Select onValueChange={(value) => handleSelectChange('warehouseId', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map(warehouse => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="productId">Product</Label>
                            <Select onValueChange={(value) => handleSelectChange('productId', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(product => (
                                        <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="Enter quantity"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Enter notes"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => navigate('/inventory')}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Inventory'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddInventory;
