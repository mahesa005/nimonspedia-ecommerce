import { useState } from 'react';
import type { ChatRoom } from '../../types/chat';

interface Props {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  onSearch: (query: string) => void;
  currentUserRole: 'BUYER' | 'SELLER' | 'ADMIN';
}

export default function ChatSidebar({ rooms, activeRoom, onSelectRoom, onSearch, currentUserRole }: Props) {
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col h-[calc(100vh-80px)] bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Chat</h2>
        <input
          type="text"
          placeholder={currentUserRole === 'BUYER' ? "Search Stores..." : "Search Buyers..."}
          className="w-full p-2 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-green-500 outline-none"
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations found</div>
        ) : (
          rooms.map((room) => {
            const isActive = activeRoom?.store_id === room.store_id && activeRoom?.buyer_id === room.buyer_id;
            
            return (
              <div
                key={`${room.store_id}-${room.buyer_id}`}
                onClick={() => onSelectRoom(room)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                  {room.partner_image ? (
                    <img src={room.partner_image} alt={room.partner_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                      {room.partner_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-800 truncate">{room.partner_name}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(room.last_message_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate">{room.last_message_content || 'Start chatting!'}</p>
                    {room.unread_count > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}