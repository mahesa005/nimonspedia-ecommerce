import { ChatRepository } from '../repositories/chatRepository';
import sanitizeHtml from 'sanitize-html';
import { SendMessageDTO, ChatRoom, ChatMessage } from '../models/chatModel';
import { NotificationService } from './notificationService';

export const ChatService = {
  async getMyChatRooms(userId: number, role: 'BUYER' | 'SELLER', searchQuery?: string): Promise<ChatRoom[]> {
    return await ChatRepository.findRoomsByUser(userId, role, searchQuery);
  },

  async getRoomMessages(storeId: number, buyerId: number, userId: number, role: 'BUYER' | 'SELLER', cursor?: string): Promise<ChatMessage[]> {
    if (role === 'BUYER' && userId !== buyerId) {
      throw new Error('Forbidden: Unauthorized access to this chat');
    }
    return await ChatRepository.findMessages(storeId, buyerId, 50, cursor);
  },

  async sendMessage(data: SendMessageDTO): Promise<ChatMessage> {
    const sanitizedContent = sanitizeHtml(data.content)  
    await ChatRepository.createRoom(data.store_id, data.buyer_id);
    const message = await ChatRepository.createMessage({
      ...data,
      content: sanitizedContent
    });

    try {
        const receiverId = data.buyer_id === data.sender_id ? data.store_id : data.buyer_id;
        await NotificationService.sendToUser(receiverId, {
            title: `New message from ${data.sender_id}`,
            body: `${data.content.substring(0, 50)}...`,
            url: `/chats`
        });
    } catch (err) {
        console.error("Notification failed:", err);
    }
    
    return message;
  },
  
  async markRead(storeId: number, buyerId: number, userId: number) {
     await ChatRepository.markMessagesRead(storeId, buyerId, userId);
  }
};