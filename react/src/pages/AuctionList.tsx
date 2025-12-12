import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuctionCard from '../components/auction/AuctionCard';
import BuyerNavbar from '../components/ui/BuyerNavbar';
import SellerNavbar from '../components/ui/SellerNavbar';
import { useNavbarData } from '../hooks/useNavbarData';
import FeatureMiddleware from '../components/common/FeatureMiddleware';
import { useAuction } from '../hooks/useAuction';

export default function AuctionList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, store, cartCount, flags, loading: navbarLoading, updateLocalBalance } = useNavbarData();

    const activeTab = searchParams.get('status') || 'active';
    const searchQuery = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');

    const { listData, meta, loading, serverOffset } = useAuction({
        mode: 'LIST',
        user,
        query: { page, status: activeTab, search: searchQuery }
    });

    const [localSearch, setLocalSearch] = useState(searchQuery);
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localSearch !== searchQuery) {
                setSearchParams(prev => {
                    if (localSearch) prev.set('q', localSearch);
                    else prev.delete('q');
                    prev.set('page', '1');
                    return prev;
                });
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [localSearch, setSearchParams, searchQuery]);

    const handleTabChange = (status: string) => {
        setSearchParams({ status, page: '1', ...(searchQuery ? { q: searchQuery } : {}) });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    const PageSkeleton = (
        <div className="pt-24 px-4 max-w-[1400px] mx-auto animate-pulse">
            <div className="h-10 bg-gray-200 w-1/3 mb-4 rounded"></div>
            <div className="h-16 bg-gray-200 w-full mb-8 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <div key={i} className="aspect-4/5 bg-gray-200 rounded-xl"></div>)}
            </div>
        </div>
    );

    if (!user) {
        return <div className="p-8 text-center text-gray-500 font-medium text-lg pt-32">Please login to access the Auction Market.</div>;
    }

    return (
        <FeatureMiddleware flag="auction_enabled" skeleton={PageSkeleton}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {user && (
                    user.role === 'SELLER' ? 
                        <SellerNavbar storeBalance={store?.balance || 0} flags={flags} /> :
                        <BuyerNavbar userBalance={user.balance} cartItemCount={cartCount} onBalanceUpdate={updateLocalBalance} flags={flags} />
                )}

                <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 pt-24 pb-12">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Auction List Market</h1>
                        <p className="text-gray-500">Temukan barang impianmu di lelang real-time.</p>
                    </header>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => handleTabChange('active')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Lelang Aktif</button>
                            <button onClick={() => handleTabChange('scheduled')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'scheduled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Akan Datang</button>
                        </div>
                        <div className="relative w-full md:w-96">
                            <input type="text" placeholder="Cari nama produk atau toko..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42b549]" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>
                    </div>

                    {loading || navbarLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-4/5 bg-gray-200 rounded-xl"></div>)}
                        </div>
                    ) : listData.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {listData.map(auction => (
                                <AuctionCard key={auction.auction_id} auction={auction} serverOffset={serverOffset} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <h3 className="text-xl font-medium text-gray-900">Tidak ada lelang ditemukan</h3>
                        </div>
                    )}

                    {meta && meta.total_pages > 1 && (
                        <div className="flex justify-center mt-12 gap-2">
                            <button onClick={() => handlePageChange(meta.current_page - 1)} disabled={meta.current_page <= 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Prev</button>
                            <span className="flex items-center px-4">Page {meta.current_page} of {meta.total_pages}</span>
                            <button onClick={() => handlePageChange(meta.current_page + 1)} disabled={meta.current_page >= meta.total_pages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
                        </div>
                    )}
                </main>
            </div>
        </FeatureMiddleware>
    );
}