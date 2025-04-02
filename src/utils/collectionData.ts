export interface CollectionData<T> {
    collection: string,
    collectionKey: string,
    cacheKey: string,
    document?: T,
    documents?: T[]
}