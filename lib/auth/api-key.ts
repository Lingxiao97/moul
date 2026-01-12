import { v4 as uuidv4 } from 'uuid';
import { ApiKey, AuthUser, UserRole } from './types';
import { AUTH_CONFIG } from './config';

/**
 * In-memory store for API keys
 * In production, use a database with proper encryption
 */
const apiKeys: Map<string, ApiKey> = new Map();

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  // Generate a secure random key in format: kb_live_xxxxxxxxxxxxx
  const randomPart = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
  return `kb_live_${randomPart.substring(0, 32)}`;
}

/**
 * Create and store a new API key for a user
 */
export function createApiKey(userId: string, role: UserRole, name: string, expiresAt?: Date): ApiKey {
  const key = generateApiKey();
  const apiKey: ApiKey = {
    id: uuidv4(),
    key,
    userId,
    role,
    name,
    createdAt: new Date(),
    expiresAt,
  };

  apiKeys.set(key, apiKey);
  return apiKey;
}

/**
 * Validate an API key and return the associated user info
 */
export function validateApiKey(key: string): AuthUser | null {
  const apiKey = apiKeys.get(key);
  
  if (!apiKey) {
    return null;
  }

  // Check if the key has expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update last used timestamp
  apiKey.lastUsedAt = new Date();

  return {
    userId: apiKey.userId,
    role: apiKey.role,
    authMethod: 'api_key',
  };
}

/**
 * Revoke an API key
 */
export function revokeApiKey(keyOrId: string): boolean {
  // Try to find by key first
  if (apiKeys.has(keyOrId)) {
    apiKeys.delete(keyOrId);
    return true;
  }

  // Try to find by ID
  for (const [key, apiKey] of apiKeys.entries()) {
    if (apiKey.id === keyOrId) {
      apiKeys.delete(key);
      return true;
    }
  }

  return false;
}

/**
 * Get all API keys for a user (without exposing the actual keys)
 */
export function getUserApiKeys(userId: string): Array<Omit<ApiKey, 'key'> & { keyPreview: string }> {
  const userKeys: Array<Omit<ApiKey, 'key'> & { keyPreview: string }> = [];

  for (const apiKey of apiKeys.values()) {
    if (apiKey.userId === userId) {
      userKeys.push({
        id: apiKey.id,
        userId: apiKey.userId,
        role: apiKey.role,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
        expiresAt: apiKey.expiresAt,
        keyPreview: `${apiKey.key.substring(0, 12)}...${apiKey.key.slice(-4)}`,
      });
    }
  }

  return userKeys;
}

/**
 * Revoke all API keys for a user
 */
export function revokeAllUserApiKeys(userId: string): number {
  let revoked = 0;

  for (const [key, apiKey] of apiKeys.entries()) {
    if (apiKey.userId === userId) {
      apiKeys.delete(key);
      revoked++;
    }
  }

  return revoked;
}

/**
 * Extract API key from request header
 */
export function extractApiKeyFromHeader(headers: Headers): string | null {
  return headers.get(AUTH_CONFIG.API_KEY_HEADER);
}

/**
 * Get total number of API keys (for monitoring)
 */
export function getApiKeyCount(): number {
  return apiKeys.size;
}
