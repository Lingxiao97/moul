/**
 * Edge-compatible JWT utilities using jose library
 * This module is designed to work in Next.js middleware (Edge Runtime)
 */

import { SignJWT, jwtVerify, decodeJwt, type JWTPayload as JoseJWTPayload } from 'jose';
import { AUTH_CONFIG } from './config';
import { JWTPayload, RefreshTokenPayload, UserRole, AuthUser } from './types';

// Convert secret string to Uint8Array for jose
const getSecretKey = (secret: string) => new TextEncoder().encode(secret);

/**
 * Verify and decode an access token (Edge-compatible)
 */
export async function verifyAccessTokenEdge(token: string): Promise<{
  valid: boolean;
  payload?: JWTPayload;
  error?: 'EXPIRED' | 'INVALID';
}> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(AUTH_CONFIG.JWT_SECRET), {
      issuer: AUTH_CONFIG.TOKEN_ISSUER,
      audience: AUTH_CONFIG.TOKEN_AUDIENCE,
    });

    return {
      valid: true,
      payload: {
        userId: payload.userId as string,
        role: payload.role as UserRole,
        iat: payload.iat,
        exp: payload.exp,
      },
    };
  } catch (error: any) {
    if (error?.code === 'ERR_JWT_EXPIRED') {
      return { valid: false, error: 'EXPIRED' };
    }
    return { valid: false, error: 'INVALID' };
  }
}

/**
 * Verify and decode a refresh token (Edge-compatible)
 */
export async function verifyRefreshTokenEdge(token: string): Promise<{
  valid: boolean;
  payload?: RefreshTokenPayload;
  error?: 'EXPIRED' | 'INVALID';
}> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(AUTH_CONFIG.REFRESH_SECRET), {
      issuer: AUTH_CONFIG.TOKEN_ISSUER,
      audience: AUTH_CONFIG.TOKEN_AUDIENCE,
    });

    return {
      valid: true,
      payload: {
        userId: payload.userId as string,
        tokenId: payload.tokenId as string,
        iat: payload.iat,
        exp: payload.exp,
      },
    };
  } catch (error: any) {
    if (error?.code === 'ERR_JWT_EXPIRED') {
      return { valid: false, error: 'EXPIRED' };
    }
    return { valid: false, error: 'INVALID' };
  }
}

/**
 * Decode a token without verification (Edge-compatible)
 */
export function decodeTokenEdge(token: string): JWTPayload | RefreshTokenPayload | null {
  try {
    const payload = decodeJwt(token);
    return payload as JWTPayload | RefreshTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * In-memory token blacklist for Edge Runtime
 * Note: In production with multiple Edge instances, use a distributed cache like Redis or Upstash
 */
const edgeBlacklist = new Set<string>();

export function blacklistTokenEdge(token: string): void {
  edgeBlacklist.add(token);
}

export function isTokenBlacklistedEdge(token: string): boolean {
  return edgeBlacklist.has(token);
}

/**
 * Simple in-memory API key validation for Edge Runtime
 * Note: In production, use a database or external service
 */
const apiKeyStore = new Map<string, { userId: string; role: UserRole }>();

// Initialize with a test API key
apiKeyStore.set('kb_live_test_api_key_for_development', {
  userId: 'api_user_1',
  role: 'user',
});

export function validateApiKeyEdge(key: string): AuthUser | null {
  const keyData = apiKeyStore.get(key);
  if (!keyData) return null;

  return {
    userId: keyData.userId,
    role: keyData.role,
    authMethod: 'api_key',
  };
}

export function extractApiKeyFromHeader(headers: Headers): string | null {
  return headers.get(AUTH_CONFIG.API_KEY_HEADER);
}
