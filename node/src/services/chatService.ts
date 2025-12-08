import { ChatRepository } from '../repositories/chatRepository';
import DOMPurify from 'dompurify';
import { SendMessageDTO, ChatRoom, ChatMessage } from '../models/chatModel';

export const ChatService = {
  async getMyChatRooms(userId: number, role: 'BUYER' | 'SELLER', searchQuery?: string): Promise<ChatRoom[]> {
    return await ChatRepository.findRoomsByUser(userId, role, searchQuery);
  },

  async getRoomMessages(storeId: number, buyerId: number, userId: number, role: 'BUYER' | 'SELLER'): Promise<ChatMessage[]> {
    if (role === 'BUYER' && userId !== buyerId) {
      throw new Error('Forbidden: Unauthorized access to this chat');
    }
    return await ChatRepository.findMessages(storeId, buyerId);
  },
};