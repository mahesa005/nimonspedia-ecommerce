const BASE_URL = '/api/node/admin'

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
            Authorizatoin: `Bearer ${token}`
        },
        body: JSON.stringify({ page, limit, search })
    })

    if (!response.ok) {
        throw new Error('Gagal mengambil data tabel "user"');
    }
    const data = await response.json()
    return data as UserPaginationResponse
}