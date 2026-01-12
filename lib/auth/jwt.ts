import * as jose from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { JWTPayload, RefreshTokenPayload, TokenPair, UserRole } from './types';
import { AUTH_CONFIG } from './config';

// Convert secret string to Uint8Array for jose
const getSecretKey = (secret: string) => new TextEncoder().encode(secret);

/**
 * Generate an access token for a user
 */
export async function generateAccessToken(userId: string, role: UserRole): Promise<string> {
  const token = await new jose.SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(AUTH_CONFIG.TOKEN_ISSUER)
    .setAudience(AUTH_CONFIG.TOKEN_AUDIENCE)
    .setExpirationTime(`${AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN}s`)
    .sign(getSecretKey(AUTH_CONFIG.JWT_SECRET));

  return token;
}

/**
 * Generate a refresh token for a user
 */
export async function generateRefreshToken(userId: string): Promise<{ token: string; tokenId: string }> {
  const tokenId = uuidv4();
  
  const token = await new jose.SignJWT({ userId, tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(AUTH_CONFIG.TOKEN_ISSUER)
    .setAudience(AUTH_CONFIG.TOKEN_AUDIENCE)
    .setExpirationTime(`${AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN}s`)
    .sign(getSecretKey(AUTH_CONFIG.REFRESH_SECRET));

  return { token, tokenId };
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(userId: string, role: UserRole): Promise<TokenPair> {
  const accessToken = await generateAccessToken(userId, role);
  const { token: refreshToken } = await generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
  };
}

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string): Promise<{
  valid: boolean;
  payload?: JWTPayload;
  error?: 'EXPIRED' | 'INVALID';
}> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecretKey(AUTH_CONFIG.JWT_SECRET), {
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
 * Verify and decode a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{
  valid: boolean;
  payload?: RefreshTokenPayload;
  error?: 'EXPIRED' | 'INVALID';
}> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecretKey(AUTH_CONFIG.REFRESH_SECRET), {
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
 * Decode a token without verification (for debugging/inspection)
 */
export function decodeToken(token: string): JWTPayload | RefreshTokenPayload | null {
  try {
    return jose.decodeJwt(token) as JWTPayload | RefreshTokenPayload;
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
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
}
