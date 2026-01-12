import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { isTokenBlacklisted, isRefreshTokenRevoked, blacklistToken } from '@/lib/auth/token-blacklist';
import { findUserById, getSafeUser } from '@/lib/auth/users';
import { AUTH_CONFIG } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    let refreshTokenValue = request.cookies.get(AUTH_CONFIG.REFRESH_TOKEN_COOKIE)?.value;

    // Also check request body for refresh token (for non-browser clients)
    if (!refreshTokenValue) {
      try {
        const body = await request.json();
        refreshTokenValue = body.refreshToken;
      } catch {
        // No body or invalid JSON
      }
    }

    if (!refreshTokenValue) {
      return NextResponse.json(
        {
          error: 'TOKEN_MISSING',
          message: 'Refresh token is required',
        },
        { status: 401 }
      );
    }

    // Check if refresh token is blacklisted
    if (isTokenBlacklisted(refreshTokenValue)) {
      return NextResponse.json(
        {
          error: 'TOKEN_BLACKLISTED',
          message: 'Refresh token has been revoked',
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const result = verifyRefreshToken(refreshTokenValue);

    if (!result.valid || !result.payload) {
      return NextResponse.json(
        {
          error: result.error === 'EXPIRED' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
          message: result.error === 'EXPIRED'
            ? 'Refresh token has expired. Please login again.'
            : 'Invalid refresh token',
        },
        { status: 401 }
      );
    }

    // Check if the specific refresh token ID has been revoked
    if (isRefreshTokenRevoked(result.payload.tokenId)) {
      return NextResponse.json(
        {
          error: 'TOKEN_REVOKED',
          message: 'Refresh token has been revoked',
        },
        { status: 401 }
      );
    }

    // Get user to verify they still exist and get current role
    const user = findUserById(result.payload.userId);

    if (!user) {
      return NextResponse.json(
        {
          error: 'USER_NOT_FOUND',
          message: 'User no longer exists',
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.role);

    // Optionally rotate refresh token (recommended for security)
    const { token: newRefreshToken, tokenId: newTokenId } = generateRefreshToken(user.id);

    // Blacklist the old refresh token
    if (result.payload.exp) {
      blacklistToken(refreshTokenValue, result.payload.exp);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      user: getSafeUser(user),
      tokens: {
        accessToken: newAccessToken,
        expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        refreshExpiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      },
    });

    // Set new refresh token as HTTP-only cookie
    response.cookies.set(AUTH_CONFIG.REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: AUTH_CONFIG.COOKIE_HTTP_ONLY,
      secure: AUTH_CONFIG.COOKIE_SECURE,
      sameSite: AUTH_CONFIG.COOKIE_SAME_SITE,
      maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Auth] Refresh error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred during token refresh',
      },
      { status: 500 }
    );
  }
}
