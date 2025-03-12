import {useEffect, useMemo, useState} from 'react';
import {COLLECTION_KEYS, markCollectionUpdated, shouldFetchCollection} from '@/utils/collectionUtils';
import {CACHE_KEYS, getFromCache} from '@/utils/cacheUtils';
import {Store} from "@/types/store.ts";
import {storeService} from "@/services/StoreService.ts";

export const useStoreData = (pageSize: number = 20) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [storeData, setStoreData] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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
                    data = await storeService.getStoreItems();

                    // Mark collection as updated
                    markCollectionUpdated(COLLECTION_KEYS.STORE);
                } else {
                    // Get from cache
                    const cachedData = getFromCache<Store[]>(CACHE_KEYS.STORE_CACHE_KEY);
                    if (cachedData && cachedData.length > 0) {
                        data = cachedData;
                        console.log('Using cached store data');
                    } else {
                        // No cache or empty cache, fetch from Firebase
                        data = await storeService.getStoreItems();

                        // Mark collection as updated
                        markCollectionUpdated(COLLECTION_KEYS.STORE);
                    }
                }

                setStoreData(data);
            } catch (err) {
                console.error('Error fetching store data:', err);
                setError('Failed to fetch store data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoreData();
    }, []);

    // Filter store data based on search term
    const filteredData = useMemo(() => {
        return storeService.searchStoreItems(searchTerm, storeData);
    }, [searchTerm, storeData]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / pageSize);

    // Get current page data
    const currentData = useMemo(() => {
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
