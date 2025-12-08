import {
  createContext, // acts as a global storage 
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AdminInfo } from "../api/adminApi";
import {
  adminLoginAndStore,
  getStoredAdminInfo,
  getStoredAdminToken,
  clearAdminAuth,
  refreshAdminFromServer,
} from "../services/adminAuthService";

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

  async function login(email: string, password: string) {
    const result = await adminLoginAndStore(email, password);
    setToken(result.token);
    setAdmin(result.admin);
  }

  function logout() {
    clearAdminAuth();
    setToken(null);
    setAdmin(null);
  }

  const value: AdminAuthContextValue = { // returns accessible context value
    admin,
    token,
    loading,
    login,
    logout,
  };

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
