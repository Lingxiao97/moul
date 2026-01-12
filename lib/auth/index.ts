// Re-export all auth modules
export * from './types';
export * from './config';
export * from './jwt';
export * from './token-blacklist';
export * from './api-key';
export * from './rbac';

// Import for the authenticate function
import { NextRequest } from 'next/server';
import { AuthResult, AuthUser, AuthErrorCode } from './types';
import { verifyAccessToken, extractTokenFromHeader, decodeToken } from './jwt';
import { isTokenBlacklisted } from './token-blacklist';
import { validateApiKey, extractApiKeyFromHeader } from './api-key';
import { checkRoutePermission, isPublicRoute } from './rbac';

/**
 * Main authentication function that checks both JWT and API key
 * Returns authentication result with user info or error
 */
export function authenticate(request: NextRequest): AuthResult {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Check if route is public
  if (isPublicRoute(path, method)) {
    return { success: true };
  }

  // Try JWT authentication first
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return {
        success: false,
        error: 'Token has been revoked',
        errorCode: 'TOKEN_BLACKLISTED',
      };
    }

    // Verify the token
    const result = verifyAccessToken(token);

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
    const user = validateApiKey(apiKey);

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

/**
 * Error response helper for authentication failures
 */
export function createAuthErrorResponse(result: AuthResult): {
  status: number;
  body: { error: string; code: AuthErrorCode; message: string };
} {
  const statusMap: Record<AuthErrorCode, number> = {
    TOKEN_MISSING: 401,
    TOKEN_INVALID: 401,
    TOKEN_EXPIRED: 401,
    TOKEN_BLACKLISTED: 401,
    API_KEY_INVALID: 401,
    INSUFFICIENT_PERMISSIONS: 403,
    USER_NOT_FOUND: 404,
  };

  return {
    status: result.errorCode ? statusMap[result.errorCode] : 401,
    body: {
      error: result.errorCode || 'AUTHENTICATION_FAILED',
      code: result.errorCode || 'TOKEN_INVALID',
      message: result.error || 'Authentication failed',
    },
  };
}
