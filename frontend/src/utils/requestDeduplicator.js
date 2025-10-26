// Request deduplication utility to prevent duplicate concurrent API calls
// This helps avoid 429 errors by ensuring the same request isn't made multiple times simultaneously

class RequestDeduplicator {
  constructor() {
    // Store pending requests: { cacheKey: Promise }
    this.pendingRequests = new Map();
    // Store request timestamps for cleanup
    this.requestTimestamps = new Map();
    // Cleanup interval (remove old entries every 5 minutes)
    this.startCleanup();
  }

  /**
   * Generate a cache key from request parameters
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Execute a request with deduplication
   * If the same request is already in progress, return that promise instead
   */
  async dedupe(endpoint, params, requestFunction) {
    const key = this.generateKey(endpoint, params);

    // If this exact request is already in progress, return the existing promise
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Deduplicating request: ${endpoint}`);
      return this.pendingRequests.get(key);
    }

    // Start a new request
    console.log(`✨ New request: ${endpoint}`);
    const requestPromise = requestFunction()
      .then((result) => {
        // Clean up after successful completion
        this.pendingRequests.delete(key);
        this.requestTimestamps.delete(key);
        return result;
      })
      .catch((error) => {
        // Clean up after error
        this.pendingRequests.delete(key);
        this.requestTimestamps.delete(key);
        throw error;
      });

    // Store the pending request
    this.pendingRequests.set(key, requestPromise);
    this.requestTimestamps.set(key, Date.now());

    return requestPromise;
  }

  /**
   * Clear all pending requests (useful for logout or route changes)
   */
  clear() {
    console.log('🧹 Clearing all pending requests');
    this.pendingRequests.clear();
    this.requestTimestamps.clear();
  }

  /**
   * Remove stale requests (older than 2 minutes)
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 2 * 60 * 1000; // 2 minutes

    for (const [key, timestamp] of this.requestTimestamps.entries()) {
      if (now - timestamp > maxAge) {
        console.log(`🧹 Cleaning up stale request: ${key}`);
        this.pendingRequests.delete(key);
        this.requestTimestamps.delete(key);
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      oldestRequest: this.requestTimestamps.size > 0
        ? Math.min(...Array.from(this.requestTimestamps.values()))
        : null
    };
  }
}

// Create singleton instance
const deduplicator = new RequestDeduplicator();

export default deduplicator;

/**
 * Usage Example:
 * 
 * import deduplicator from '@/utils/requestDeduplicator';
 * 
 * // In your API call:
 * const fetchUserData = (userId) => {
 *   return deduplicator.dedupe(
 *     '/api/users',
 *     { userId },
 *     () => api.get(`/api/users/${userId}`)
 *   );
 * };
 * 
 * // Multiple components calling this simultaneously will only make ONE request
 * fetchUserData(123); // Makes API call
 * fetchUserData(123); // Returns the same promise (deduplicated)
 * fetchUserData(123); // Returns the same promise (deduplicated)
 */
