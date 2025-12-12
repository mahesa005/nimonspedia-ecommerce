import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AuctionTimer from '../components/auction/AuctionTimer';
import BidHistory from '../components/auction/BidHistory';
import BidForm from '../components/auction/BidForm';
import AuctionInfo from '../components/auction/AuctionInfo';
import Toast from '../components/ui/toast';
import BuyerNavbar from '../components/ui/BuyerNavbar';
import SellerNavbar from '../components/ui/SellerNavbar';
import { useNavbarData } from '../hooks/useNavbarData';
import FeatureMiddleware from '../components/common/FeatureMiddleware';
import { useAuction } from '../hooks/useAuction';

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, store, cartCount, flags, loading: navbarLoading, updateLocalBalance } = useNavbarData();
  
  const { 
    detailData: data, loading, error, serverOffset, toast, setToast, 
    placeBid, startScheduledAuction, cancelAuction, stopAuction 
  } = useAuction({ mode: 'DETAIL', user, id: id || '' });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isLive = data && (data.auction.status === 'active' || data.auction.status === 'ongoing');
  const minRequired = data ? data.auction.current_price + data.auction.min_increment : 0;
  const sufficientBalance = user ? user.balance >= minRequired : false;
  const canBid = user && isLive && sufficientBalance;

  const hasBids = data && data.bids.length > 0;

  const onCancelSubmit = async () => {
    if (!cancelReason.trim()) return;
    setActionLoading(true);
    try {
      await cancelAuction(cancelReason);
      setShowCancelModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setToast({ msg: e.message, type: 'error' });
      } else {
        setToast({ msg: 'An unknown error occurred', type: 'error' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const onStopSubmit = async () => {
    setActionLoading(true);
    try {
      await stopAuction();
      setShowStopModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setToast({ msg: e.message, type: 'error' });
      } else {
        setToast({ msg: 'An unknown error occurred', type: 'error' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const AuctionSkeleton = (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-8">
      <div className="max-w-[1200px] mx-auto animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-lg shadow h-[600px]">
           <div className="lg:col-span-7 bg-gray-200 rounded"></div>
           <div className="lg:col-span-5 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (navbarLoading || loading) return AuctionSkeleton;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
  if (!data || !user) return null;

  return (
    <FeatureMiddleware flag="auction_enabled" skeleton={AuctionSkeleton}>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#333]">
        {user.role === 'SELLER' ? 
            <SellerNavbar storeBalance={store?.balance || 0} flags={flags} /> : 
            <BuyerNavbar userBalance={user.balance} cartItemCount={cartCount} onBalanceUpdate={updateLocalBalance} flags={flags} />
        }

        <main className="flex-1 pt-24 px-4 pb-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-lg shadow-sm mb-8">
              <div className="lg:col-span-7 space-y-8">
                <AuctionInfo data={data.auction} />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-bold text-[#333] mb-4 border-b pb-2">Status Lelang</h2>

                  <div className="text-center mb-6">
                    {data.auction.status === 'scheduled' && (
                      <>
                        <AuctionTimer targetDate={data.auction.start_time} label="MULAI DALAM" onEnd={startScheduledAuction} serverOffset={serverOffset} />
                        <div className="mt-2 text-sm text-[#666] bg-gray-50 py-2 rounded">Menunggu waktu mulai...</div>
                      </>
                    )}
                    {data.auction.status === 'active' && (
                      <div className="text-xl text-blue-600 font-bold animate-pulse bg-blue-50 py-4 rounded-lg">Lelang dibuka! Menunggu Bid pertama...</div>
                    )}
                    {data.auction.status === 'ongoing' && data.auction.end_time && (
                      <AuctionTimer targetDate={data.auction.end_time} label="SELESAI DALAM" serverOffset={serverOffset} />
                    )}
                    {data.auction.status === 'ended' && (
                      <div className="text-2xl font-bold text-red-600 bg-red-50 py-4 rounded-lg">LELANG SELESAI<br/><span className="text-sm text-black">Pemenang ID: {data.auction.winner_id}</span></div>
                    )}
                    {data.auction.status === 'cancelled' && (
                      <div className="p-4 bg-red-100 text-red-800 rounded font-bold">Lelang Dibatalkan<br/><span className="text-sm font-normal">Alasan: {data.auction.cancel_reason}</span></div>
                    )}
                  </div>

                  <BidForm
                    currentPrice={data.auction.current_price}
                    minIncrement={data.auction.min_increment}
                    status={data.auction.status}
                    cancelReason={data.auction.cancel_reason}
                    onPlaceBid={placeBid}
                    userBalance={user.balance}
                    isDisable={!canBid}
                    isSeller={user.role === 'SELLER'}
                    onCancelAuction={!hasBids ? () => setShowCancelModal(true) : undefined} 
                    onStopAuction={hasBids ? () => setShowStopModal(true) : undefined}
                  />
                </div>
                <BidHistory bids={data.bids} userId={user.user_id} />
              </div>
            </div>
          </div>
        </main>

        {showCancelModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Batalkan Lelang</h2>
              <textarea className="w-full border p-2 rounded mb-4" placeholder="Alasan pembatalan..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowCancelModal(false)}>Tutup</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={onCancelSubmit} disabled={actionLoading || !cancelReason}>Batalkan</button>
              </div>
            </div>
          </div>
        )}
        {showStopModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Hentikan Lelang</h2>
              <p className="mb-4">Apakah Anda yakin ingin menghentikan lelang ini sekarang?</p>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowStopModal(false)}>Tutup</button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={onStopSubmit} disabled={actionLoading}>Hentikan</button>
              </div>
            </div>
          </div>
        )}
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </FeatureMiddleware>
  );
}