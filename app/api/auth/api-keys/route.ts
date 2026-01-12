import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { createApiKey, getUserApiKeys, revokeApiKey } from '@/lib/auth/api-key';
import { UserRole } from '@/lib/auth/types';

// GET - List user's API keys
export async function GET(request: NextRequest) {
  try {
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

    const apiKeys = getUserApiKeys(authResult.user.userId);

    return NextResponse.json({
      success: true,
      apiKeys,
    });
  } catch (error) {
    console.error('[Auth] Get API keys error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching API keys',
      },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { name, expiresIn } = body;

    if (!name) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'API key name is required',
        },
        { status: 400 }
      );
    }

    // Calculate expiration date if provided (in days)
    let expiresAt: Date | undefined;
    if (expiresIn && typeof expiresIn === 'number' && expiresIn > 0) {
      expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
    }

    // Create API key with the user's role
    const apiKey = createApiKey(
      authResult.user.userId,
      authResult.user.role as UserRole,
      name,
      expiresAt
    );

    return NextResponse.json({
      success: true,
      message: 'API key created successfully. Please save it securely, as it will not be shown again.',
      apiKey: {
        id: apiKey.id,
        key: apiKey.key, // Only shown once on creation
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
      },
    });
  } catch (error) {
    console.error('[Auth] Create API key error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while creating API key',
      },
      { status: 500 }
    );
  }
}

// DELETE - Revoke an API key
export async function DELETE(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'API key ID is required',
        },
        { status: 400 }
      );
    }

    // Verify the API key belongs to the user (or user is admin)
    const userKeys = getUserApiKeys(authResult.user.userId);
    const keyBelongsToUser = userKeys.some(k => k.id === keyId);

    if (!keyBelongsToUser && authResult.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message: 'You can only revoke your own API keys',
        },
        { status: 403 }
      );
    }

    const revoked = revokeApiKey(keyId);

    if (!revoked) {
      return NextResponse.json(
        {
          error: 'NOT_FOUND',
          message: 'API key not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('[Auth] Revoke API key error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while revoking API key',
      },
      { status: 500 }
    );
  }
}
