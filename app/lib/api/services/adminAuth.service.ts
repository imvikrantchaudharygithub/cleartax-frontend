export interface AdminUser {
  email: string;
  fullName: string;
  role: string;
}

export interface AdminLoginResponse {
  success: boolean;
  user: AdminUser;
}

/**
 * Calls the Next.js BFF route handler which sets httpOnly + access cookies.
 * Never calls the backend directly from the client.
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<AdminLoginResponse> {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data as AdminLoginResponse;
}

/** Reads the non-httpOnly access cookie for attaching to API calls */
export function getAdminToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_token_access=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
