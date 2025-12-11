import { useCountdown } from '../../hooks/useCountdown';

interface AuctionCardProps {
    auction: {
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
    };
}

const AuctionCard = ({ auction }: AuctionCardProps) => {
    const targetTime = auction.status === 'scheduled' ? auction.start_time : auction.end_time;
    const { days, hours, minutes, seconds, isExpired } = useCountdown(targetTime);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative aspect-square">
                <img
                    src={auction.main_image_path ? `/api/node/public/uploads/${auction.main_image_path}` : '/placeholder.png'}
                    alt={auction.product_name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white uppercase"
                    style={{ backgroundColor: auction.status === 'active' || auction.status === 'ongoing' ? '#ef4444' : '#f59e0b' }}>
                    {auction.status === 'active' || auction.status === 'ongoing' ? 'LIVE' : 'UPCOMING'}
                </div>
            </div>

            <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{auction.store_name}</div>
                <h3 className="font-semibold text-gray-800 line-clamp-1 mb-2" title={auction.product_name}>
                    {auction.product_name}
                </h3>

                <div className="flex justify-between items-end mb-3">
                    <div>
                        <p className="text-xs text-gray-500">Penawaran Saat Ini</p>
                        <p className="font-bold text-green-600">
                            {formatCurrency(auction.current_bid > 0 ? auction.current_bid : auction.start_price)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">{auction.status === 'scheduled' ? 'Mulai Dalam' : 'Berakhir Dalam'}</p>
                        {isExpired ? (
                            <span className="text-sm font-bold text-gray-400">Berakhir</span>
                        ) : (
                            <div className="flex gap-1 text-sm font-mono font-bold text-gray-700">
                                <span>{days}d</span>:<span>{hours.toString().padStart(2, '0')}</span>:
                                <span>{minutes.toString().padStart(2, '0')}</span>:
                                <span>{seconds.toString().padStart(2, '0')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <a href={`/auction/${auction.auction_id}`}
                    className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                    View Auction
                </a>
            </div>
        </div>
    );
};

export default AuctionCard;
