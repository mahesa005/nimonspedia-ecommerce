import {
  createContext, // acts as a global storage 
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { AdminInfo } from "../types/admin";
import {
  adminLoginAndStore,
  getStoredAdminInfo,
  getStoredAdminToken,
  clearAdminAuth,
  refreshAdminFromServer,
} from "../services/adminAuthService";

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode payload (2nd part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check exp claim (expiry time in seconds since epoch)
    if (!payload.exp) return true;
    
    // Current time in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // Token expired if current time >= exp time
    return now >= payload.exp;
  } catch {
    return true; // If decode fails, consider token invalid
  }
}

interface AdminAuthContextValue {
  admin: AdminInfo | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} // stored in global context, made accessible for every page

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined
);

// Wraps all react component
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // initial load from localStorage
  useEffect(() => {
    const storedToken = getStoredAdminToken();
    const storedAdmin = getStoredAdminInfo();

    if (!storedToken) {
      setLoading(false);
      return; // user not logged in
    }

    // Check if token is expired
    if (isTokenExpired(storedToken)) {
      clearAdminAuth();
      setLoading(false);
      return;
    }

    setToken(storedToken); // save token for UI needs

    if (storedAdmin) {
      setAdmin(storedAdmin); // save admin info for UI needs
      setLoading(false);
    } else {
      // Optional: sync lagi ke /admin/me
      refreshAdminFromServer()
        .then((info) => setAdmin(info))
        .catch(() => {
          clearAdminAuth();
          setToken(null);
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    console.log("Context login called");
    const result = await adminLoginAndStore(email, password);
    console.log("Login result:", result);
    setToken(result.token);
    setAdmin(result.admin);
    console.log("State updated with token:", result.token, "admin:", result.admin);
  }, []);

  const logout = useCallback(() => {
    clearAdminAuth();
    setToken(null);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({
    admin,
    token,
    loading,
    login,
    logout,
  }), [admin, token, loading, login, logout]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuthContext() { // make it prettier
  const ctx = useContext(AdminAuthContext); // use to retrieve context values
  if (!ctx) {
    throw new Error("useAdminAuthContext must be used within AdminAuthProvider");
  }
  return ctx;
}
