import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';
import { GetChatsResponse, GetMessagesResponse, SendMessageDTO, SendMessageResponse } from '../models/chatModel';
import { Server } from 'socket.io';

export const getChatRooms = async (req: Request, res: Response<GetChatsResponse>) => {
  try {
    const user = (req as any).user;
    
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const rooms = await ChatService.getMyChatRooms(user.user_id, user.role, search);
    res.json({ success: true, data: rooms });
  } catch (error: any) {
    console.error('getChats Error:', error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
};

export const getRoomMessages = async (req: Request, res: Response<GetMessagesResponse>) => {
  try {
    const user = (req as any).user;
    
    let storeId: number;
    let buyerId: number;

    if (user.role === 'BUYER') {
      const partnerIdHeader = req.headers['x-partner-id'];
      if (!partnerIdHeader) return res.status(400).json({success: false, data: null, message: 'Bad Request'});
      
      storeId = parseInt(partnerIdHeader as string);
      buyerId = user.user_id;

    } else {
      storeId = (req as any).storeId; 

      const partnerIdHeader = req.headers['x-partner-id'];
      if (!partnerIdHeader) return res.status(400).json({success: false, data: null, message: 'Bad Request'});
      
      buyerId = parseInt(partnerIdHeader as string);
    }

    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;

    const messages = await ChatService.getRoomMessages(
      storeId,
      buyerId,
      user.user_id,
      user.role,
      cursor
    );

    res.json({ success: true, data: messages });

  } catch (error: any) {
    res.status(500).json({ success: false, data: null, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response<SendMessageResponse>) => {
  try {
    const user = (req as any).user;
    const { store_id, buyer_id, content, message_type, product_id } = req.body;

    const dto: SendMessageDTO = {
      store_id,
      buyer_id,
      sender_id: user.user_id,
      message_type: message_type || 'text',
      content,
      product_id
    };

    const message = await ChatService.sendMessage(dto);
    
    const io: Server = req.app.get('io');
    const roomId = `chat_${store_id}_${buyer_id}`;
    
    io.to(roomId).emit('new_message', message);

    res.json({ 
      success: true, 
      data: message 
    });

  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      data: null, 
      message: error.message 
    });
  }
};