import { getUsers } from '../repositories/userRepository'

// Wrap so it's cleaner
export async function getPaginatedUsers(params: {
    page: number;
    limit: number;
    search?: string;
}) {
    return getUsers(params)
}
import { User } from '../models/User';
import { findUserById } from '../repositories/userRepository';

export async function getUserById(id: number): Promise<User | null> {
  const user = await findUserById(id);
  return user;
}
