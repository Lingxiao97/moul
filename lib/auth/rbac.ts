import { UserRole, AuthUser } from './types';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './config';

/**
 * Role hierarchy - higher roles include permissions of lower roles
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  moderator: 50,
  user: 10,
  guest: 0,
};

/**
 * Check if a user has a specific role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(userRole: UserRole, roles: UserRole[]): boolean {
  return roles.some(role => hasRole(userRole, role));
}

/**
 * Check if a route is public (no authentication required)
 */
export function isPublicRoute(path: string, method: string): boolean {
  // Check if the path matches any public route pattern
  for (const pattern of PUBLIC_ROUTES) {
    if (pattern.test(path)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has permission to access a route
 */
export function checkRoutePermission(
  path: string,
  method: string,
  user: AuthUser | null
): { allowed: boolean; reason?: string } {
  // Check if route is public
  if (isPublicRoute(path, method)) {
    return { allowed: true };
  }

  // No user = no access to protected routes
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Find matching route configuration
  for (const route of PROTECTED_ROUTES) {
    if (route.pattern.test(path)) {
      // Check method restriction
      if (route.methods && !route.methods.includes(method.toUpperCase())) {
        continue; // This route config doesn't apply to this method
      }

      // Check role restriction
      if (route.roles && !hasAnyRole(user.role, route.roles as UserRole[])) {
        return {
          allowed: false,
          reason: `Insufficient permissions. Required roles: ${route.roles.join(', ')}`,
        };
      }

      // Route matched and user has permission
      return { allowed: true };
    }
  }

  // No specific protection defined - allow authenticated users
  return { allowed: true };
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): string[] {
  const permissions: string[] = [];

  for (const route of PROTECTED_ROUTES) {
    if (route.roles && hasAnyRole(role, route.roles as UserRole[])) {
      const methods = route.methods || ['GET', 'POST', 'PUT', 'DELETE'];
      for (const method of methods) {
        permissions.push(`${method} ${route.pattern.source}`);
      }
    }
  }

  return permissions;
}

/**
 * Decorator/middleware helper for role-based access control
 */
export function requireRole(...roles: UserRole[]) {
  return (user: AuthUser | null): { allowed: boolean; reason?: string } => {
    if (!user) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (!hasAnyRole(user.role, roles)) {
      return {
        allowed: false,
        reason: `Insufficient permissions. Required roles: ${roles.join(', ')}`,
      };
    }

    return { allowed: true };
  };
}
