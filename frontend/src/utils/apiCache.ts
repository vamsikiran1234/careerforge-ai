/**
 * Simple API request cache to prevent duplicate simultaneous requests
 * This helps avoid 429 (Too Many Requests) errors
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  promise?: Promise<any>;
}

class APICache {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private defaultTTL: number = 60000; // 1 minute default TTL

  /**
   * Get cached data or fetch if not available/expired
   * @param key Cache key (usually the API endpoint)
   * @param fetcher Function that returns a Promise with the data
   * @param ttl Time to live in milliseconds (default: 60000ms = 1min)
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached data if still valid
    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }

    // If there's a pending request for this key, wait for it
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Otherwise, make a new request
    const promise = fetcher()
      .then((data) => {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
        });
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Invalidate all cache keys matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (pattern.test(key)) {
        this.cache.delete(key);
        this.pendingRequests.delete(key);
      }
    });
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.defaultTTL * 2) {
        this.cache.delete(key);
      }
    });
  }
}

// Export singleton instance
export const apiCache = new APICache();

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 300000);
}

/**
 * Helper function to create cache keys from API URLs and params
 */
export function createCacheKey(url: string, params?: Record<string, any>): string {
  if (!params) return url;
  const queryString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${url}?${queryString}`;
}

/**
 * Usage Example:
 * 
 * import { apiCache, createCacheKey } from '@/utils/apiCache';
 * 
 * // In your component:
 * const fetchMentorProfile = async () => {
 *   const cacheKey = createCacheKey('/api/mentorship/profile');
 *   return apiCache.get(
 *     cacheKey,
 *     () => axios.get('/api/mentorship/profile'),
 *     300000 // 5 minutes TTL
 *   );
 * };
 * 
 * // Invalidate cache when data changes:
 * apiCache.invalidate('/api/mentorship/profile');
 * 
 * // Invalidate multiple related caches:
 * apiCache.invalidatePattern(/^\/api\/mentorship\//);
 */
