import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractRole, getLoginRedirectUrl, getRoleDefaultPath } from '@/utils/role-routing';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasAuth = Boolean(accessToken || refreshToken);

  // Extract role from access token JWT if present
  const userRole = extractRole(accessToken);

  const isAuthRoute =
    pathname === '/login' || pathname === '/register' || pathname === '/auth';
  const isSuperAdminRoute = pathname.startsWith('/superadmin');
  const isFacultyRoute = pathname.startsWith('/faculty');
  const isStudentsRoute = pathname.startsWith('/students');
  const isPracticeRoute = pathname.startsWith('/practice');
  const isRootRoute = pathname === '/';

  // 1. Root route redirection based on auth status and role
  if (isRootRoute) {
    if (hasAuth) {
      const destination = getRoleDefaultPath(userRole);
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Protected superadmin routes -> Require authentication and admin role
  if (isSuperAdminRoute) {
    if (!hasAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole === 'STUDENT') {
      return NextResponse.redirect(new URL('/students', request.url));
    }
    if (userRole === 'FACULTY') {
      return NextResponse.redirect(new URL('/faculty/profile', request.url));
    }
  }

  // 3. Protected faculty routes -> Require authentication and faculty/admin role
  if (isFacultyRoute) {
    if (!hasAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole === 'STUDENT') {
      return NextResponse.redirect(new URL('/students', request.url));
    }
  }

  // 4. Protected student routes -> If faculty or admin arrives on /students, route to their role workspace
  if (isStudentsRoute || isPracticeRoute) {
    if (!hasAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (isStudentsRoute) {
      if (userRole === 'FACULTY' || userRole === 'COLLEGE_ADMIN') {
        return NextResponse.redirect(new URL('/faculty/profile', request.url));
      }
      if (userRole === 'SUPER_ADMIN' || userRole === 'PLATFORM_ADMIN') {
        return NextResponse.redirect(new URL('/superadmin', request.url));
      }
    }
  }

  // 5. Auth pages -> Redirect to designated role dashboard if already logged in
  if (isAuthRoute) {
    if (hasAuth) {
      const requestedRedirect = request.nextUrl.searchParams.get('redirect');
      const destination = getLoginRedirectUrl(userRole, requestedRedirect);
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/superadmin/:path*',
    '/faculty/:path*',
    '/students/:path*',
    '/practice/:path*',
    '/login',
    '/register',
    '/auth',
  ],
};
