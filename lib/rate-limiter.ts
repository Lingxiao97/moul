import { RateLimitRule, getEndpointConfig, getWhitelistedIPs } from './rate-limit-config';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  limit: number;
  current: number;
}

// In-memory storage for Edge Runtime compatibility
// Note: This resets on cold starts. For production, use Upstash Redis or similar Edge-compatible store.
const requestStore = new Map<string, number[]>();
const violationLog: Array<{ identifier: string; path: string; timestamp: number }> = [];
const statsStore = new Map<string, { total: number; blocked: number; allowed: number }>();

/**
 * Clean up old entries from the request store
 */
function cleanupOldEntries(key: string, windowStart: number): void {
  const timestamps = requestStore.get(key) || [];
  const filtered = timestamps.filter(ts => ts > windowStart);
  if (filtered.length > 0) {
    requestStore.set(key, filtered);
  } else {
    requestStore.delete(key);
  }
}

/**
 * Sliding Window Rate Limiter (In-Memory for Edge Runtime)
 */
export function checkRateLimit(
  identifier: string,
  path: string,
  isAuthenticated: boolean
): RateLimitResult {
  const config = getEndpointConfig(path);
  const rule = isAuthenticated ? config.authenticated : config.anonymous;
  
  const now = Date.now();
  const windowStart = now - rule.windowMs;
  const key = `${identifier}:${path}`;
  
  // Clean up old entries
  cleanupOldEntries(key, windowStart);
  
  const timestamps = requestStore.get(key) || [];
  const currentCount = timestamps.length;
  
  // Track stats
  const statsKey = identifier;
  const stats = statsStore.get(statsKey) || { total: 0, blocked: 0, allowed: 0 };
  stats.total++;
  
  if (currentCount < rule.maxRequests) {
    // Add this request
    timestamps.push(now);
    requestStore.set(key, timestamps);
    stats.allowed++;
    statsStore.set(statsKey, stats);
    
    return {
      allowed: true,
      remaining: rule.maxRequests - currentCount - 1,
      resetAt: now + rule.windowMs,
      limit: rule.maxRequests,
      current: currentCount + 1,
    };
  }
  
  // Rate limit exceeded
  stats.blocked++;
  statsStore.set(statsKey, stats);
  
  // Log violation
  violationLog.push({ identifier, path, timestamp: now });
  console.warn(`[RateLimit] Violation: identifier=${identifier}, path=${path}, timestamp=${new Date(now).toISOString()}`);
  
  // Keep only last 1000 violations in memory
  if (violationLog.length > 1000) {
    violationLog.shift();
  }
  
  // Calculate retry-after based on oldest request in window
  const oldestTimestamp = timestamps[0] || now;
  const retryAfter = Math.ceil((oldestTimestamp + rule.windowMs - now) / 1000);
  
  return {
    allowed: false,
    remaining: 0,
    resetAt: now + retryAfter * 1000,
    retryAfter: Math.max(1, retryAfter),
    limit: rule.maxRequests,
    current: currentCount,
  };
}

/**
 * Check if an IP is whitelisted
 */
export function isWhitelisted(ip: string): boolean {
  const whitelist = getWhitelistedIPs();
  return whitelist.includes(ip);
}

/**
 * Get top requesters for dashboard
 */
export function getTopRequesters(limit: number = 20): Array<{
  identifier: string;
  total: number;
  blocked: number;
  allowed: number;
}> {
  return Array.from(statsStore.entries())
    .map(([identifier, data]) => ({ identifier, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Get violation patterns
 */
export function getViolationPatterns(): Array<{
  identifier: string;
  violations: number;
  recentPaths: string[];
}> {
  const patterns = new Map<string, { count: number; paths: Set<string> }>();
  
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const v of violationLog) {
    if (v.timestamp > oneDayAgo) {
      const existing = patterns.get(v.identifier) || { count: 0, paths: new Set<string>() };
      existing.count++;
      existing.paths.add(v.path);
      patterns.set(v.identifier, existing);
    }
  }
  
  return Array.from(patterns.entries())
    .map(([identifier, data]) => ({
      identifier,
      violations: data.count,
      recentPaths: Array.from(data.paths),
    }))
    .sort((a, b) => b.violations - a.violations);
}

/**
 * Get overall stats
 */
export function getOverallStats(): {
  totalRequests: number;
  blockedRequests: number;
  uniqueIdentifiers: number;
} {
  let totalRequests = 0;
  let blockedRequests = 0;
  
  const values = Array.from(statsStore.values());
  for (const stats of values) {
    totalRequests += stats.total;
    blockedRequests += stats.blocked;
  }
  
  return {
    totalRequests,
    blockedRequests,
    uniqueIdentifiers: statsStore.size,
  };
}

/**
 * Clear all rate limit data (for testing)
 */
export function clearAllData(): void {
  requestStore.clear();
  violationLog.length = 0;
  statsStore.clear();
}
