import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import type { ChatRoom, ChatMessage } from '../types/chat';
import type { User } from '../types/user';

const socket: Socket = io('http://localhost:8080', {
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  
  const [searchParams] = useSearchParams();
  const targetStoreId = searchParams.get('store_id');

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch('/api/node/me', { credentials: 'include' });
        const meJson = await meRes.json();
        if (meJson.success) {
          setUser(meJson.data);
          if (!socket.connected) socket.connect();
        }
      } catch (err) { console.error("Init failed", err); }
    };
    init();
    
    return () => { socket.disconnect(); };
  }, []);

  const fetchRooms = useCallback(async (search = '') => {
    try {
      const res = await fetch(`/api/node/chats?search=${search}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setRooms(json.data);
    } catch (err) { console.error("Fetch rooms failed", err); }
  }, []);

  useEffect(() => { if (user) fetchRooms(); }, [fetchRooms, user]);

  useEffect(() => {
    if (rooms.length > 0) {
      rooms.forEach(room => {
        const roomKey = `${room.store_id}-${room.buyer_id}`;
        if (!joinedRoomsRef.current.has(roomKey)) {
            socket.emit('join_chat', { storeId: room.store_id, buyerId: room.buyer_id });
            joinedRoomsRef.current.add(roomKey);
        }
      });
    }
  }, [rooms]);

  const handleSelectRoom = async (room: ChatRoom) => {
    setRooms(prevRooms => {
      const exists = prevRooms.some(r => r.store_id === room.store_id && r.buyer_id === room.buyer_id);
      
      if (!exists) {
        return [room, ...prevRooms];
      }
      return prevRooms;
    });
    setActiveRoom(room);
    setMessages([]);
    setHasMore(true);
    
    if (!user) return;

    const roleString = (user.role as string || '').trim();
    const isBuyer = roleString === 'BUYER';
    const endpoint = isBuyer ? '/api/node/chats/buyer/messages' : '/api/node/chats/seller/messages';
    const partnerId = isBuyer ? room.store_id : room.buyer_id;

    try {
      const res = await fetch(endpoint, {
        headers: { 'X-Partner-ID': partnerId.toString() },
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
        if (json.data.length < 50) setHasMore(false);
      }
      
      socket.emit('join_chat', { storeId: room.store_id, buyerId: room.buyer_id });
    } catch (err) { console.error(err); }
  };

  const handleLoadMore = async () => {
    if (!activeRoom || !user || !hasMore || isFetchingMore || messages.length === 0) return;

    const oldestMessage = messages[0];
    const cursor = oldestMessage.created_at;

    setIsFetchingMore(true);

    const roleString = (user.role as string || '').trim();
    const isBuyer = roleString === 'BUYER';
    const endpoint = isBuyer ? '/api/node/chats/buyer/messages' : '/api/node/chats/seller/messages';
    const partnerId = isBuyer ? activeRoom.store_id : activeRoom.buyer_id;

    try {
      const res = await fetch(`${endpoint}?cursor=${cursor}`, {
        headers: { 'X-Partner-ID': partnerId.toString() },
        credentials: 'include'
      });
      const json = await res.json();

      if (json.success) {
        if (json.data.length < 50) setHasMore(false);
        if (json.data.length > 0) {
          setMessages(prev => [...json.data, ...prev]);
        }
      }
    } catch (err) {
      console.error("Failed to load more", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (targetStoreId && rooms.length > 0 && !activeRoom) {
      const storeIdNum = parseInt(targetStoreId);
      const existingRoom = rooms.find(r => r.store_id === storeIdNum);
      if (existingRoom) handleSelectRoom(existingRoom);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetStoreId, rooms]); 

  useEffect(() => {
    if (activeRoom && user) {
      socket.emit('mark_read', { storeId: activeRoom.store_id, buyerId: activeRoom.buyer_id });
      
      setMessages(prev => prev.map(m => (!m.is_read && m.sender_id !== user.user_id) ? { ...m, is_read: true } : m));
      
      setRooms(prev => prev.map(r => 
        (r.store_id === activeRoom.store_id && r.buyer_id === activeRoom.buyer_id) ? { ...r, unread_count: 0 } : r
      ));
    }
  }, [activeRoom, user]);

  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      const msgDate = new Date(msg.created_at);
      const isMe = msg.sender_id === user?.user_id;

      const isOpen = activeRoom?.store_id === msg.store_id && activeRoom?.buyer_id === msg.buyer_id;

      if (isOpen && !isMe) {
          socket.emit('mark_read', { storeId: msg.store_id, buyerId: msg.buyer_id });
          msg.is_read = true;
      }

      const getPreviewText = (m: ChatMessage) => {
        if (m.message_type === 'image') return 'Sent an image';
        if (m.message_type === 'item_preview') return 'Sent a product';
        return m.content;
      };

      setRooms(prevRooms => {
        const updatedRooms = prevRooms.map(r => {
          if (r.store_id === msg.store_id && r.buyer_id === msg.buyer_id) {
              return { 
                ...r, 
                last_message_content: getPreviewText(msg), 
                last_message_at: msgDate, 
                unread_count: isMe ? r.unread_count : (isOpen ? 0 : r.unread_count + 1) 
              };
          }
          return r;
        });

        return updatedRooms.sort((a, b) => 
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        );
      });

      if (isOpen) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleMessagesRead = () => {
      if (activeRoom) {
        setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('partner_typing', ({ isTyping }) => setIsTyping(isTyping));
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('partner_typing');
      socket.off('messages_read');
    };
  }, [activeRoom, user?.user_id]);


  const handleSendMessage = (content: string, type: 'text' | 'image' = 'text') => {
    if (!activeRoom || !user) return;
    const payload = {
      storeId: activeRoom.store_id,
      buyerId: activeRoom.buyer_id,
      content, messageType: type
    };
    socket.emit('send_message', payload);
    handleTyping(false);
  };

  const handleTyping = (isTypingNow: boolean) => {
    if (!activeRoom || !user) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing', { storeId: activeRoom.store_id, buyerId: activeRoom.buyer_id, isTyping: isTypingNow });
    if (isTypingNow) {
      typingTimeoutRef.current = setTimeout(() => handleTyping(false), 3000);
    }
  };

  if (!user) return <div className="p-10 text-center">Loading Chat...</div>;

  const safeRole = (user.role as string).trim() === 'BUYER' ? 'BUYER' : 'SELLER';

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-gray-50 flex flex-col md:flex-row max-w-[1400px] mx-auto md:mt-4 md:border md:rounded-xl md:shadow-xl overflow-hidden relative">
      <div className={`flex-col bg-white border-r border-gray-200 h-full w-full md:w-1/3 lg:w-1/4 ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
        <ChatSidebar 
          rooms={rooms} 
          activeRoom={activeRoom} 
          onSelectRoom={handleSelectRoom}
          onSearch={(q) => fetchRooms(q)}
          currentUserRole={safeRole}
          currentUserId={user.user_id}
        />
      </div>
      <div className={`flex-col bg-gray-50 h-full flex-1 ${!activeRoom ? 'hidden md:flex' : 'flex'}`}>
        {activeRoom ? (
          <ChatWindow 
            room={activeRoom}
            messages={messages}
            currentUserId={user.user_id}
            onSendMessage={handleSendMessage}
            isPartnerTyping={isTyping}
            onTyping={handleTyping}
            onBack={() => setActiveRoom(null)}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <span className="text-6xl mb-4">💬</span>
            <p className="text-lg font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}