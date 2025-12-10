import { useState, useEffect } from 'react';
import type { ChatRoom } from '../../types/chat';

interface Props {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  onSearch: (query: string) => void;
  currentUserRole: 'BUYER' | 'SELLER' | 'ADMIN';
  currentUserId: number;
  onEnableNotifications?: () => void;
}

interface StoreResult {
  store_id: number;
  store_name: string;
  store_image: string | null;
}

export default function ChatSidebar({rooms, activeRoom, onSelectRoom, onSearch, currentUserRole, currentUserId}: Props) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [availableStores, setAvailableStores] = useState<StoreResult[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value);
  };

  const fetchStores = async (query = '') => {
    setIsLoadingStores(true);

    try {
      const res = await fetch(`http://localhost:8080/api/stores?search=${query}`, {
        credentials: 'include'
      });

      const json = await res.json();
      if (json.success) setAvailableStores(json.data ?? []);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setIsLoadingStores(false);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const timeout = setTimeout(() => fetchStores(storeSearch), 500);
    return () => clearTimeout(timeout);
  }, [storeSearch, isModalOpen]);

  const selectNewStore = (store: StoreResult) => {
    const temporaryRoom: ChatRoom = {
      store_id: store.store_id,
      buyer_id: currentUserId,
      partner_name: store.store_name,
      partner_image: store.store_image,
      last_message_at: new Date(),
      last_message_content: '',
      unread_count: 0
    };

    onSelectRoom(temporaryRoom);
    setIsModalOpen(false);
    setStoreSearch('');
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>

          <div className="flex gap-2">
            {currentUserRole === 'BUYER' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors"
                title="Start a New Chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder={currentUserRole === 'BUYER' ? 'Search conversations...' : 'Search buyers...'}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm border-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
            value={search}
            onChange={handleSearchChange}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        {rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
        ) : (
          rooms.map((room) => {
            const isActive =
              activeRoom?.store_id === room.store_id &&
              activeRoom?.buyer_id === room.buyer_id;

            return (
              <div
                key={`${room.store_id}-${room.buyer_id}`}
                onClick={() => onSelectRoom(room)}
                className={`p-4 flex gap-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-green-50/50' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 overflow-hidden border border-gray-100">
                  {room.partner_image ? (
                    <img src={room.partner_image} alt={room.partner_name} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg bg-gray-100">
                      {room.partner_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{room.partner_name}</h3>
                    <span className="text-xs text-gray-400 shrink-0 ml-2"> {new Date(room.last_message_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
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

      {/* Store List Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm h-[80%] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">New Conversation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search for a store..."
                autoFocus
                className="w-full pl-4 pr-4 py-2 bg-gray-100 rounded-lg text-sm border-none focus:ring-1 focus:ring-green-500 outline-none"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingStores ? (
                <div className="text-center py-8 text-gray-400">Loading stores...</div>
              ) : availableStores.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No stores found</div>
              ) : (
                availableStores.map((store) => (
                  <div
                    key={store.store_id}
                    onClick={() => selectNewStore(store)}
                    className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                      {store.store_image ? (
                        <img src={store.store_image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-200">
                          {store.store_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <span className="font-medium text-gray-800 truncate">
                      {store.store_name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}