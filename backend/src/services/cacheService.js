/**
 * Multi-tier caching service to reduce AI API calls
 * 
 * Tier Strategy:
 * - HOT: 5 minutes - Frequent requests (chat, quick lookups)
 * - WARM: 30 minutes - Analysis results (career paths, recommendations)
 * - COLD: 24 hours - Stable data (resource lists, static content)
 * 
 * Expected Impact: 80-90% reduction in API calls
 */

const NodeCache = require('node-cache');
const crypto = require('crypto');

// Multi-tier caching with different TTLs
const caches = {
  // Short-term cache for frequent requests (5 minutes)
  hot: new NodeCache({ 
    stdTTL: 300,      // 5 minutes
    checkperiod: 60,  // Check for expired keys every minute
    useClones: false  // Performance optimization
  }),
  
  // Medium-term cache for analysis results (30 minutes)
  warm: new NodeCache({ 
    stdTTL: 1800,     // 30 minutes
    checkperiod: 300, // Check every 5 minutes
    useClones: false
  }),
  
  // Long-term cache for stable data (24 hours)
  cold: new NodeCache({ 
    stdTTL: 86400,    // 24 hours
    checkperiod: 3600, // Check every hour
    useClones: false
  })
};

// Cache statistics
const stats = {
  hits: 0,
  misses: 0,
  errors: 0,
  totalSaved: 0 // Estimated API calls saved
};

/**
 * Generate consistent cache key from data
 * @param {string} type - Cache type identifier
 * @param {object} data - Data to hash
 * @returns {string} Cache key
 */
function generateCacheKey(type, data) {
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  const hash = crypto.createHash('sha256')
    .update(dataString)
    .digest('hex')
    .substring(0, 16); // Use first 16 chars for shorter keys
  return `${type}:${hash}`;
}

/**
 * Wrap an AI function with caching
 * @param {string} type - Operation type (e.g., 'career_analysis', 'chat_response')
 * @param {string} cacheType - Cache tier: 'hot', 'warm', or 'cold'
 * @param {object} keyData - Data to generate cache key from
 * @param {function} aiFunction - Async function that calls AI API
 * @returns {Promise<any>} Cached or fresh result
 */
async function withCache(type, cacheType, keyData, aiFunction) {
  const key = generateCacheKey(type, keyData);
  const cache = caches[cacheType];
  
  if (!cache) {
    console.error(`❌ Invalid cache type: ${cacheType}`);
    return await aiFunction();
  }
  
  // Try to get from cache
  const cached = cache.get(key);
  if (cached !== undefined) {
    stats.hits++;
    stats.totalSaved++;
    console.log(`✅ Cache HIT (${cacheType}): ${type} [${stats.hits}/${stats.hits + stats.misses} = ${Math.round(stats.hits / (stats.hits + stats.misses) * 100)}%]`);
    return cached;
  }
  
  // Cache miss - call AI
  stats.misses++;
  console.log(`❌ Cache MISS (${cacheType}): ${type} - Calling AI API`);
  
  try {
    const result = await aiFunction();
    
    // Store in cache
    cache.set(key, result);
    console.log(`💾 Cached result for: ${type} (TTL: ${cache.options.stdTTL}s)`);
    
    return result;
  } catch (error) {
    stats.errors++;
    console.error(`❌ Error in cached function ${type}:`, error.message);
    throw error;
  }
}

/**
 * Invalidate cache for specific type
 * @param {string} type - Type to invalidate
 * @param {string} cacheType - Cache tier (optional, invalidates all if not specified)
 */
function invalidateCache(type, cacheType = null) {
  if (cacheType) {
    const cache = caches[cacheType];
    if (cache) {
      const keys = cache.keys();
      const deleted = keys.filter(key => key.startsWith(`${type}:`));
      deleted.forEach(key => cache.del(key));
      console.log(`🗑️ Invalidated ${deleted.length} keys for ${type} in ${cacheType} cache`);
    }
  } else {
    // Invalidate from all caches
    Object.keys(caches).forEach(tier => invalidateCache(type, tier));
  }
}

/**
 * Clear specific cache tier
 * @param {string} cacheType - Cache tier to clear
 */
function clearCache(cacheType = null) {
  if (cacheType) {
    const cache = caches[cacheType];
    if (cache) {
      const count = cache.keys().length;
      cache.flushAll();
      console.log(`🗑️ Cleared ${count} keys from ${cacheType} cache`);
    }
  } else {
    // Clear all caches
    Object.keys(caches).forEach(tier => {
      const count = caches[tier].keys().length;
      caches[tier].flushAll();
      console.log(`🗑️ Cleared ${count} keys from ${tier} cache`);
    });
  }
}

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
function getStats() {
  const hitRate = stats.hits + stats.misses > 0 
    ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) 
    : 0;
  
  return {
    hits: stats.hits,
    misses: stats.misses,
    errors: stats.errors,
    hitRate: `${hitRate}%`,
    totalSaved: stats.totalSaved,
    estimatedCostSaved: `$${(stats.totalSaved * 0.001).toFixed(2)}`, // Rough estimate
    caches: {
      hot: {
        keys: caches.hot.keys().length,
        stats: caches.hot.getStats()
      },
      warm: {
        keys: caches.warm.keys().length,
        stats: caches.warm.getStats()
      },
      cold: {
        keys: caches.cold.keys().length,
        stats: caches.cold.getStats()
      }
    }
  };
}

/**
 * Log cache stats periodically
 */
function startStatsLogger(intervalMs = 300000) { // Every 5 minutes
  setInterval(() => {
    const currentStats = getStats();
    console.log('\n📊 ===== CACHE STATISTICS =====');
    console.log(`   Hit Rate: ${currentStats.hitRate}`);
    console.log(`   Total Hits: ${currentStats.hits}`);
    console.log(`   Total Misses: ${currentStats.misses}`);
    console.log(`   API Calls Saved: ${currentStats.totalSaved}`);
    console.log(`   Hot Cache: ${currentStats.caches.hot.keys} keys`);
    console.log(`   Warm Cache: ${currentStats.caches.warm.keys} keys`);
    console.log(`   Cold Cache: ${currentStats.caches.cold.keys} keys`);
    console.log('================================\n');
  }, intervalMs);
}

// Start logging stats every 5 minutes
startStatsLogger();

module.exports = {
  withCache,
  invalidateCache,
  clearCache,
  getStats,
  caches,
  generateCacheKey
};
