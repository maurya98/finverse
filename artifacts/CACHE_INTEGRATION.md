# Cache Integration Guide - Site Platform

## Overview

The Site Platform services now include comprehensive Redis-based caching integration to optimize data fetching from the database. This document outlines the cache implementation, cache patterns, and best practices.

## Architecture

### Cache Package
- **Location**: `/libs/cache`
- **Purpose**: Provides a Redis client wrapper with methods for `get()`, `set()`, `del()`, and `keys()`
- **Requirements**: Redis server must be running (configured via `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` environment variables)

### Cache Helper Utility
- **Location**: `/apps/backend/siteplatform/src/utils/cacheHelper.util.ts`
- **Features**:
  - Cache key generation utilities
  - Cache-aside pattern implementation
  - Cache invalidation strategies
  - Configurable TTL (Time-To-Live) settings

## Cache Implementation

### Services with Caching

#### 1. **ClientAppService**
- **Cached operations**:
  - `getClientAppById(id)` - Caches individual app by ID
  - `getClientAppByIdWithRoutePermissions(id)` - Caches app with permissions
  - `getAllClientApps()` - Caches all apps list
- **Cache invalidation**: Invalidated on create, update, delete, and key rotation

#### 2. **InternalServiceService**
- **Cached operations**:
  - `getInternalServiceById(id)` - Caches individual service by ID
  - `getAllInternalServices()` - Caches all services list
- **Cache invalidation**: Invalidated on create, update, and delete

#### 3. **ClientPermissionService**
- **Cached operations**:
  - `getClientPermissionById(id)` - Caches individual permission by ID
  - `getAllClientPermissions()` - Caches all permissions list
- **Cache invalidation**: Invalidated on create, update, delete, and cascaded to client app permissions

#### 4. **RouteService**
- **Cached operations**:
  - `getRouteById(id)` - Caches individual route by ID
  - `getAllRoutes()` - Caches all routes list
- **Cache invalidation**: Invalidated on create, update, delete, and cascaded to permissions

#### 5. **DataExportService**
- **Cached operations**:
  - `exportAllData()` - Caches comprehensive export
  - `exportServices()` - Caches services with routes
  - `exportClientApps()` - Caches client apps with permissions
  - `exportClientAppRoutePermissions()` - Caches permissions for authorization
- **Cache invalidation**: Invalidated on any import operation

## Cache Patterns

### Cache-Aside Pattern
The implementation uses the **cache-aside** pattern:
1. Application tries to fetch from cache
2. If cache miss, fetch from database
3. Store result in cache with configured TTL
4. Return data to caller

```typescript
// Example from helper utility
export async function getOrFetchItem<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T | null> {
  const cached = await getCachedItem<T>(cacheKey);
  if (cached) return cached;
  
  const item = await fetcher();
  if (item) await setCachedItem(cacheKey, item, ttl);
  return item;
}
```

### Cache Key Naming
Format: `{prefix}:{id}` or `{prefix}:all` or custom patterns

**Key prefixes**:
- `clientApp` - Client applications
- `internalService` - Internal services
- `clientPermission` - Client permissions
- `route` - Service routes
- `dataExport` - Data exports

## Cache TTL Configuration

```typescript
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 900,     // 15 minutes
  LONG: 3600,      // 1 hour (default for most operations)
  VERY_LONG: 7200, // 2 hours
}
```

**Current Usage**:
- All services use `CACHE_TTL.LONG` (1 hour) for read operations
- Adjust based on data volatility and business requirements

## Cache Invalidation Strategies

### 1. Immediate Invalidation
Specific cache keys are invalidated immediately after write/delete operations:
```typescript
// Example: Single item invalidation
await invalidateCache([
  generateItemCacheKey(CACHE_KEYS.CLIENT_APP, id),
  generateItemCacheKey(`${CACHE_KEYS.CLIENT_APP}:with_permissions`, id),
  generateAllItemsCacheKey(CACHE_KEYS.CLIENT_APP),
]);
```

