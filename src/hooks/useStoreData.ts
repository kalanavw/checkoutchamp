
import {useEffect, useMemo, useState} from 'react';
import {COLLECTION_KEYS, markCollectionUpdated, shouldFetchCollection} from '@/utils/collectionUtils';
import {CACHE_KEYS, getFromCache, saveToCache} from '@/utils/cacheUtils';
import {Store} from "@/types/store.ts";
import {storeService} from "@/services/StoreService.ts";

export const useStoreData = (pageSize: number = 20) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [storeData, setStoreData] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch store data on component mount
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Check if we should fetch from Firebase or use cache
                const shouldFetch = shouldFetchCollection(COLLECTION_KEYS.STORE);
                let data: Store[] = [];

                if (shouldFetch) {
                    // Fetch from Firebase
                    console.log('Fetching store data from Firebase');
                    data = await storeService.getStoreItems();
                    
                    // Save to cache
                    saveToCache(CACHE_KEYS.STORE_CACHE_KEY, data);
                    
                    // Mark collection as updated
                    markCollectionUpdated(COLLECTION_KEYS.STORE);
                } else {
                    // Get from cache
                    const cachedData = getFromCache<Store[]>(CACHE_KEYS.STORE_CACHE_KEY);
                    if (cachedData && cachedData.length > 0) {
                        console.log('Using cached store data');
                        data = cachedData;
                    } else {
                        // No cache or empty cache, fetch from Firebase
                        console.log('No cache found, fetching from Firebase');
                        data = await storeService.getStoreItems();
                        
                        // Save to cache
                        saveToCache(CACHE_KEYS.STORE_CACHE_KEY, data);
                        
                        // Mark collection as updated
                        markCollectionUpdated(COLLECTION_KEYS.STORE);
                    }
                }

                // Validate data to ensure all required fields are present
                const validatedData = data.filter(item => {
                    // Check for required fields
                    return (
                        item && 
                        item.product && 
                        item.location && 
                        item.qty && 
                        typeof item.costPrice === 'number' && 
                        typeof item.sellingPrice === 'number'
                    );
                });

                if (validatedData.length !== data.length) {
                    console.warn(`Filtered out ${data.length - validatedData.length} invalid store items`);
                }

                setStoreData(validatedData);
            } catch (err) {
                console.error('Error fetching store data:', err);
                setError('Failed to fetch store data');
                setStoreData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoreData();
    }, []);

    // Filter store data based on search term
    const filteredData = useMemo(() => {
        if (!storeData || storeData.length === 0) return [];
        return storeService.searchStoreItems(searchTerm, storeData);
    }, [searchTerm, storeData]);

    // Calculate total pages
    const totalPages = Math.ceil((filteredData?.length || 0) / pageSize);

    // Get current page data
    const currentData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const resetSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    return {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        filteredData,
        currentData,
        totalPages,
        pageSize,
        resetSearch,
        isLoading,
        error
    };
};
