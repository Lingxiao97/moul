import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getSafeUser } from '@/lib/auth/users';
import { generateTokenPair } from '@/lib/auth/jwt';
import { AUTH_CONFIG } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        {
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = await generateTokenPair(user.id, user.role);

    // Create response with user info and tokens
    const response = NextResponse.json({
      success: true,
      user: getSafeUser(user),
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn,
      },
    });

    // Set refresh token as HTTP-only cookie
    response.cookies.set(AUTH_CONFIG.REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: AUTH_CONFIG.COOKIE_HTTP_ONLY,
      secure: AUTH_CONFIG.COOKIE_SECURE,
      sameSite: AUTH_CONFIG.COOKIE_SAME_SITE,
      maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}
