
/**
 * Utilities for local caching and optimizing Firestore fetching
 */
import { getCollectionTimestamps, shouldFetchCollection } from './collectionUtils';

interface CacheMetadata {
  lastFetched: number;  // Timestamp when data was last fetched
  lastModified: number; // Timestamp of the last modification on server
}

interface CacheEntry<T> extends CacheMetadata {
  data: T;
}

/**
 * Check if cached data is still valid based on lastModified
 * @param cacheKey The key to check in localStorage
 * @param serverLastModified The server's last modified timestamp
 * @param maxAge Maximum cache age in milliseconds (default 5 minutes)
 * @returns Boolean indicating if cache is valid
 */
export const isCacheValid = (
  cacheKey: string,
  serverLastModified?: number,
  maxAge = 5 * 60 * 1000
): boolean => {
  try {
    const cacheEntry = localStorage.getItem(cacheKey);
    if (!cacheEntry) return false;
    
    const { lastFetched, lastModified } = JSON.parse(cacheEntry) as CacheMetadata;
    const now = Date.now();
    
    // If the cache key is associated with a collection, check collection timestamps
    const collectionKey = cacheKey.split('_')[0]; // Extract collection prefix if exists
    if (collectionKey && shouldFetchCollection(collectionKey, maxAge)) {
      return false;
    }
    
    // If server lastModified is provided, check if our cache is outdated
    if (serverLastModified && lastModified < serverLastModified) {
      return false;
    }
    
    // Check if cache is older than maxAge
    return (now - lastFetched) < maxAge;
  } catch (error) {
    console.error("Error checking cache validity:", error);
    return false;
  }
};

/**
 * Save data to localStorage with metadata
 * @param cacheKey Key to store data under
 * @param data The data to cache
 * @param lastModified Server's last modified timestamp
 */
export const saveToCache = <T>(
  cacheKey: string,
  data: T,
  lastModified = Date.now()
): void => {
  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      lastFetched: Date.now(),
      lastModified
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    
    // If the cache key is associated with a collection, update its fetch time
    const collectionKey = cacheKey.split('_')[0]; // Extract collection prefix if exists
    if (collectionKey) {
      const collectionTimestamps = getCollectionTimestamps(collectionKey);
      if (collectionTimestamps) {
        // Only update lastFetchTime, preserve lastUpdateTime
        const timestamps = {
          ...collectionTimestamps,
          lastFetchTime: Date.now()
        };
        localStorage.setItem(`${collectionKey}_timestamps`, JSON.stringify(timestamps));
      }
    }
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
};

/**
 * Get data from localStorage
 * @param cacheKey Key to retrieve data from
 * @returns The cached data or null if not found
 */
export const getFromCache = <T>(cacheKey: string): T | null => {
  try {
    const cacheEntry = localStorage.getItem(cacheKey);
    if (!cacheEntry) return null;
    
    const { data } = JSON.parse(cacheEntry) as CacheEntry<T>;
    return data;
  } catch (error) {
    console.error("Error getting from cache:", error);
    return null;
  }
};

/**
 * Get last modified time from cache
 * @param cacheKey Key to check
 * @returns Last modified timestamp or 0 if not found
 */
export const getLastModifiedTime = (cacheKey: string): number => {
  try {
    const cacheEntry = localStorage.getItem(cacheKey);
    if (!cacheEntry) return 0;
    
    const { lastModified } = JSON.parse(cacheEntry) as CacheMetadata;
    return lastModified;
  } catch (error) {
    console.error("Error getting last modified time:", error);
    return 0;
  }
};

/**
 * Clear a specific cache entry
 * @param cacheKey Key to clear
 */
export const clearCache = (cacheKey: string): void => {
  localStorage.removeItem(cacheKey);
};
