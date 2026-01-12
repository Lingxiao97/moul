import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, getSafeUser } from '@/lib/auth/users';
import { generateTokenPair } from '@/lib/auth/jwt';
import { AUTH_CONFIG } from '@/lib/auth/config';
import { UserRole } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'USER_EXISTS',
          message: 'A user with this email already exists',
        },
        { status: 409 }
      );
    }

    // Create new user (default role is 'user')
    const user = createUser(email, password, 'user' as UserRole, name);

    if (!user) {
      return NextResponse.json(
        {
          error: 'REGISTRATION_FAILED',
          message: 'Failed to create user',
        },
        { status: 500 }
      );
    }

    // Generate tokens for immediate login
    const tokens = generateTokenPair(user.id, user.role);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
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
    console.error('[Auth] Registration error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred during registration',
      },
      { status: 500 }
    );
  }
}
