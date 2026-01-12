/**
 * Token Blacklist for logout functionality
 * 
 * This is an in-memory implementation suitable for single-server deployments.
 * For production with multiple servers, use Redis or a database.
 */

interface BlacklistedToken {
  token: string;
  expiresAt: number; // Unix timestamp
}

// In-memory store for blacklisted tokens
const blacklistedTokens: Map<string, BlacklistedToken> = new Map();

// Track refresh token IDs that have been revoked
const revokedRefreshTokenIds: Set<string> = new Set();

/**
 * Add a token to the blacklist
 * @param token The JWT token to blacklist
 * @param expiresAt Unix timestamp when the token expires (for cleanup)
 */
export function blacklistToken(token: string, expiresAt: number): void {
  blacklistedTokens.set(token, { token, expiresAt });
}

/**
 * Check if a token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return blacklistedTokens.has(token);
}

/**
 * Revoke a refresh token by its ID
 */
export function revokeRefreshToken(tokenId: string): void {
  revokedRefreshTokenIds.add(tokenId);
}

/**
 * Check if a refresh token ID has been revoked
 */
export function isRefreshTokenRevoked(tokenId: string): boolean {
  return revokedRefreshTokenIds.has(tokenId);
}

/**
 * Revoke all refresh tokens for a user
 * In a real implementation, this would query a database
 */
export function revokeAllUserTokens(userId: string): void {
  // For in-memory implementation, we'd need to track user->tokenId mappings
  // This is a placeholder for when using a database
  console.log(`[Auth] Revoking all tokens for user: ${userId}`);
}

/**
 * Clean up expired tokens from the blacklist
 * Should be called periodically to prevent memory bloat
 */
export function cleanupExpiredTokens(): number {
  const now = Math.floor(Date.now() / 1000);
  let cleaned = 0;

  for (const [token, data] of blacklistedTokens.entries()) {
    if (data.expiresAt < now) {
      blacklistedTokens.delete(token);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Auth] Cleaned up ${cleaned} expired tokens from blacklist`);
  }

  return cleaned;
}

/**
 * Get the current size of the blacklist (for monitoring)
 */
export function getBlacklistSize(): { tokens: number; refreshTokenIds: number } {
  return {
    tokens: blacklistedTokens.size,
    refreshTokenIds: revokedRefreshTokenIds.size,
  };
}

/**
 * Clear all blacklisted tokens (use with caution)
 */
export function clearBlacklist(): void {
  blacklistedTokens.clear();
  revokedRefreshTokenIds.clear();
}
