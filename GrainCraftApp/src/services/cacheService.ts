/**
 * Cache Service
 * Handles data caching and offline support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cachePrefix = 'gc_cache_';
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  /**
   * Set cache with TTL
   */
  async set<T>(key: string, data: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(`${this.cachePrefix}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error(`Failed to cache ${key}:`, error);
    }
  }

  /**
   * Get cached data if not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.cachePrefix}${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const age = Date.now() - entry.timestamp;

      // Check if expired
      if (age > entry.ttl) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Failed to retrieve cache ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  async exists(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.cachePrefix}${key}`);
    } catch (error) {
      console.error(`Failed to delete cache ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Cache products
   */
  async cacheProducts(products: any[], ttl: number = 10 * 60 * 1000): Promise<void> {
    await this.set('products', products, ttl);
  }

  /**
   * Get cached products
   */
  async getCachedProducts(): Promise<any[] | null> {
    return this.get('products');
  }

  /**
   * Cache orders
   */
  async cacheOrders(orders: any[], ttl: number = 5 * 60 * 1000): Promise<void> {
    await this.set('orders', orders, ttl);
  }

  /**
   * Get cached orders
   */
  async getCachedOrders(): Promise<any[] | null> {
    return this.get('orders');
  }

  /**
   * Cache addresses
   */
  async cacheAddresses(addresses: any[], ttl: number = 30 * 60 * 1000): Promise<void> {
    await this.set('addresses', addresses, ttl);
  }

  /**
   * Get cached addresses
   */
  async getCachedAddresses(): Promise<any[] | null> {
    return this.get('addresses');
  }

  /**
   * Cache user profile
   */
  async cacheUserProfile(profile: any, ttl: number = 60 * 60 * 1000): Promise<void> {
    await this.set('user_profile', profile, ttl);
  }

  /**
   * Get cached user profile
   */
  async getCachedUserProfile(): Promise<any | null> {
    return this.get('user_profile');
  }

  /**
   * Cache config
   */
  async cacheConfig(config: any, ttl: number = 60 * 60 * 1000): Promise<void> {
    await this.set('app_config', config, ttl);
  }

  /**
   * Get cached config
   */
  async getCachedConfig(): Promise<any | null> {
    return this.get('app_config');
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      let totalSize = 0;

      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * Clear old cache entries
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          try {
            const entry: CacheEntry<any> = JSON.parse(cached);
            const age = Date.now() - entry.timestamp;
            if (age > entry.ttl) {
              await AsyncStorage.removeItem(key);
            }
          } catch (e) {
            // Invalid cache entry, remove it
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }
}

export const cacheService = new CacheService();
