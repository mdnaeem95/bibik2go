// src/lib/cache.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  ttlMinutes?: number;
  maxEntries?: number;
}

class AppCache {
  private cache: LRUCache<string, any>;

  constructor(options: CacheOptions = {}) {
    const { ttlMinutes = 5, maxEntries = 100 } = options;
    
    this.cache = new LRUCache<string, any>({
      max: maxEntries,
      ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
    });
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, data);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // The main method for cache-or-fetch pattern
  async getOrSet<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      console.log(`📈 Cache HIT: ${key}`);
      return cached;
    }

    console.log(`📊 Cache MISS: ${key} - fetching from source...`);
    try {
      const data = await fetcher();
      this.set(key, data);
      return data;
    } catch (error) {
      console.error(`❌ Cache fetch failed for ${key}:`, error);
      throw error;
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      calculatedSize: this.cache.calculatedSize,
      remainingTTL: (key: string) => this.cache.getRemainingTTL(key),
    };
  }

  // Invalidate multiple keys by pattern
  invalidatePattern(pattern: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`🗑️ Invalidated ${count} cache entries matching "${pattern}"`);
    return count;
  }
}

// Create global cache instance
export const cache = new AppCache({ ttlMinutes: 5, maxEntries: 100 });

// Cache key constants
export const CacheKeys = {
  HELPERS: 'helpers',
  USERS: 'users',
  INCIDENTS: 'incidents',
  DASHBOARD_METRICS: 'dashboard-metrics',
  HELPER_INCIDENTS: (helperId: string) => `helper-incidents-${helperId}`,
  HELPER_PROFILE: (helperId: string) => `helper-profile-${helperId}`,
} as const;

// Convenience functions for common operations
export const cacheHelpers = {
  invalidateAll: () => {
    cache.clear();
    console.log('🗑️ All cache cleared');
  },
  
  invalidateHelpers: () => {
    cache.delete(CacheKeys.HELPERS);
    cache.delete(CacheKeys.DASHBOARD_METRICS);
    cache.invalidatePattern('helper-');
    console.log('🗑️ Helper-related cache cleared');
  },
  
  invalidateUsers: () => {
    cache.delete(CacheKeys.USERS);
    cache.delete(CacheKeys.DASHBOARD_METRICS);
    console.log('🗑️ User-related cache cleared');
  },
  
  invalidateIncidents: () => {
    cache.delete(CacheKeys.INCIDENTS);
    cache.invalidatePattern('helper-incidents-');
    console.log('🗑️ Incident-related cache cleared');
  },
};

// Export for debugging
export const getCacheStats = () => cache.getStats();   