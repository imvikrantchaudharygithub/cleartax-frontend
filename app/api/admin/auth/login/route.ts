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

    const body = await backendRes.json();

    if (!backendRes.ok || !body.success) {
      return NextResponse.json(
        { error: body.message || 'Invalid credentials' },
        { status: 401 }
      );
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
