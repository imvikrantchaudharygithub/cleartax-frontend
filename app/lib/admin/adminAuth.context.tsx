'use client';

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthContextType {
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
