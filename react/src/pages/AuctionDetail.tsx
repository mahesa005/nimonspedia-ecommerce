import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import AuctionTimer from '../components/auction/AuctionTimer';
import BidHistory from '../components/auction/BidHistory';
import BidForm from '../components/auction/BidForm';
import AuctionInfo from '../components/auction/AuctionInfo';
import type {
  AuctionDetailResponse,
  NewBidEvent,
  AuctionEndedEvent,
  BidErrorEvent,
  PlaceBidPayload,
} from '../types/auction';
import type { User } from '../types/user';

const socket: Socket = io('http://localhost:8080', {
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AuctionDetailResponse['data'] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const dataRef = useRef(data);
  dataRef.current = data;

  const canBid = user && data && isConnected && (data.auction.status === 'active' || data.auction.status === 'ongoing') && user.balance >= data.auction.current_price + data.auction.min_increment;

  const fetchAuctionData = useCallback(async () => {
    try {
      const res = await fetch(`/api/node/auctions/${id}`);
      const json: AuctionDetailResponse = await res.json();
      if (json.success) {
        setData(json.data);
        if (!socket.connected) socket.connect();
      } else {
        setError(json.message || 'Failed to load auction');
      }
    } catch (err) {
      console.error(err);
      setError('Network Error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuctionData();
  }, [fetchAuctionData, id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/node/me', { credentials: 'include' });
        const json = await res.json();
        if (json.success) setUser(json.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      if (dataRef.current) {
        socket.emit('join_auction', { auctionId: dataRef.current.auction.auction_id });
      }
    };

    const handleAuctionStarted = () => {
      setData(prev =>
        prev ? { ...prev, auction: { ...prev.auction, status: 'active' } } : null
      );
    };

    const handleNewBid = (event: NewBidEvent) => {
      setData(prev => {
        if (!prev) return null;
        const newBid = {
          bid_id: event.bid_id,
          auction_id: event.auction_id,
          bidder_id: event.bidder_id,
          bid_amount: event.amount.toString(),
          bid_time: new Date(event.time),
          bidder_name: event.bidder_name,
        };
        return {
          ...prev,
          auction: {
            ...prev.auction,
            current_price: event.amount,
            end_time: new Date(event.new_end_time),
            status: 'ongoing',
          },
          bids: [newBid, ...prev.bids],
        };
      });
    };

    const handleAuctionEnded = (event: AuctionEndedEvent) => {
      setData(prev =>
        prev
          ? { ...prev, auction: { ...prev.auction, status: 'ended', winner_id: event.winnerId } }
          : null
      );
      alert(`Auction Ended! Sold for Rp ${event.finalPrice.toLocaleString()}`);
    };

    const handleBidError = (err: BidErrorEvent) => {
      alert(`Error: ${err.message}`);
    };

    const handleAuctionCancelled = (event: { reason: string }) => {
      setData(prev => 
        prev ? { 
          ...prev, 
          auction: { 
            ...prev.auction, 
            status: 'cancelled', 
            cancel_reason: event.reason 
          } 
        } : null
      );
      setShowCancelModal(false);
    };

    socket.on('connect', handleConnect);
    socket.on('auction_started', handleAuctionStarted);
    socket.on('new_bid', handleNewBid);
    socket.on('auction_ended', handleAuctionEnded);
    socket.on('bid_error', handleBidError);
    socket.on('auction_cancelled', handleAuctionCancelled);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('auction_started', handleAuctionStarted);
      socket.off('new_bid', handleNewBid);
      socket.off('auction_ended', handleAuctionEnded);
      socket.off('bid_error', handleBidError);
      socket.off('auction_cancelled', handleAuctionCancelled);
    };
  }, []);

  const handlePlaceBid = (amount: number) => {
    if (!data) return;
    const payload: PlaceBidPayload = {
      auctionId: data.auction.auction_id,
      amount,
    };
    socket.emit('place_bid', payload);
  };

  const handleScheduledTimerEnd = () => {
    if (!data || !isConnected) return;
    socket.emit('start_auction', { auctionId: data.auction.auction_id });
  };

  const handleCancelAuction = async () => {
    if (!cancelReason.trim()) return alert('Please enter a reason');
    setActionLoading(true);
    try {
      const res = await fetch(`/api/node/auctions/${data?.auction.auction_id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: cancelReason }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Auction cancelled');
        fetchAuctionData();
        setShowCancelModal(false);
      } else {
        alert(json.message || 'Failed to cancel auction');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopAuction = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/node/auctions/${data?.auction.auction_id}/stop`, {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        alert('Auction stopped');
        fetchAuctionData();
        setShowStopModal(false);
      } else {
        alert(json.message || 'Failed to stop auction');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-[#666]">Loading...</div>;
  if (error) return <div className="p-10 text-center text-[#dc3545] font-bold">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:py-8 font-sans text-[#333]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-8">
        <div className="lg:col-span-7 space-y-8">
          <AuctionInfo data={data.auction} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-[#e0e0e0] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-bold text-[#333] mb-4 border-b border-[#f0f0f0] pb-2">
              Auction Status
            </h2>

            <div className="text-center mb-6">
              {data.auction.status === 'scheduled' && (
                <>
                  <AuctionTimer
                    targetDate={data.auction.start_time}
                    label="STARTS IN"
                    onEnd={handleScheduledTimerEnd}
                  />
                  <div className="mt-2 text-sm text-[#666] bg-[#f8f9fa] py-2 rounded">
                    Waiting for start time...
                  </div>
                </>
              )}

              {data.auction.status === 'active' && (
                <div className="text-xl text-[#007bff] font-bold animate-pulse bg-[#e3f2fd] py-4 rounded-lg">
                  Auction Open! Waiting for First Bid...
                </div>
              )}

              {data.auction.status === 'ongoing' && data.auction.end_time && (
                <AuctionTimer targetDate={data.auction.end_time} label="ENDS IN" onEnd={() => {}} />
              )}

              {data.auction.status === 'ended' && (
                <div className="text-2xl font-bold text-[#dc3545] bg-[#ffebee] py-4 rounded-lg">
                  END. Winner: User ID {data.auction.winner_id}
                </div>
              )}
            </div>

            <BidForm
              currentPrice={data.auction.current_price}
              minIncrement={data.auction.min_increment}
              status={data.auction.status}
              cancelReason={data.auction.cancel_reason}
              onPlaceBid={handlePlaceBid}
              userBalance={user?.balance || 0}
              isDisable={!canBid}
              isSeller={user?.role === 'SELLER'}
              onCancelAuction={() => setShowCancelModal(true)}
              onStopAuction={() => setShowStopModal(true)}
            />
          </div>

          <BidHistory bids={data.bids} userId={user?.user_id} />
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Cancel Auction</h2>
            <textarea
              className="w-full border p-2 rounded mb-4"
              placeholder="Enter reason for cancellation"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowCancelModal(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                onClick={handleCancelAuction}
                disabled={actionLoading || !cancelReason.trim()}
              >
                Cancel Auction
              </button>
            </div>
          </div>
        </div>
      )}

      {showStopModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Stop Auction</h2>
            <p className="mb-4">
              Are you sure you want to stop this auction? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowStopModal(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                onClick={handleStopAuction}
                disabled={actionLoading}
              >
                Stop Auction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
