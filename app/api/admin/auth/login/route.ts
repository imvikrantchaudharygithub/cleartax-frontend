import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.finvidhi.com/api';

const COOKIE_OPTS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24, // 24 hours
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Delegate to backend auth
    const backendRes = await fetch(`${BACKEND_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const body = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok || !body.success) {
      // Map backend failures to the right client-facing error:
      // - 400/401 (credential rejection) → 401 "Invalid email or password"
      // - genuine 5xx / infra failures    → 503 "service temporarily unavailable"
      // - anything else                   → pass status + backend message through
      const status =
        backendRes.status === 400 || backendRes.status === 401
          ? 401
          : backendRes.status >= 500
            ? 503
            : backendRes.status;

      const error =
        status === 401
          ? 'Invalid email or password'
          : status === 503
            ? 'The service is temporarily unavailable. Please try again shortly.'
            : body.message || 'Login failed. Please try again.';

      return NextResponse.json({ error }, { status });
    }

    const { accessToken, user } = body.data;

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. This portal is for administrators only.' },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();

    // httpOnly cookie — read by Next.js middleware for route protection (JS cannot touch this)
    cookieStore.set('admin_token', accessToken, {
      ...COOKIE_OPTS,
      httpOnly: true,
    });

    // Regular cookie — read by the Axios interceptor when attaching Authorization headers
    cookieStore.set('admin_token_access', accessToken, {
      ...COOKIE_OPTS,
      httpOnly: false,
    });

    // Readable user-identity cookie — lets admin UI (sidebar/header) show the real
    // logged-in user without an extra API call. Contains no secrets.
    cookieStore.set(
      'admin_user',
      JSON.stringify({ email: user.email, fullName: user.fullName }),
      { ...COOKIE_OPTS, httpOnly: false }
    );

    return NextResponse.json({
      success: true,
      user: { email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (err) {
    console.error('[admin/auth/login]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
