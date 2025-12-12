import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import BuyerNavbar from '../components/ui/BuyerNavbar';
import SellerNavbar from '../components/ui/SellerNavbar';
import { useNavbarData } from '../hooks/useNavbarData';
import type { ChatRoom, ChatMessage } from '../types/chat';
import FeatureMiddleware from '../components/common/FeatureMiddleware';

const ChatPageSkeleton = () => (
  <div className="pt-16 h-screen bg-gray-50">
    <div className="h-full flex flex-col md:flex-row w-full mx-auto overflow-hidden relative animate-pulse">
      <div className="flex-col bg-white border-r border-gray-200 h-full w-full md:w-1/3 lg:w-1/4 flex">
        <div className="p-4 border-b border-gray-100 shrink-0 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-full w-full"></div>
        </div>
        <div className="flex-1 p-2 space-y-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-3 p-2">
              <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-col bg-gray-50 h-full flex-1 hidden md:flex">
        <div className="bg-white p-4 border-b border-gray-200 h-16 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-6">
          <div className="flex justify-start"><div className="h-10 w-48 bg-gray-200 rounded-xl"></div></div>
          <div className="flex justify-end"><div className="h-16 w-64 bg-gray-300 rounded-xl"></div></div>
        </div>
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="h-12 bg-gray-200 rounded-full w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const socket: Socket = io('http://localhost:8080', {
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});

export default function ChatPage() {
  const { user, store, cartCount, flags, loading, handleLogout, updateLocalBalance } = useNavbarData();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRoomsLoaded, setIsRoomsLoaded] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());

  const [searchParams] = useSearchParams();
  const targetStoreId = searchParams.get('store_id');
  const targetStoreName = searchParams.get('store_name');

  useEffect(() => {
    if (user && !socket.connected) {
      socket.connect();
    }
    return () => { 
      // if (socket.connected) socket.disconnect(); 
    };
  }, [user]);

  const fetchRooms = useCallback(async (search = '') => {
    try {
      const res = await fetch(`/api/node/chats?search=${search}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setRooms(json.data);
    } catch (err) { console.error("Fetch rooms failed", err); }
    finally { setIsRoomsLoaded(true); }
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

  const handleSelectRoom = useCallback(async (room: ChatRoom) => {
    setRooms(prevRooms => {
      const exists = prevRooms.some(r => r.store_id === room.store_id && r.buyer_id === room.buyer_id);
      return exists ? prevRooms : [room, ...prevRooms];
    });
    setActiveRoom(room);
    setMessages([]);
    setHasMore(true);

    if (!user) return;

    const isBuyer = (user.role as string).trim() === 'BUYER';
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
  }, [user]);

  const handleLoadMore = async () => {
    if (!activeRoom || !user || !hasMore || isFetchingMore || messages.length === 0) return;
    const oldestMessage = messages[0];
    const cursor = oldestMessage.created_at;
    setIsFetchingMore(true);

    const isBuyer = (user.role as string).trim() === 'BUYER';
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
        if (json.data.length > 0) setMessages(prev => [...json.data, ...prev]);
      }
    } catch (err) { console.error("Failed to load more", err); } 
    finally { setIsFetchingMore(false); }
  };

  useEffect(() => {
    if (targetStoreId && isRoomsLoaded && user && !activeRoom) {
      const storeIdNum = parseInt(targetStoreId);
      const existingRoom = rooms.find(r => r.store_id === storeIdNum);

      if (existingRoom) {
        handleSelectRoom(existingRoom);
      } else {
        const tempRoom: ChatRoom = {
          store_id: storeIdNum,
          buyer_id: user.user_id,
          partner_name: targetStoreName || `Store #${storeIdNum}`,
          partner_image: null,
          last_message_content: '',
          unread_count: 0,
          last_message_at: new Date()
        };
        handleSelectRoom(tempRoom);
      }
    }
  }, [targetStoreId, isRoomsLoaded, rooms, user, activeRoom, handleSelectRoom, targetStoreName]);

  useEffect(() => {
    if (activeRoom && user) {
      socket.emit('mark_read', { storeId: activeRoom.store_id, buyerId: activeRoom.buyer_id });
      setMessages(prev => prev.map(m => (!m.is_read && m.sender_id !== user.user_id) ? { ...m, is_read: true } : m));
      setRooms(prev => prev.map(r => (r.store_id === activeRoom.store_id && r.buyer_id === activeRoom.buyer_id) ? { ...r, unread_count: 0 } : r));
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
        return updatedRooms.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      });

      if (isOpen) setMessages(prev => [...prev, msg]);
    };

    const handleMessagesRead = () => {
      if (activeRoom) setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
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
    socket.emit('send_message', {
      storeId: activeRoom.store_id,
      buyerId: activeRoom.buyer_id,
      content, messageType: type
    });
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

  if (loading) return <ChatPageSkeleton />;
  if (!user) return <div className="p-8 text-center">Please login to access chat.</div>;

  const isSeller = (user.role as string).trim() === 'SELLER';

  return (
    <FeatureMiddleware flag="chat_enabled" skeleton={<ChatPageSkeleton/>}>
    <div className="flex flex-col h-screen bg-gray-50">
      {/* NAVBAR */}
      {isSeller ? (
        <SellerNavbar 
          storeBalance={store ? store.balance : 0} 
          onLogout={handleLogout} 
          flags={flags}
        />
      ) : (
        <BuyerNavbar 
          userBalance={user.balance} 
          cartItemCount={cartCount} 
          onLogout={handleLogout} 
          onBalanceUpdate={updateLocalBalance}
          flags={flags}
        />
      )}

      {/* CHAT CONTENT */}
      <div className="pt-16 h-full box-border">
        <div className="flex flex-col md:flex-row h-full w-full mx-auto overflow-hidden relative">
          <div className={`flex-col bg-white border-r border-gray-200 h-full w-full md:w-1/3 lg:w-1/4 ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
            <ChatSidebar
              rooms={rooms}
              activeRoom={activeRoom}
              onSelectRoom={handleSelectRoom}
              onSearch={(q) => fetchRooms(q)}
              currentUserRole={isSeller ? 'SELLER' : 'BUYER'}
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
      </div>
    </div>
    </FeatureMiddleware>
  );
}