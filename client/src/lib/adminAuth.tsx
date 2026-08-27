import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const TOKEN_KEY = 'gsmotors_admin_token';

interface AdminAuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const setToken = useCallback((next: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, next);
    } catch {
      // ignore storage errors
    }
    setTokenState(next);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore storage errors
    }
    setTokenState(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ token, isAuthenticated: !!token, setToken, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
