const BASE_URL = '/api/node/admin'

export interface userData {
    user_id: number
    email: string
    name: string
    role: string
    balance: number
    created_at: Date
}
