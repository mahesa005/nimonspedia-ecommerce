import { Server, Socket } from 'socket.io';
import { AuctionService } from '../services/auctionService';
import { PlaceBidPayload, NewBidEvent, AuctionEndedEvent, AuctionStartedEvent } from '../models/auctionModel';

const auctionTimers: Record<number, NodeJS.Timeout> = {};
const warningTimers: Record<number, NodeJS.Timeout> = {};

const broadcastAuctionStart = async (io: Server, auction: any) => {
    if (!auction) return;
    
    const fullData = await AuctionService.getAuctionPageData(auction.auction_id);
    if (fullData) {
        io.to('market').emit('market_auction_started', {
            ...fullData.auction,
            bidder_count: fullData.auction.bidder_count ?? 0
        });
    }

    const event: AuctionStartedEvent = { status: 'active', message: "Auction is now OPEN!" };
    io.to(`auction_${auction.auction_id}`).emit('auction_started', event);
};

export default (io: Server, socket: Socket) => {

  console.log(`[SOCKET] New client connected: ${socket.id}`);

  socket.join('market');

  socket.on('join_auction', ({ auctionId }: { auctionId: number }) => {
    console.log(`[JOIN] socket ${socket.id} joining auction_${auctionId}`);
    socket.join(`auction_${auctionId}`);
    console.log(`[JOIN] Rooms for ${socket.id}:`, socket.rooms);
  });

  // START AUCTION
  socket.on('start_auction', async ({ auctionId }: { auctionId: number }) => {
    console.log(`[START] Request start_auction for auctionId=${auctionId}`);

    try {
      const result = await AuctionService.startAuction(auctionId);

      if (result.message === 'ADDED_TO_QUEUE') {
        socket.emit('error', 'Auction queued. Another auction is currently active.');
        return;
      }

      if (result.auction) {
        console.log(`[START] Auction started manually: ${auctionId}`);
        await broadcastAuctionStart(io, result.auction);
      }
    } catch (e: any) { 
        console.error(e.message);
        socket.emit('error', e.message);
    }
  });

  socket.on('place_bid', async ({ auctionId, amount }: PlaceBidPayload) => {
    try {
      const user = socket.data.user;
      if (!user || !user.user_id) throw new Error("Unauthorized");

      const result = await AuctionService.placeBid(auctionId, user.user_id, amount);

      const event: NewBidEvent = {
        bid_id: result.bid.bid_id,
        bidder_id: result.bid.bidder_id,
        auction_id: auctionId,
        amount: Number(result.bid.bid_amount),
        bidder_name: result.bid.bidder_name ?? "Unknown",
        time: new Date(result.bid.bid_time).toISOString(),
        new_end_time: result.newEndTime.toISOString(),
        bidder_count: result.bidderCount
      };

      io.to(`auction_${auctionId}`).emit('new_bid', event);

      if (auctionTimers[auctionId]) clearTimeout(auctionTimers[auctionId]);
      if (warningTimers[auctionId]) clearTimeout(warningTimers[auctionId]);

      warningTimers[auctionId] = setTimeout(() => AuctionService.notifyEndingSoon(auctionId), 10000);
      
      auctionTimers[auctionId] = setTimeout(async () => {
        if (warningTimers[auctionId]) clearTimeout(warningTimers[auctionId]);
        console.log(`[TIMER] Timer triggered, finalizing auction ${auctionId}`);
        
        const { closed, next } = await AuctionService.finalizeAuction(auctionId);
        
        if (closed) {
          io.to(`auction_${auctionId}`).emit('auction_ended', {
            auctionId, 
            winnerId: closed.winner_id, 
            finalPrice: Number(closed.current_price)
          });
        }
        
        if (next) {
            console.log(`[TIMER] Next auction auto-started: ${next.auction_id}`);
            await broadcastAuctionStart(io, next);
        }

        delete auctionTimers[auctionId];
        delete warningTimers[auctionId];
      }, 15000);

    } catch (e: any) {
      socket.emit('bid_error', { message: e.message });
    }
  });
};