/**
 * Simple session cache utility to prevent unnecessary API calls when switching tabs.
 * Uses sessionStorage for persistence across component mounts within the same session.
 *
 * Cache entries expire after CACHE_TTL_MS milliseconds.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache expiry

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Get cached data if it exists and hasn't expired
 */
export function getCachedData<T>(key: string): T | null {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (now - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn(`Cache read error for ${key}:`, error);
    return null;
  }
}

/**
 * Set cached data with current timestamp
 */
export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn(`Cache write error for ${key}:`, error);
  }
}

/**
 * Clear specific cache entry
 */
export function clearCachedData(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Cache clear error for ${key}:`, error);
  }
}

/**
 * Cache keys used in the application
 */
export const CACHE_KEYS = {
  CASE_HISTORY: 'botilito_case_history',
  HUMAN_VERIFICATION: 'botilito_human_verification',
  HUMAN_VERIFICATION_STATS: 'botilito_human_verification_stats',
} as const;
