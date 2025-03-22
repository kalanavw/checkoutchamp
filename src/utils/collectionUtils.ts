
/**
 * Utilities for tracking collection update times and optimizing data fetching
 */

// Map collection names to their localStorage key prefixes
export const COLLECTION_KEYS = {
  USERS: "users_collection",
  PRODUCTS: "products_collection",
  STORE_INFO: "store_info_collection",
  GRN: "grn_collection",
  STORE: "store_collection",
  WAREHOUSE: "warehouse_collection",
  CUSTOMERS: "customers_collection",
  INVOICE: "invoices_collection"
};

interface CollectionTimestamps {
  lastUpdateTime: number;  // When the collection was last updated on the server
  lastFetchTime: number;   // When we last fetched from the server
}

/**
 * Save the last update time for a collection
 * @param collectionKey The collection identifier
 * @param timestamp The update timestamp (defaults to now)
 */
export const saveCollectionUpdateTime = (
  collectionKey: string,
  timestamp: number = Date.now()
): void => {
  try {
    const timeKey = `${collectionKey}_timestamps`;
    const existing = getCollectionTimestamps(collectionKey);
    
    const timestamps: CollectionTimestamps = {
      ...existing,
      lastUpdateTime: timestamp
    };
    
    localStorage.setItem(timeKey, JSON.stringify(timestamps));
  } catch (error) {
    console.error(`Error saving update time for ${collectionKey}:`, error);
  }
};

/**
 * Save the last fetch time for a collection
 * @param collectionKey The collection identifier
 * @param timestamp The fetch timestamp (defaults to now)
 */
export const saveCollectionFetchTime = (
  collectionKey: string,
  timestamp: number = Date.now()
): void => {
  try {
    const timeKey = `${collectionKey}_timestamps`;
    const existing = getCollectionTimestamps(collectionKey);
    
    const timestamps: CollectionTimestamps = {
      ...existing,
      lastFetchTime: timestamp
    };
    
    localStorage.setItem(timeKey, JSON.stringify(timestamps));
  } catch (error) {
    console.error(`Error saving fetch time for ${collectionKey}:`, error);
  }
};

/**
 * Get the timestamps for a collection
 * @param collectionKey The collection identifier
 * @returns The collection timestamps or default values if not found
 */
export const getCollectionTimestamps = (
  collectionKey: string
): CollectionTimestamps => {
  try {
    const timeKey = `${collectionKey}_timestamps`;
    const storedData = localStorage.getItem(timeKey);
    
    if (storedData) {
      return JSON.parse(storedData) as CollectionTimestamps;
    }
  } catch (error) {
    console.error(`Error getting timestamps for ${collectionKey}:`, error);
  }
  
  // Default timestamps if not found
  return {
    lastUpdateTime: 0,
    lastFetchTime: 0
  };
};

/**
 * Check if a collection needs to be refreshed from the server
 * @param collectionKey The collection identifier
 * @param maxAge Maximum cache age in milliseconds (default 5 minutes)
 * @returns Boolean indicating if collection should be fetched
 */
export const shouldFetchCollection = (
  collectionKey: string,
  maxAge: number = 5 * 60 * 1000
): boolean => {
  const { lastUpdateTime, lastFetchTime } = getCollectionTimestamps(collectionKey);
  
  // If the last update is more recent than our last fetch, we need fresh data
  if (lastUpdateTime > lastFetchTime) {
    return true;
  }
  
  // Check if cache is older than maxAge
  const now = Date.now();
  return (now - lastFetchTime) > maxAge;
};

/**
 * Mark a collection as updated (both on fetch and update operations)
 * @param collectionKey The collection identifier
 */
export const markCollectionUpdated = (collectionKey: string): void => {
  const now = Date.now();
  saveCollectionUpdateTime(collectionKey, now);
  saveCollectionFetchTime(collectionKey, now);
};
