import { NextRequest, NextResponse } from 'next/server';

const ADMIN_TOKEN_COOKIE = 'admin_token';
const LOGIN_PATH = '/admin/login';

/** Lightweight JWT expiry check — no crypto needed, just decode the payload */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const isLoginPage = pathname.startsWith(LOGIN_PATH);

  // Already authenticated → redirect away from login page
  if (isLoginPage) {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/admin/home', request.url));
    }
    return NextResponse.next();
  }

  // No token or expired → redirect to login, preserving intended destination
  if (!token || isTokenExpired(token)) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
