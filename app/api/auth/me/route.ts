import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { findUserById, getSafeUser } from '@/lib/auth/users';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = authenticate(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          error: authResult.errorCode || 'UNAUTHORIZED',
          message: authResult.error || 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get full user data
    const user = findUserById(authResult.user.userId);

    if (!user) {
      return NextResponse.json(
        {
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: getSafeUser(user),
      authMethod: authResult.user.authMethod,
    });
  } catch (error) {
    console.error('[Auth] Profile error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching profile',
      },
      { status: 500 }
    );
  }
}
