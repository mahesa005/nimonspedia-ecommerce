import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "./useAdminAuth";

export function useRequireAdmin() {
  const { admin, token, loading } = useAdminAuth(); // retrieves admin,token, loading
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!token || !admin) {
      navigate("/admin/login");
    }
  }, [loading, token, admin, navigate]);

  return { admin, token, loading };
}
