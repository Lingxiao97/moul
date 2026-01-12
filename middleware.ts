import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, isWhitelisted, RateLimitResult } from './lib/rate-limiter';
import {
  verifyAccessTokenEdge,
  extractTokenFromHeader,
  isTokenBlacklistedEdge,
  validateApiKeyEdge,
  extractApiKeyFromHeader,
} from './lib/auth/jwt-edge';
import { AUTH_CONFIG, PUBLIC_ROUTES, PROTECTED_ROUTES } from './lib/auth/config';
import { AuthUser, UserRole } from './lib/auth/types';

// Extract client IP from request
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP (when behind a proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection IP (may not be available in all environments)
  return request.ip || '127.0.0.1';
}

// Simple hash function for tokens/keys
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Check if a route is public (no authentication required)
function isPublicRoute(path: string): boolean {
  for (const pattern of PUBLIC_ROUTES) {
    if (pattern.test(path)) {
      return true;
    }
  }
  return false;
}

// Check if user has permission to access a route
function checkRoutePermission(
  path: string,
  method: string,
  user: AuthUser | null
): { allowed: boolean; reason?: string } {
  // Check if route is public
  if (isPublicRoute(path)) {
    return { allowed: true };
  }

  // No user = no access to protected routes
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Role hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    admin: 100,
    moderator: 50,
    user: 10,
    guest: 0,
  };

  // Find matching route configuration
  for (const route of PROTECTED_ROUTES) {
    if (route.pattern.test(path)) {
      // Check method restriction
      if (route.methods && !route.methods.includes(method.toUpperCase())) {
        continue;
      }

      // Check role restriction
      if (route.roles) {
        const hasPermission = route.roles.some(
          role => roleHierarchy[user.role] >= roleHierarchy[role as UserRole]
        );
        if (!hasPermission) {
          return {
            allowed: false,
            reason: `Insufficient permissions. Required roles: ${route.roles.join(', ')}`,
          };
        }
      }

      return { allowed: true };
    }
  }

  // No specific protection defined - allow authenticated users
  return { allowed: true };
}

// Authenticate request and return user info
async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
  errorCode?: string;
}> {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Check if route is public
  if (isPublicRoute(path)) {
    return { success: true };
  }

  // Try JWT authentication first
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    // Check if token is blacklisted
    if (isTokenBlacklistedEdge(token)) {
      return {
        success: false,
        error: 'Token has been revoked',
        errorCode: 'TOKEN_BLACKLISTED',
      };
    }

    // Verify the token
    const result = await verifyAccessTokenEdge(token);

    if (result.valid && result.payload) {
      const user: AuthUser = {
        userId: result.payload.userId,
        role: result.payload.role,
        authMethod: 'jwt',
      };

      // Check route permissions
      const permission = checkRoutePermission(path, method, user);
      if (!permission.allowed) {
        return {
          success: false,
          error: permission.reason,
          errorCode: 'INSUFFICIENT_PERMISSIONS',
        };
      }

      return { success: true, user };
    }

    // Token verification failed
    return {
      success: false,
      error: result.error === 'EXPIRED'
        ? 'Token has expired. Please refresh your token or login again.'
        : 'Invalid token',
      errorCode: result.error === 'EXPIRED' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
    };
  }

  // Try API key authentication
  const apiKey = extractApiKeyFromHeader(request.headers);

  if (apiKey) {
    const user = validateApiKeyEdge(apiKey);

    if (user) {
      // Check route permissions
      const permission = checkRoutePermission(path, method, user);
      if (!permission.allowed) {
        return {
          success: false,
          error: permission.reason,
          errorCode: 'INSUFFICIENT_PERMISSIONS',
        };
      }

      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid API key',
      errorCode: 'API_KEY_INVALID',
    };
  }

  // No authentication provided
  return {
    success: false,
    error: 'Authentication required. Please provide a valid JWT token or API key.',
    errorCode: 'TOKEN_MISSING',
  };
}

// Create authentication error response
function createAuthErrorResponse(error: string, errorCode: string): NextResponse {
  const statusMap: Record<string, number> = {
    TOKEN_MISSING: 401,
    TOKEN_INVALID: 401,
    TOKEN_EXPIRED: 401,
    TOKEN_BLACKLISTED: 401,
    API_KEY_INVALID: 401,
    INSUFFICIENT_PERMISSIONS: 403,
    USER_NOT_FOUND: 404,
  };

  return NextResponse.json(
    {
      error: errorCode,
      message: error,
    },
    { status: statusMap[errorCode] || 401 }
  );
}

// Create rate limit response with proper headers
function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please slow down your requests.',
      retryAfter: result.retryAfter,
      limit: result.limit,
      remaining: result.remaining,
      resetAt: new Date(result.resetAt).toISOString(),
    },
    { status: 429 }
  );
  
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());
  response.headers.set('Retry-After', (result.retryAfter || 60).toString());
  
  return response;
}

// Add rate limit headers to successful response
function addRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only apply middleware to API routes
  if (!path.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Skip authentication for rate-limit dashboard API
  if (path.startsWith('/api/rate-limit')) {
    return NextResponse.next();
  }

  // ============================================
  // Step 1: JWT/API Key Authentication
  // ============================================
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    // Only return auth error if not a public route
    if (authResult.errorCode) {
      return createAuthErrorResponse(
        authResult.error || 'Authentication failed',
        authResult.errorCode
      );
    }
  }
  
  // ============================================
  // Step 2: Rate Limiting
  // ============================================
  const clientIP = getClientIP(request);
  
  // Check whitelist
  if (isWhitelisted(clientIP)) {
    // If authenticated, attach user info to response headers
    const response = NextResponse.next();
    if (authResult.user) {
      response.headers.set('X-User-Id', authResult.user.userId);
      response.headers.set('X-User-Role', authResult.user.role);
      response.headers.set('X-Auth-Method', authResult.user.authMethod);
    }
    return response;
  }
  
  // Get identifier (user ID or IP) for rate limiting
  const identifier = authResult.user?.userId 
    ? `user:${authResult.user.userId}` 
    : `ip:${clientIP}`;
  const isAuthenticated = !!authResult.user;
  
  try {
    const result = await checkRateLimit(identifier, path, isAuthenticated);
    
    if (!result.allowed) {
      return createRateLimitResponse(result);
    }
    
    // Continue with the request, adding rate limit headers
    const response = NextResponse.next();
    addRateLimitHeaders(response, result);
    
    // Attach user info to response headers for downstream use
    if (authResult.user) {
      response.headers.set('X-User-Id', authResult.user.userId);
      response.headers.set('X-User-Role', authResult.user.role);
      response.headers.set('X-Auth-Method', authResult.user.authMethod);
    }
    
    return response;
  } catch (error) {
    // If rate limiting fails (e.g., Redis down), allow the request
    // but log the error
    console.error('[RateLimit] Error checking rate limit:', error);
    const response = NextResponse.next();
    
    // Still attach user info even if rate limiting fails
    if (authResult.user) {
      response.headers.set('X-User-Id', authResult.user.userId);
      response.headers.set('X-User-Role', authResult.user.role);
      response.headers.set('X-Auth-Method', authResult.user.authMethod);
    }
    
    return response;
  }
}

export const config = {
  matcher: '/api/:path*',
};
