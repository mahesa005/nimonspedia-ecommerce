// Admin Login Types
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