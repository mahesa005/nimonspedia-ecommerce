import { useState } from "react";
import type { PublicBid } from "../../types/auction";

interface Props {
  bids: PublicBid[];
  userId?: number;
}

export default function BidHistory({ bids, userId }: Props) {
  const [showAll, setShowAll] = useState(false);

  const displayedBids = showAll ? bids : bids.slice(0, 10);

  return (
    <div className="bg-white border border-[#e0e0e0] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[400px]">
      <div className="bg-[#f8f9fa] px-4 py-3 border-b border-[#e0e0e0] flex justify-between items-center">
        <h3 className="font-bold text-[#333]">Live Bids</h3>
        <span className="text-xs bg-[#e9ecef] px-2 py-1 rounded text-[#666] font-semibold">{bids.length} Bids</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-300">
        {bids.length === 0 ? (
          <div className="p-8 text-center text-[#999] flex flex-col items-center justify-center h-full">
             <span className="text-2xl mb-2">🏷️</span>
             <p>No bids yet. Be the first!</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-[#f0f0f0]">
              {displayedBids.map((bid) => {
                const isMine = bid.bidder_id === userId;
                return (
                  <li 
                    key={bid.bid_id} 
                    className={`flex justify-between items-center px-4 py-3 transition-colors ${
                      isMine ? 'bg-[#e8f5e9]' : 'hover:bg-[#fafafa]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-[#333] flex items-center gap-2">
                        {bid.bidder_name}
                        {isMine && (
                          <span className="text-[10px] bg-[#42b549] text-white px-1.5 py-0.5 rounded font-bold uppercase">You</span>
                        )}
                      </p>
                      <p className="text-xs text-[#999] mt-0.5">
                        {new Date(bid.bid_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className={`font-mono font-bold ${isMine ? 'text-[#42b549]' : 'text-[#555]'}`}>
                      Rp {parseInt(bid.bid_amount).toLocaleString()}
                    </div>
                  </li>
                );
              })}
            </ul>

            {bids.length > 10 && (
              <div className="text-center mt-2 mb-4">
                <button
                  className={`w-2/3 py-3 px-4 text-[1rem] font-bold text-white bg-[#42b549] rounded-lg hover:bg-[#369043] shadow-sm`}
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
