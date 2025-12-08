import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatService';
import { SendMessageDTO } from '../models/chatModel';

export default (io: Server, socket: Socket) => {
  
  socket.on('join_chat', ({ storeId, buyerId }: { storeId: number, buyerId: number }) => {
    const roomId = `chat_${storeId}_${buyerId}`;
    
    socket.join(roomId);
    console.log(`[SOCKET] User ${socket.data.user.user_id} joined room: ${roomId}`);
  });

  socket.on('leave_chat', ({ storeId, buyerId }) => {
    const roomId = `chat_${storeId}_${buyerId}`;
    socket.leave(roomId);
  });

  socket.on('send_message', async (payload: { 
    storeId: number, 
    buyerId: number, 
    content: string, 
    messageType?: 'text' | 'image' | 'item_preview',
    productId?: number 
  }) => {
    try {
      const user = socket.data.user;
      
      const dto: SendMessageDTO = {
        store_id: payload.storeId,
        buyer_id: payload.buyerId,
        sender_id: user.user_id,
        content: payload.content,
        message_type: payload.messageType || 'text',
        product_id: payload.productId
      };

      const savedMessage = await ChatService.sendMessage(dto);

      const roomId = `chat_${payload.storeId}_${payload.buyerId}`;
      
      io.to(roomId).emit('new_message', savedMessage);

    } catch (error: any) {
      console.error('[SOCKET] Send Message Error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ storeId, buyerId, isTyping }) => {
    const roomId = `chat_${storeId}_${buyerId}`;
    socket.to(roomId).emit('partner_typing', { 
      userId: socket.data.user.user_id,
      isTyping 
    });
  });
};