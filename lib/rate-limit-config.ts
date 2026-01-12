export interface RateLimitRule {
  windowMs: number;       // Window size in milliseconds
  maxRequests: number;    // Max requests per window
}

export interface EndpointConfig {
  pattern: RegExp;
  authenticated: RateLimitRule;
  anonymous: RateLimitRule;
}

// Default rate limits
export const DEFAULT_LIMITS: { authenticated: RateLimitRule; anonymous: RateLimitRule } = {
  authenticated: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 100,       // 100 requests per minute
  },
  anonymous: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 30,        // 30 requests per minute
  },
};

// Endpoint-specific rate limits (more restrictive for expensive operations)
export const ENDPOINT_CONFIGS: EndpointConfig[] = [
  // Orders endpoint - expensive, create order involves multiple DB operations
  {
    pattern: /^\/api\/orders/,
    authenticated: { windowMs: 60 * 1000, maxRequests: 20 },
    anonymous: { windowMs: 60 * 1000, maxRequests: 5 },
  },
  // Knowledge endpoint - may involve AI or search operations
  {
    pattern: /^\/api\/knowledge/,
    authenticated: { windowMs: 60 * 1000, maxRequests: 30 },
    anonymous: { windowMs: 60 * 1000, maxRequests: 10 },
  },
  // MCP endpoints - potentially expensive
  {
    pattern: /^\/api\/mcp/,
    authenticated: { windowMs: 60 * 1000, maxRequests: 50 },
    anonymous: { windowMs: 60 * 1000, maxRequests: 15 },
  },
  // Cart operations
  {
    pattern: /^\/api\/cart/,
    authenticated: { windowMs: 60 * 1000, maxRequests: 60 },
    anonymous: { windowMs: 60 * 1000, maxRequests: 20 },
  },
  // Products - read-heavy, more permissive
  {
    pattern: /^\/api\/products/,
    authenticated: { windowMs: 60 * 1000, maxRequests: 200 },
    anonymous: { windowMs: 60 * 1000, maxRequests: 100 },
  },
];

// Whitelisted IPs that bypass rate limiting
export const WHITELISTED_IPS: string[] = [
  '127.0.0.1',
  '::1',
  // Add trusted IPs here
  // process.env.TRUSTED_IPS?.split(',') || []
];

// Load additional whitelisted IPs from environment
export function getWhitelistedIPs(): string[] {
  const envIPs = process.env.RATE_LIMIT_WHITELIST?.split(',').map(ip => ip.trim()) || [];
  return [...WHITELISTED_IPS, ...envIPs];
}

export function getEndpointConfig(path: string): { authenticated: RateLimitRule; anonymous: RateLimitRule } {
  for (const config of ENDPOINT_CONFIGS) {
    if (config.pattern.test(path)) {
      return {
        authenticated: config.authenticated,
        anonymous: config.anonymous,
      };
    }
  }
  return DEFAULT_LIMITS;
}
