import cache from "@finverse/cache";
import { logger } from "@finverse/logger";

/**
 * Cache Helper Utility
 * Provides helper functions for cache key generation and cache operations
 */

// Cache key prefixes
export const CACHE_KEYS = {
  CLIENT_APP: "clientApp",
  INTERNAL_SERVICE: "internalService",
  CLIENT_PERMISSION: "clientPermission",
  ROUTE: "route",
  ALL_ITEMS: "all",
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 900, // 15 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 7200, // 2 hours
} as const;

/**
 * Generate a cache key for a single item by ID
 */
export function generateItemCacheKey(
  prefix: string,
  id: string
): string {
  return `${prefix}:${id}`;
}

/**
 * Generate a cache key for all items of a type
 */
export function generateAllItemsCacheKey(prefix: string): string {
  return `${prefix}:${CACHE_KEYS.ALL_ITEMS}`;
}

/**
 * Generate a cache key for a filtered/related query
 */
export function generateQueryCacheKey(prefix: string, ...params: string[]): string {
  return `${prefix}:${params.join(":")}`;
}

/**
 * Get cached item by ID
 */
export async function getCachedItem<T>(key: string): Promise<T | null> {
  try {
    const cached = await cache.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    logger.error({ error }, `Error retrieving cache for key ${key}`);
    return null;
  }
}

/**
 * Set item in cache
 */
export async function setCachedItem<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  try {
    await cache.set(key, value, ttl);
  } catch (error) {
    logger.error({ error }, `Error setting cache for key ${key}`);
  }
}

/**
 * Invalidate cache by key pattern or individual key
 */
export async function invalidateCache(keys: string[]): Promise<void> {
  try {
    for (const key of keys) {
      await cache.del(key);
    }
  } catch (error) {
    logger.error({ error }, "Error invalidating cache");
  }
}

/**
 * Invalidate all cache keys matching a pattern
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await cache.redis.keys(pattern);
    if (keys.length > 0) {
      for (const key of keys) {
        await cache.del(key);
      }
    }
  } catch (error) {
    logger.error({ error }, `Error invalidating cache pattern ${pattern}`);
  }
}

/**
 * Get or fetch an item (cache-aside pattern)
 */
export async function getOrFetchItem<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T | null> {
  try {
    // Try to get from cache first
    const cached = await getCachedItem<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const item = await fetcher();

    // Store in cache if item exists
    if (item) {
      await setCachedItem(cacheKey, item, ttl);
    }

    return item;
  } catch (error) {
    logger.error({ error }, `Error in getOrFetchItem for key ${cacheKey}`);
    return null;
  }
}

/**
 * Get or fetch multiple items
 */
export async function getOrFetchMultiple<T>(
  cacheKey: string,
  fetcher: () => Promise<T[]>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T[]> {
  try {
    // Try to get from cache first
    const cached = await getCachedItem<T[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const items = await fetcher();

    // Store in cache
    if (items && items.length > 0) {
      await setCachedItem(cacheKey, items, ttl);
    }

    return items;
  } catch (error) {
    logger.error({ error }, `Error in getOrFetchMultiple for key ${cacheKey}`);
    return [];
  }
}
