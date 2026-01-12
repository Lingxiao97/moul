// JWT Authentication Configuration

export const AUTH_CONFIG = {
  // JWT Secret - In production, use environment variables
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  REFRESH_SECRET: process.env.REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  
  // Token expiration times
  ACCESS_TOKEN_EXPIRES_IN: 60 * 60, // 1 hour in seconds
  REFRESH_TOKEN_EXPIRES_IN: 30 * 24 * 60 * 60, // 30 days in seconds
  
  // Token configuration
  TOKEN_ISSUER: 'knowledge-base-api',
  TOKEN_AUDIENCE: 'knowledge-base-client',
  
  // API Key configuration
  API_KEY_HEADER: 'x-api-key',
  
  // Cookie configuration (for refresh tokens)
  REFRESH_TOKEN_COOKIE: 'refresh_token',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: 'strict' as const,
  
  // Blacklist cleanup interval (in milliseconds)
  BLACKLIST_CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
} as const;

// Protected routes configuration
// Routes not listed here are public by default
export const PROTECTED_ROUTES: Array<{
  pattern: RegExp;
  methods?: string[];
  roles?: string[];
}> = [
  // Admin only routes
  { pattern: /^\/api\/admin/, roles: ['admin'] },
  
  // Moderator and admin routes
  { pattern: /^\/api\/knowledge$/, methods: ['POST', 'PUT', 'DELETE'], roles: ['admin', 'moderator'] },
  { pattern: /^\/api\/knowledge\/\d+$/, methods: ['PUT', 'DELETE'], roles: ['admin', 'moderator'] },
  
  // Authenticated user routes
  { pattern: /^\/api\/orders/, roles: ['admin', 'moderator', 'user'] },
  { pattern: /^\/api\/cart/, roles: ['admin', 'moderator', 'user'] },
  
  // MCP server management (admin only)
  { pattern: /^\/api\/mcp/, methods: ['POST', 'PUT', 'DELETE'], roles: ['admin'] },
];

// Public routes that skip authentication
export const PUBLIC_ROUTES: RegExp[] = [
  /^\/api\/auth\/login$/,
  /^\/api\/auth\/register$/,
  /^\/api\/auth\/refresh$/,
  /^\/api\/products/,
  /^\/api\/categories/,
  /^\/api\/rate-limit/,
  /^\/api\/knowledge$/, // GET is public
];
