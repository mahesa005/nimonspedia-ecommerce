import { User } from '../models/User';
import { findUserById } from '../repositories/userRepository';

export async function getUserById(id: number): Promise<User | null> {
  const user = await findUserById(id);
  return user;
}
