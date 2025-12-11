import { useState, useEffect, useCallback } from 'react';
import AuctionCard from '../components/auction/AuctionCard';
import { useSearchParams } from 'react-router-dom';

interface Auction {
    auction_id: number;
    product_name: string;
    main_image_path: string;
    current_bid: number;
    start_price: number;
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

export default function AuctionList() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);

    const activeTab = searchParams.get('status') || 'active';
    const searchQuery = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');

    const fetchAuctions = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                status: activeTab,
                search: searchQuery
            });

            const res = await fetch(`/api/node/auctions?${query.toString()}`);
            const data = await res.json();

            if (data.success) {
                setAuctions(data.data);
                setMeta(data.meta);
            }
        } catch (err) {
            console.error("Failed to fetch auctions", err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQuery, page]);

    useEffect(() => {
        fetchAuctions();
    }, [fetchAuctions]);

    const handleTabChange = (status: string) => {
        setSearchParams(prev => {
            prev.set('status', status);
            prev.set('page', '1');
            return prev;
        });
    };

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


    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Auction List Market</h1>
                <p className="text-gray-500">List Auction yang sedang berlangsung dan akan berlangsung.</p>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => handleTabChange('active')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Live Auctions
                    </button>
                    <button
                        onClick={() => handleTabChange('scheduled')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'scheduled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Upcoming
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search products or stores..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-[4/5] bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            ) : auctions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions.map(auction => (
                        <AuctionCard key={auction.auction_id} auction={auction} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-medium text-gray-900">No Auctions Found</h3>
                    <p className="text-gray-500 mt-2">Coba sesuaikan filter Anda atau kembali lagi nanti</p>
                </div>
            )}

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
                <div className="flex justify-center mt-12 gap-2">
                    <button
                        onClick={() => handlePageChange(meta.current_page - 1)}
                        disabled={meta.current_page <= 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <div className="flex items-center px-4 font-medium text-gray-700">
                        Page {meta.current_page} of {meta.total_pages}
                    </div>
                    <button
                        onClick={() => handlePageChange(meta.current_page + 1)}
                        disabled={meta.current_page >= meta.total_pages}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
