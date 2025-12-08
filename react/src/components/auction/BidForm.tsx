import { useState } from 'react';

interface Props {
  currentPrice: number;
  minIncrement: number;
  status: string;
  onPlaceBid: (amount: number) => void;
  userBalance: number
  isDisable: boolean;
  isSeller?: boolean;
  onCancelAuction?: () => void;
  onStopAuction?: () => void;
}

export default function BidForm({ currentPrice, minIncrement, status, onPlaceBid, userBalance, isDisable, isSeller, onCancelAuction, onStopAuction }: Props) {
  const minBid = currentPrice + minIncrement;
  
  const [amount, setAmount] = useState(minBid);
  
  const [prevPrice, setPrevPrice] = useState(currentPrice);

  if (currentPrice !== prevPrice) {
    setPrevPrice(currentPrice);
    setAmount(minBid);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceBid(amount);
  };

  if (status === 'ended') {
    return <div className="p-3 bg-[#f8d7da] text-[#721c24] text-center font-bold rounded-lg border border-[#f5c6cb]">Auction Ended</div>;
  }
  
  if (isSeller) {
    return (
      <div className="flex flex-col gap-3">
        {status === 'active' && (
          <button
            onClick={onCancelAuction}
            className="w-full py-3 px-4 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Cancel Auction
          </button>
        )}
        {status === 'ongoing' && (
          <button
            onClick={onStopAuction}
            className="w-full py-3 px-4 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Stop Auction
          </button>
        )}
      </div>
    );
  }

  if (status === 'scheduled') {
    return <div className="p-3 bg-[#fff3cd] text-[#856404] text-center font-bold rounded-lg border border-[#ffeeba]">Starting Soon</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#666] uppercase tracking-wide">Current Highest Bid</p>
        <p className="text-[2rem] font-extrabold text-[#42b549]">
            Rp {currentPrice.toLocaleString()}
        </p>
      </div>

      <div>
        <p className="text-sm font-extrabold">
            Your Balance: Rp {userBalance}
        </p>
        <label className="block text-sm font-bold text-[#333] mb-2">
            Your Bid (Min: Rp {minBid.toLocaleString()})
        </label>
        
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 p-3 border border-[#ccc] rounded-lg font-bold text-[#333] focus:outline-none focus:border-[#42b549] focus:ring-2 focus:ring-[#42b549] focus:ring-opacity-20 transition-all"
            min={minBid}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisable}
        className="w-full py-3 px-4 text-[1rem] font-bold text-white bg-[#42b549] rounded-lg hover:bg-[#369043] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-colors shadow-sm active:translate-y-px"
      >
        Place Bid
      </button>
      
      <p className="text-xs text-center text-[#999] mt-2">
        Placing a bid extends the timer by 15 seconds.
      </p>
    </form>
  );
}