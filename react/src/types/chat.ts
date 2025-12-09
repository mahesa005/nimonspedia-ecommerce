export interface ChatRoom {
  store_id: number;
  buyer_id: number;
  last_message_at: Date;
  partner_name: string;
  partner_image: string | null;
  last_message_content: string;
  unread_count: number;
}

export interface ChatMessage {
  message_id: number;
  store_id: number;
  buyer_id: number;
  sender_id: number;
  message_type: 'text' | 'image' | 'item_preview';
  content: string;
  product_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface TypingEvent {
  userId: number;
  isTyping: boolean;
}