import { useAdminAuthContext } from "../context/AdminAuthContext";

// so access for admin context is simpler
export function useAdminAuth() {
  return useAdminAuthContext();
}
