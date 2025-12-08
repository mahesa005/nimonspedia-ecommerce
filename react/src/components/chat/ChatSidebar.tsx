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
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 shrink-0">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder={currentUserRole === 'BUYER' ? "Search Stores..." : "Search Buyers..."}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm border-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
            value={search}
            onChange={handleSearch}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        {rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
        ) : (
          rooms.map((room) => {
            const isActive = activeRoom?.store_id === room.store_id && activeRoom?.buyer_id === room.buyer_id;
            
            return (
              <div
                key={`${room.store_id}-${room.buyer_id}`}
                onClick={() => onSelectRoom(room)}
                className={`p-4 flex gap-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-green-50/50' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 overflow-hidden relative border border-gray-100">
                  {room.partner_image ? (
                    <img src={room.partner_image} alt={room.partner_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg bg-gray-100">
                      {room.partner_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{room.partner_name}</h3>
                    <span className="text-[10px] md:text-xs text-gray-400 shrink-0 ml-2">
                      {new Date(room.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate ${room.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      {room.last_message_content || 'Start chatting!'}
                    </p>
                    {room.unread_count > 0 && (
                      <span className="ml-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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