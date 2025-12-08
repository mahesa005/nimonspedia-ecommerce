import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatRoom } from '../../types/chat';
import DOMPurify from 'dompurify';

interface Props {
  room: ChatRoom;
  messages: ChatMessage[];
  currentUserId: number;
  onSendMessage: (content: string, type?: 'text' | 'image') => void;
  isPartnerTyping: boolean;
  onTyping: (isTyping: boolean) => void;
  onBack: () => void;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
}

export default function ChatWindow({ room, messages, currentUserId, onSendMessage, isPartnerTyping, onTyping, onBack, onLoadMore, hasMore }: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lastMessageIdRef = useRef<number | null>(null);

  const isAtBottomRef = useRef(true);
  
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    isAtBottomRef.current = isBottom;

    if (scrollTop === 0 && hasMore && prevScrollHeight === 0) {
      setPrevScrollHeight(scrollHeight);
      onLoadMore();
    }
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    if (prevScrollHeight > 0 && containerRef.current.scrollHeight > prevScrollHeight) {
      const diff = containerRef.current.scrollHeight - prevScrollHeight;
      containerRef.current.scrollTop = diff;
      setPrevScrollHeight(0);
    } 
  }, [messages, prevScrollHeight]);

  useEffect(() => {
    if (!messages.length) return;

    const lastMsg = messages[messages.length - 1];
    const isNewMessage = lastMsg.message_id !== lastMessageIdRef.current;
    
    lastMessageIdRef.current = lastMsg.message_id;

    if (!isNewMessage || prevScrollHeight > 0) return;

    const isMe = lastMsg.sender_id === currentUserId;

    if (isMe || isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentUserId, prevScrollHeight]); 

  useEffect(() => {
    if (messages.length > 0) {
       messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
       lastMessageIdRef.current = messages[messages.length - 1].message_id;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.store_id, room.buyer_id]);

  const handleImageUpload = () => {
    const url = prompt("Enter Image URL (Simulating upload):"); 
    if (url) {
      onSendMessage(url, 'image');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input, 'text');
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    onTyping(true); 
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.message_type === 'image') {
      return (
        <img 
          src={msg.content} 
          alt="Sent Image" 
          className="max-w-full rounded-lg border border-gray-200 mt-1" 
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Broken+Image'; }}
        />
      );
    }
    
    if (msg.message_type === 'item_preview') {
      return (
        <div className="bg-white p-2 rounded border border-gray-200 mt-1 flex gap-2 items-center min-w-[180px]">
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl">📦</div>
            <div>
                <p className="font-bold text-xs text-gray-800">Product Preview</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{msg.content}</p>
            </div>
        </div>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) }} />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] md:bg-gray-50">
      
      {/* Header */}
      <div className="bg-white p-3 md:p-4 border-b border-gray-200 flex items-center shadow-sm justify-between sticky top-0 z-10">
        <div className="flex items-center">
            <button 
              onClick={onBack}
              className="md:hidden mr-3 -ml-1 p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              aria-label="Back to chat list"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 font-bold text-gray-600 overflow-hidden border border-gray-100">
                {room.partner_image ? <img src={room.partner_image} className="w-full h-full object-cover"/> : room.partner_name.charAt(0)}
            </div>
            <div>
            <h2 className="font-bold text-base md:text-lg text-gray-800 leading-tight">{room.partner_name}</h2>
            {isPartnerTyping ? (
                <p className="text-xs text-green-600 font-semibold animate-pulse">Typing...</p>
            ) : (
                <p className="text-xs text-gray-400 hidden md:block">Online</p>
            )}
            </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {/* Loading Skeleton */}
        {hasMore && (
          <div className="flex justify-center py-4 space-y-2 flex-col items-center opacity-60">
             <div className="w-32 h-2 bg-gray-300 rounded animate-pulse"></div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] md:max-w-[70%] p-3 rounded-2xl shadow-sm text-[15px] wrap-break-word ${
                  isMe 
                    ? 'bg-green-500 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                }`}
              >
                {renderMessageContent(msg)}
                
                <div className={`text-[10px] mt-1 text-right flex justify-end items-center gap-1 ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {isMe && <span className="font-bold">{msg.is_read ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-white border-t border-gray-200 flex gap-2 items-end">
        {/* PLACEHOLDER: Image Upload Button */}
        <button 
            type="button"
            onClick={handleImageUpload}
            className="p-3 text-gray-500 hover:text-green-600 hover:bg-gray-50 rounded-full transition-colors"
            title="Send Image"
        >
            📷
        </button>

        <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 border border-transparent focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
            <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-gray-800 placeholder-gray-500 outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            />
        </div>

        <button 
          type="submit"
          disabled={!input.trim()} 
          className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-md active:scale-95 w-12 h-12 flex items-center justify-center"
        >
          <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
}