import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  AuctionDetailResponse,
  NewBidEvent,
  AuctionEndedEvent,
  BidErrorEvent,
} from '../types/auction';
import type { User } from '../types/user';

const socket: Socket = io('http://localhost:8080', {
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});

export interface AuctionListItem {
    auction_id: number;
    product_name: string;
    main_image_path: string;
    current_price: number;
    starting_price: number;
    start_time: string;
    end_time: string;
    status: string;
    bidder_count: number;
    store_name: string;
}

interface PaginationMeta {
    current_page: number;
    total_pages: number;
    total_items: number;
}

type UseAuctionProps = 
  | { mode: 'LIST'; user: User | null; query: { page: number; status: string; search: string } }
  | { mode: 'DETAIL'; user: User | null; id: string };

export const useAuction = (props: UseAuctionProps) => {
  const [listData, setListData] = useState<AuctionListItem[]>([]);
  const [detailData, setDetailData] = useState<AuctionDetailResponse['data'] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverOffset, setServerOffset] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const detailRef = useRef(detailData);
  detailRef.current = detailData;
  const joinedRoomsRef = useRef<Set<number>>(new Set());

  // SOCKET CONNECTION
  useEffect(() => {
    if (props.user && !socket.connected) {
      socket.connect();
    }
  }, [props.user]);

  // FETCH DATA
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError('');

    try {
      let url = '';
      if (props.mode === 'LIST') {
        const q = new URLSearchParams({
          page: props.query.page.toString(),
          limit: '12',
          status: props.query.status,
          search: props.query.search
        });
        url = `/api/node/auctions?${q.toString()}`;
      } else {
        if (!props.id) return;
        url = `/api/node/auctions/${props.id}`;
      }

      const res = await fetch(url);
      
      // SYNC SERVER TIME
      const serverDateStr = res.headers.get('Date');
      if (serverDateStr) {
        const offset = new Date(serverDateStr).getTime() - Date.now();
        setServerOffset(offset);
      }

      const json = await res.json();

      if (json.success) {
        if (props.mode === 'LIST') {
          const cleanedList = json.data.map((item: any) => ({
            ...item,
            current_price: Number(item.current_price),
            starting_price: Number(item.starting_price),
            bidder_count: Number(item.bidder_count)
          }));
          setListData(cleanedList);
          setMeta(json.meta);
        } else {
          const cleanedDetail = {
              ...json.data,
              auction: {
                  ...json.data.auction,
                  current_price: Number(json.data.auction.current_price),
                  starting_price: Number(json.data.auction.starting_price),
                  min_increment: Number(json.data.auction.min_increment)
              }
          };
          setDetailData(cleanedDetail);
        }
      } else {
        if (!isBackground) setError(json.message || 'Failed to load data');
      }
    } catch (err) {
      console.error(err);
      if (!isBackground) setError('Network Error');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [props.mode === 'LIST' ? JSON.stringify(props.query) : props.id, props.mode]);

  // AUTO SYNC
  useEffect(() => {
    fetchData();
    const intervalTime = props.mode === 'LIST' ? 10000 : 5000;
    const interval = setInterval(() => fetchData(true), intervalTime);
    return () => clearInterval(interval);
  }, [fetchData, props.mode]);

  useEffect(() => {
    if (props.mode === 'LIST' && listData.length > 0 && socket.connected) {
      listData.forEach(auction => {
        if (!joinedRoomsRef.current.has(auction.auction_id)) {
          socket.emit('join_auction', { auctionId: auction.auction_id });
          joinedRoomsRef.current.add(auction.auction_id);
        }
      });
    }
  }, [props.mode, listData]);

  useEffect(() => {
    if (props.mode !== 'LIST') return;

    const handleListBid = (event: NewBidEvent) => {
        setListData(prev => prev.map(item => {
            if (item.auction_id === event.auction_id) {
                return {
                    ...item,
                    current_price: event.amount,
                    bidder_count: event.bidder_count ?? (item.bidder_count),
                    end_time: event.new_end_time,
                    status: 'ongoing'
                };
            }
            return item;
        }));
    };

    const handleStarted = (e: { auctionId: number }) => {
        setListData(prev => prev.map(item => 
            item.auction_id === e.auctionId ? { ...item, status: 'active' } : item
        ));
    };

    const handleEnded = (e: AuctionEndedEvent) => {
        setListData(prev => prev.map(item => 
            item.auction_id === e.auctionId ? { ...item, status: 'ended' } : item
        ));
    };

    socket.on('new_bid', handleListBid);
    socket.on('auction_started', handleStarted);
    socket.on('auction_ended', handleEnded);

    return () => {
        socket.off('new_bid', handleListBid);
        socket.off('auction_started', handleStarted);
        socket.off('auction_ended', handleEnded);
    };
  }, [props.mode]);

  useEffect(() => {
    if (props.mode !== 'DETAIL') return;

    const joinRoom = () => {
        if (detailRef.current) socket.emit('join_auction', { auctionId: detailRef.current.auction.auction_id });
    };

    if(socket.connected && detailData) joinRoom();
    socket.on('connect', joinRoom);

    const handleDetailBid = (event: NewBidEvent) => {
         if (detailRef.current?.auction.auction_id !== event.auction_id) return;

         setDetailData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                auction: {
                    ...prev.auction,
                    current_price: event.amount,
                    end_time: new Date(event.new_end_time),
                    status: 'ongoing',
                },
                bids: [{
                    bid_id: event.bid_id,
                    auction_id: event.auction_id,
                    bidder_id: event.bidder_id,
                    bid_amount: event.amount.toString(),
                    bid_time: new Date(event.time),
                    bidder_name: event.bidder_name,
                }, ...prev.bids]
            };
         });
    };

    const handleEnded = (event: AuctionEndedEvent) => {
        if (detailRef.current?.auction.auction_id !== event.auctionId) return;
        setDetailData(prev => prev ? { ...prev, auction: { ...prev.auction, status: 'ended', winner_id: event.winnerId } } : null);
        setToast({ msg: `Lelang Berakhir! Terjual Rp ${event.finalPrice.toLocaleString()}`, type: 'success' });
    };
    
    const handleStarted = () => setDetailData(p => p ? {...p, auction: {...p.auction, status: 'active'}} : null);
    const handleCancelled = (e: { reason: string }) => setDetailData(p => p ? {...p, auction: {...p.auction, status: 'cancelled', cancel_reason: e.reason}} : null);
    const handleError = (e: BidErrorEvent) => setToast({ msg: e.message, type: 'error' });

    socket.on('new_bid', handleDetailBid);
    socket.on('auction_ended', handleEnded);
    socket.on('auction_started', handleStarted);
    socket.on('auction_cancelled', handleCancelled);
    socket.on('bid_error', handleError);

    return () => {
        socket.off('connect', joinRoom);
        socket.off('new_bid', handleDetailBid);
        socket.off('auction_ended', handleEnded);
        socket.off('auction_started', handleStarted);
        socket.off('auction_cancelled', handleCancelled);
        socket.off('bid_error', handleError);
    };
  }, [props.mode, props.mode === 'DETAIL' ? props.id : null]);

  const actions = {
    placeBid: (amount: number) => {
        if (detailData) socket.emit('place_bid', { auctionId: detailData.auction.auction_id, amount });
    },
    startScheduledAuction: () => {
        if (detailData) socket.emit('start_auction', { auctionId: detailData.auction.auction_id });
    },
    cancelAuction: async (reason: string) => {
        if (!detailData) return;
        const res = await fetch(`/api/node/auctions/${detailData.auction.auction_id}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        const json = await res.json();
        if (json.success) {
            setToast({ msg: 'Auction cancelled', type: 'success' });
            fetchData();
        } else throw new Error(json.message);
    },
    stopAuction: async () => {
        if (!detailData) return;
        const res = await fetch(`/api/node/auctions/${detailData.auction.auction_id}/stop`, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
            setToast({ msg: 'Auction stopped', type: 'success' });
            fetchData();
        } else throw new Error(json.message);
    }
  };

  return { listData, detailData, meta, loading, error, serverOffset, toast, setToast, refresh: fetchData, ...actions };
};