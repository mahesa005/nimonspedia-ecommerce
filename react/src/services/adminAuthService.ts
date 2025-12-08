import {
    adminLogin,
    fetchAdminMe,
    type AdminInfo,
    type AdminLoginResponse,
}   from "../api/adminApi"

const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_INFO_KEY = "admin_info";

export async function adminLoginAndStore(
    email: string,
    password: string
): Promise<AdminLoginResponse> {
    console.log("adminAuthService.adminLoginAndStore called");
    const result = await adminLogin(email, password)
    console.log("adminAuthService got result:", result);

    // Store token in local storage
    localStorage.setItem(ADMIN_TOKEN_KEY, result.token)
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(result.admin))
    console.log("adminAuthService stored in localStorage:", {
        token: result.token,
        admin: result.admin
    });
    
    return result;
}

export function getStoredAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdminInfo(): AdminInfo | null {
    const raw = localStorage.getItem(ADMIN_INFO_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw) as AdminInfo;
    } catch {
        return null;
    }
}

export function clearAdminAuth() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_INFO_KEY);
}

export async function refreshAdminFromServer(): Promise<AdminInfo> {
  const token = getStoredAdminToken();
  if (!token) {
    throw new Error("No admin token");
  }

  const info = await fetchAdminMe(token);
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(info));
  return info;
}
