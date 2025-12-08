import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatRoom } from '../../types/chat';
import DOMPurify from 'dompurify';

interface Props {
  room: ChatRoom;
  messages: ChatMessage[];
  currentUserId: number;
  onSendMessage: (content: string, type?: 'text' | 'image') => void;
  isPartnerTyping: boolean;
  onTyping: (isTyping: boolean) => void;
}

export default function ChatWindow({ room, messages, currentUserId, onSendMessage, isPartnerTyping, onTyping }: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock Image Upload Placeholder
  const handleImageUpload = () => {
    const url = prompt("Enter Image URL (Simulating upload):"); 
    if (url) {
      onSendMessage(url, 'image');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

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
        <div className="bg-white p-2 rounded border border-gray-200 mt-1 flex gap-2 items-center">
            <div className="w-12 h-12 bg-gray-200 rounded">📦</div>
            <div>
                <p className="font-bold text-xs text-gray-800">Product Preview</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{msg.content}</p>
            </div>
        </div>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content) }} />;
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] bg-gray-50">
      <div className="bg-white p-4 border-b border-gray-200 flex items-center shadow-sm justify-between">
        <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 font-bold text-gray-600 overflow-hidden">
                {room.partner_image ? <img src={room.partner_image} className="w-full h-full object-cover"/> : room.partner_name.charAt(0)}
            </div>
            <div>
            <h2 className="font-bold text-lg text-gray-800">{room.partner_name}</h2>
            {isPartnerTyping && <p className="text-xs text-green-600 font-semibold animate-pulse">Typing...</p>}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${
                  isMe 
                    ? 'bg-green-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}
              >
                {renderMessageContent(msg)}
                
                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {isMe && <span className="ml-1 font-bold">{msg.is_read ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200 flex gap-2 items-center">
        {/* PLACEHOLDER */}
        <button 
            type="button"
            onClick={handleImageUpload}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
            title="Send Image"
        >
            📷
        </button>

        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
        />
        <button 
          type="submit"
          disabled={!input.trim()} 
          className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 disabled:opacity-50 transition-colors shadow-sm w-12 h-12 flex items-center justify-center"
        >
          ➤
        </button>
      </form>
    </div>
  );
}