// User roles for RBAC
export type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

// JWT payload structure
export interface JWTPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Refresh token payload
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// User information attached to request context
export interface AuthUser {
  userId: string;
  role: UserRole;
  authMethod: 'jwt' | 'api_key';
}

// Token pair returned on login
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

// Authentication result
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  errorCode?: AuthErrorCode;
}

// Error codes for clear error messages
export type AuthErrorCode =
  | 'TOKEN_MISSING'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_BLACKLISTED'
  | 'API_KEY_INVALID'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'USER_NOT_FOUND';

// Route protection configuration
export interface RouteConfig {
  path: string;
  methods?: string[];
  roles?: UserRole[];
  public?: boolean;
}

// API Key record
export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}
