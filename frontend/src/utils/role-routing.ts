/**
 * Role-Based Routing & Token Utilities
 */

export type PlatformRole =
  | 'SUPER_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'COLLEGE_ADMIN'
  | 'FACULTY'
  | 'STUDENT';

export interface DecodedJwtPayload {
  sub?: string;
  email?: string;
  globalRole?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Safely decodes a JWT token without requiring external dependencies (works in Browser, Next.js Edge & Node).
 */
export function decodeJwtPayload(token?: string | null): DecodedJwtPayload | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    // Base64URL to Base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode in browser or Node/Edge
    let jsonStr: string;
    if (typeof atob === 'function') {
      jsonStr = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
    } else {
      jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
    }

    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Extracts global role from a JWT token, user object, or role string
 */
export function extractRole(tokenOrRoleOrUser?: any): string | null {
  if (!tokenOrRoleOrUser) return null;

  if (typeof tokenOrRoleOrUser === 'string') {
    // If it looks like a JWT token (contains dots)
    if (tokenOrRoleOrUser.includes('.')) {
      const decoded = decodeJwtPayload(tokenOrRoleOrUser);
      return decoded?.globalRole || decoded?.role || null;
    }
    return tokenOrRoleOrUser.toUpperCase();
  }

  if (typeof tokenOrRoleOrUser === 'object') {
    return (
      tokenOrRoleOrUser.globalRole ||
      tokenOrRoleOrUser.role ||
      (tokenOrRoleOrUser.user && (tokenOrRoleOrUser.user.globalRole || tokenOrRoleOrUser.user.role)) ||
      null
    );
  }

  return null;
}

/**
 * Returns the designated landing route for a specific user role.
 */
export function getRoleDefaultPath(roleOrToken?: string | null): string {
  const role = (extractRole(roleOrToken) || '').toUpperCase();

  switch (role) {
    case 'SUPER_ADMIN':
    case 'PLATFORM_ADMIN':
      return '/superadmin';
    case 'COLLEGE_ADMIN':
      return '/superadmin';
    case 'FACULTY':
      return '/faculty/profile';
    case 'STUDENT':
      return '/students';
    default:
      return '/superadmin';
  }
}

/**
 * Resolves destination URL upon successful login, taking into account user role and redirect param.
 */
export function getLoginRedirectUrl(
  roleOrUserOrToken: any,
  explicitRedirect?: string | null,
): string {
  const role = extractRole(roleOrUserOrToken);
  const defaultPath = getRoleDefaultPath(role);

  if (!explicitRedirect) {
    return defaultPath;
  }

  // If the redirect target is an auth page itself, avoid loops
  if (
    explicitRedirect === '/login' ||
    explicitRedirect === '/register' ||
    explicitRedirect === '/auth' ||
    explicitRedirect === '/'
  ) {
    return defaultPath;
  }

  // If student was redirected to /superadmin (e.g. default query param), redirect to student portal instead
  if (role === 'STUDENT' && explicitRedirect.startsWith('/superadmin')) {
    return '/students';
  }

  return explicitRedirect;
}
