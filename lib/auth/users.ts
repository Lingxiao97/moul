import { UserRole } from './types';
import crypto from 'crypto';

/**
 * User model for authentication
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * In-memory user store
 * In production, use a proper database
 */
const users: Map<string, User> = new Map();

// Index for email lookups
const emailIndex: Map<string, string> = new Map();

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, usedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash: `${usedSalt}:${hash}`, salt: usedSalt };
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new user
 */
export function createUser(
  email: string,
  password: string,
  role: UserRole = 'user',
  name?: string
): User | null {
  // Check if email already exists
  if (emailIndex.has(email.toLowerCase())) {
    return null;
  }

  const id = generateUserId();
  const { hash: passwordHash } = hashPassword(password);
  const now = new Date();

  const user: User = {
    id,
    email: email.toLowerCase(),
    passwordHash,
    role,
    name,
    createdAt: now,
    updatedAt: now,
  };

  users.set(id, user);
  emailIndex.set(email.toLowerCase(), id);

  return user;
}

/**
 * Find a user by email
 */
export function findUserByEmail(email: string): User | null {
  const userId = emailIndex.get(email.toLowerCase());
  if (!userId) return null;
  return users.get(userId) || null;
}

/**
 * Find a user by ID
 */
export function findUserById(id: string): User | null {
  return users.get(id) || null;
}

/**
 * Update a user
 */
export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const user = users.get(id);
  if (!user) return null;

  // Handle email change
  if (updates.email && updates.email.toLowerCase() !== user.email) {
    if (emailIndex.has(updates.email.toLowerCase())) {
      return null; // Email already in use
    }
    emailIndex.delete(user.email);
    emailIndex.set(updates.email.toLowerCase(), id);
  }

  const updatedUser: User = {
    ...user,
    ...updates,
    updatedAt: new Date(),
  };

  users.set(id, updatedUser);
  return updatedUser;
}

/**
 * Delete a user
 */
export function deleteUser(id: string): boolean {
  const user = users.get(id);
  if (!user) return false;

  emailIndex.delete(user.email);
  users.delete(id);
  return true;
}

/**
 * Authenticate a user with email and password
 */
export function authenticateUser(email: string, password: string): User | null {
  const user = findUserByEmail(email);
  if (!user) return null;

  if (verifyPassword(password, user.passwordHash)) {
    return user;
  }

  return null;
}

/**
 * Change user password
 */
export function changePassword(id: string, newPassword: string): boolean {
  const user = users.get(id);
  if (!user) return false;

  const { hash: passwordHash } = hashPassword(newPassword);
  user.passwordHash = passwordHash;
  user.updatedAt = new Date();
  users.set(id, user);

  return true;
}

/**
 * Get user count (for monitoring)
 */
export function getUserCount(): number {
  return users.size;
}

/**
 * Get safe user data (without password)
 */
export function getSafeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Initialize with a default admin user for testing
// In production, remove this and use proper user registration
if (users.size === 0) {
  createUser('admin@example.com', 'admin123', 'admin', 'Administrator');
  createUser('user@example.com', 'user123', 'user', 'Test User');
  console.log('[Auth] Created default test users');
}
