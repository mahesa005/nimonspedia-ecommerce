const BASE_URL = '/api/node/admin'
const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_INFO_KEY = "adminInfo";

export interface AdminInfo {
    user_id: number;
    email: string;
    name: string;
    role: "ADMIN";
}

export interface AdminLoginResponse {
    token: string;
    admin: AdminInfo;
}

export async function adminLogin( // Function to handle admin login API call
    email: string,
    password: string
): Promise<AdminLoginResponse> {
    console.log("adminApi.adminLogin called with:", { email });
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Indicate that we're sending JSON data
        },
        body: JSON.stringify({ email, password }), // Convert the data to a JSON string because HTTP only accepts strings or Buffers (not typeScript objects)
    })
    if (!response.ok) {
        throw new Error('Gagal login admin');
    }
    const data = await response.json();
    console.log("adminApi.adminLogin response:", data);
    return data;
}

// Function that fetches current admin info
// Used when: - verifying token validity
//            - fetching admin data for display in the admin panel
export async function fetchAdminMe(token: string): Promise<AdminInfo> { // Function to fetch current admin info
    const response = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        },
    });
    
    // Handle 401 - token expired/invalid
    if (response.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_INFO_KEY);
        window.location.href = '/admin/login';
        throw new Error('Token kadaluarsa, silakan login kembali');
    }
    
    if (!response.ok) {
        throw new Error('Gagal mengambil info admin');
    }
    const data = await response.json();
    return data.admin as AdminInfo;
}

// Admin Dashboard APIs
export interface UserData {
    user_id: number
    name: string
    email: string
    role: 'ADMIN' | 'SELLER' | 'BUYER'
    balance: number
    created_at: string
}

export interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface UserPaginationResponse {
    users: UserData[]
    pagination: Pagination
}

// Input page number, limit
export async function fetchUsersAdmin(
    page: number,
    limit: number,
    token: string,
    search?: string,
): Promise<UserPaginationResponse> {
    const response = await fetch(`${BASE_URL}/dashboard`, { // retrieve data from node
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Indicate that we're sending JSON data
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ page, limit, search })
    })
    
    // Handle 401 - token expired/invalid
    if (response.status === 401) {
        // Clear auth and redirect to login
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_INFO_KEY);
        window.location.href = '/admin/login';
        throw new Error('Token kadaluarsa, silakan login kembali');
    }
    
    if (!response.ok) {
        throw new Error('Gagal mengambil data tabel "user"');
    }
    const data = await response.json();
    return data as UserPaginationResponse;
}

// feature flag APIs
export type FeatureName = "checkout_enabled" | "chat_enabled" | "auction_enabled"
export type FlagScope = "ok" | "user" | "global"

export interface getFeatureFlagResponse {
    enabled: boolean
    scope: 'ok' | 'user' | 'global'
    reason: string | null
}

export interface updateFeatureFlagResult {
    user_id: number | null
    feature_name: 'auction_enabled' | 'checkout_enabled' | 'chat_enabled'
    is_enabled: boolean
    reason: string | null
}

export interface updateFeatureFlagResponse {
    message: string
    result: updateFeatureFlagResult
}

export async function updateFeatureFlag(
    userId: number | null,
    featureName: FeatureName,
    isEnabled: boolean,
    token: string,
    reason?: string

): Promise<updateFeatureFlagResponse> {
    const response = await fetch(`${BASE_URL}/feature-flags`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, featureName, isEnabled, reason})
    })
    // Handle 401 - token expired/invalid
    if (response.status === 401) {
        // Clear auth and redirect to login
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_INFO_KEY);
        window.location.href = '/admin/login';
        throw new Error('Token kadaluarsa, silakan login kembali');
    }

    if (!response.ok) {
        throw new Error('Gagal memperbarui feature flag');
    }

    const data = await response.json();
    return data as updateFeatureFlagResponse;
}

export async function getFeatureFlag(
    userId: number | null,
    featureName: FeatureName,
    token: string
): Promise<getFeatureFlagResponse> {
    const response = await fetch(`${BASE_URL}/feature-flags/effective`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, featureName })
    })
    // Handle 401 - token expired/invalid
    if (response.status === 401) {
        // Clear auth and redirect to login
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_INFO_KEY);
        window.location.href = '/admin/login';
        throw new Error('Token kadaluarsa, silakan login kembali');
    }
    if (!response.ok) {
        throw new Error('Gagal mengambil feature flag');
    }
    const data = await response.json();
    return data as getFeatureFlagResponse;
}
