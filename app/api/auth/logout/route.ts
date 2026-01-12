import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken, decodeToken } from '@/lib/auth/jwt';
import { blacklistToken } from '@/lib/auth/token-blacklist';
import { AUTH_CONFIG } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    // Get the access token from header
    const authHeader = request.headers.get('authorization');
    const accessToken = extractTokenFromHeader(authHeader);

    // Get the refresh token from cookie
    const refreshToken = request.cookies.get(AUTH_CONFIG.REFRESH_TOKEN_COOKIE)?.value;

    // Blacklist the access token if present
    if (accessToken) {
      const decoded = decodeToken(accessToken);
      if (decoded && decoded.exp) {
        blacklistToken(accessToken, decoded.exp);
      }
    }

    // Blacklist the refresh token if present
    if (refreshToken) {
      const decoded = decodeToken(refreshToken);
      if (decoded && decoded.exp) {
        blacklistToken(refreshToken, decoded.exp);
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear the refresh token cookie
    response.cookies.set(AUTH_CONFIG.REFRESH_TOKEN_COOKIE, '', {
      httpOnly: AUTH_CONFIG.COOKIE_HTTP_ONLY,
      secure: AUTH_CONFIG.COOKIE_SECURE,
      sameSite: AUTH_CONFIG.COOKIE_SAME_SITE,
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
