import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken, getAdminCookieName } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookieName = getAdminCookieName();
  const adminToken = request.cookies.get(adminCookieName)?.value;

  // Helper to attach security headers
  const applySecurityHeaders = (res: NextResponse) => {
    res.headers.set('X-DNS-Prefetch-Control', 'on');
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return res;
  };

  // 1. Admin UI Routes
  if (pathname.startsWith('/admin')) {
    const isPublicAdminRoute =
      pathname === '/admin/login' ||
      pathname === '/admin/forgot-password' ||
      pathname === '/admin/reset-password';

    const adminPayload = adminToken ? await verifyAdminToken(adminToken) : null;

    if (isPublicAdminRoute) {
      if (adminPayload) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)));
      }
      return applySecurityHeaders(NextResponse.next());
    }

    if (!adminPayload) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // 2. Admin API Routes
  if (pathname.startsWith('/api/admin')) {
    const isPublicAdminApi =
      pathname.startsWith('/api/admin/auth/login') ||
      pathname.startsWith('/api/admin/auth/forgot-password') ||
      pathname.startsWith('/api/admin/auth/reset-password');

    if (isPublicAdminApi) {
      return applySecurityHeaders(NextResponse.next());
    }

    const adminPayload = adminToken ? await verifyAdminToken(adminToken) : null;
    if (!adminPayload) {
      const res = NextResponse.json(
        { success: false, error: 'Unauthorized: Valid admin authentication token required' },
        { status: 401 }
      );
      return applySecurityHeaders(res);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
