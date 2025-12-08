import { getUsers } from '../repositories/userRepository'

// Wrap so it's cleaner
export async function getPaginatedUsers(params: {
    page: number;
    limit: number;
    search?: string;
}) {
    return getUsers(params)
}