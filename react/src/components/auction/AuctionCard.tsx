import { Link } from 'react-router-dom';
import { useCountdown } from '../../hooks/useCountdown';

interface AuctionCardProps {
    auction: {
        auction_id: number;
        product_name: string;
        main_image_path: string;
        current_price: number | string;
        starting_price: number | string;
        start_time: string;
        end_time: string;
        status: string;
        bidder_count: number;
        store_name: string;
    };
    serverOffset?: number;
}

const AuctionCard = ({ auction, serverOffset = 0 }: AuctionCardProps) => {
    const safeDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        return new Date(dateStr.replace(' ', 'T'));
    };

    const targetTime = auction.status === 'scheduled' 
        ? safeDate(auction.start_time) 
        : safeDate(auction.end_time);
    
    const { days, hours, minutes, seconds, isExpired } = useCountdown({
        targetDate: targetTime,
        serverOffset,
        interval: 1000 
    });

    const currencyFormatter = new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    });

    const currentPriceVal = Number(auction.current_price) || 0;
    const startPriceVal = Number(auction.starting_price) || 0;
    const displayPrice = currentPriceVal > 0 ? currentPriceVal : startPriceVal;

    const isScheduled = auction.status === 'scheduled';
    const isActive = auction.status === 'active'; 
    const isOngoing = auction.status === 'ongoing';
    const isLive = isActive || isOngoing;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 duration-200 group flex flex-col h-full">
            <div className="relative aspect-square bg-gray-100">
                <img 
                    src={auction.main_image_path ? `/api/node/public/uploads/${auction.main_image_path}` : '/placeholder.png'} 
                    alt={auction.product_name} 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                />
                
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider ${
                    isLive ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                }`}>
                    {isLive ? 'LIVE' : 'UPCOMING'}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-gray-200 inline-block"></span>
                    {auction.store_name}
                </div>
                
                <h3 
                    className="font-semibold text-gray-800 line-clamp-1 mb-3 group-hover:text-[#42b549] transition-colors" 
                    title={auction.product_name}
                >
                    {auction.product_name}
                </h3>
                
                <div className="flex justify-between items-end mb-4 mt-auto">
                    <div>
                        <p className="text-[10px] uppercase text-gray-400 font-semibold">Current Bid</p>
                        <p className="font-bold text-lg text-[#42b549]">
                            {currencyFormatter.format(displayPrice)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase text-gray-400 font-semibold">
                            {isScheduled ? 'Starts In' : 'Ends In'}
                        </p>

                        {isScheduled ? (
                             <div className="flex gap-1 text-sm font-mono font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded">
                                <span>{days}d</span>:<span>{hours.toString().padStart(2, '0')}</span>:<span>{minutes.toString().padStart(2, '0')}</span>:<span>{seconds.toString().padStart(2, '0')}</span>
                             </div>
                        ) : isActive ? (
                            <div className="flex gap-1 text-sm font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded animate-pulse">
                                <span>00</span>:<span>00</span>:<span>00</span>:<span>15</span>
                            </div>
                        ) : isOngoing && !isExpired ? (
                            <div className="flex gap-1 text-sm font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                <span>{days}d</span>:<span>{hours.toString().padStart(2, '0')}</span>:<span>{minutes.toString().padStart(2, '0')}</span>:<span>{seconds.toString().padStart(2, '0')}</span>
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-gray-500">Ended</span>
                        )}
                    </div>
                </div>

                <Link 
                    to={`/auction/${auction.auction_id}`} 
                    className="block w-full text-center bg-gray-900 hover:bg-[#42b549] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    View Auction
                </Link>
            </div>
        </div>
    );
};

export default AuctionCard;