### 2. Pattern-Based Invalidation
Used for cascading invalidations across related entities:
```typescript
// Example: Invalidate all permissions when route is updated
await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_PERMISSION}:*`);
await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_APP}:with_permissions:*`);
```

### 3. Cascading Invalidation
When one entity affects another:
- **Route changes** → Invalidate permissions and client app permissions
- **Permission changes** → Invalidate client app permissions and export caches
- **Service changes** → Invalidate service routes and exports
- **Import operations** → Invalidate all caches

## Environment Setup

### Redis Connection
Required environment variables:
```bash
REDIS_HOST=localhost          # Default: localhost
REDIS_PORT=6379              # Default: 6379
REDIS_PASSWORD=              # Optional
```

### Installation
```bash
# Install dependencies
pnpm install

# (Redis should be running separately)
```

## Performance Benefits

1. **Reduced Database Load**: Frequently accessed data is served from memory
2. **Faster Response Times**: Redis reads are much faster than database queries
3. **Scalability**: Better performance under high concurrent request loads
4. **Cost Efficiency**: Fewer database queries = lower database load

## Monitoring and Debugging

### Cache Hit/Miss Analysis
To monitor cache effectiveness:
```typescript
// Check cache keys in Redis
const keys = await cache.redis.keys('*');
console.log('Cache keys:', keys);

// Get specific cache entry
const cachedData = await cache.get('clientApp:user-id-123');
```

### Clear Cache (if needed)
```typescript
// Clear specific key
await cache.del('clientApp:user-id-123');

// Clear pattern
const keys = await cache.redis.keys('clientApp:*');
if (keys.length > 0) await cache.del(keys);
```

## Best Practices

1. **TTL Management**: Adjust TTL based on data volatility
   - Static data (services): Use longer TTL (2+ hours)
   - Dynamic data (permissions): Use shorter TTL (15-30 minutes)

2. **Cache Invalidation**: Always invalidate related caches
   - Don't rely on TTL alone for data consistency
   - Use cascading invalidation for relational data

3. **Error Handling**: Cache operations include error handling
   - Failed cache operations don't break application
   - Gracefully falls back to database

4. **Monitoring**: Add logging for cache operations
   - Track hit/miss ratios
   - Monitor Redis memory usage
   - Set up alerts for cache errors

## Testing

### Unit Testing
Services with caching should test:
1. Initial database fetch (cache miss)
2. Cached response on subsequent calls
3. Cache invalidation after mutations

### Integration Testing
```typescript
// Example test pattern
const app = await service.getClientAppById('test-id');
const cachedApp = await service.getClientAppById('test-id');
expect(app).toEqual(cachedApp); // Should be same data

await service.updateClientApp({ id: 'test-id', name: 'Updated' });
const freshApp = await service.getClientAppById('test-id');
expect(freshApp.name).toBe('Updated'); // Cache should be invalidated
```

## Future Enhancements

1. **Cache Warming**: Pre-load frequently accessed data on startup
2. **Cache Metrics**: Add Prometheus metrics for cache performance
3. **Conditional Caching**: Cache based on data size/complexity
4. **Cache Versioning**: Version cache to handle schema changes
5. **Event-Driven Invalidation**: Use event bus for cross-service invalidation

## Troubleshooting

### Cache Not Working
1. Verify Redis connection: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
2. Check Redis is running: `redis-cli ping`
3. Review logs for cache operation errors

### Memory Issues
1. Monitor Redis memory usage
2. Adjust TTL values to reduce cache size
3. Implement cache eviction policies in Redis

### Data Consistency
1. Ensure all mutations properly invalidate cache
2. Check cascading invalidation for related entities
3. Monitor cache hit/miss ratios

## References

- [Redis Node.js Client](https://github.com/redis/node-redis)
- [Cache-Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Cache Invalidation](https://en.wikipedia.org/wiki/Cache_invalidation)
