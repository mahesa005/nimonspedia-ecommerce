import { Server, Socket } from 'socket.io';
import { AuctionService } from '../services/auctionService';
import { PlaceBidPayload, NewBidEvent, AuctionEndedEvent, AuctionStartedEvent } from '../models/auctionModel';

const auctionTimers: Record<number, NodeJS.Timeout> = {};
const warningTimers: Record<number, NodeJS.Timeout> = {};

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
    console.log(`[START] Received start_auction for auctionId=${auctionId}`);

    try {
      const auction = await AuctionService.startAuction(auctionId);
      console.log(`[START] AuctionService.startAuction result:`, auction);

      if (auction) {
        const fullData = await AuctionService.getAuctionPageData(auctionId);
        
        if (fullData) {
            io.to('market').emit('market_auction_started', {
                ...fullData.auction,
                bidder_count: fullData.auction.bidder_count ?? 0
            });
        }

        // Notify specific room (Detail Page)
        const event: AuctionStartedEvent = { status: 'active', message: "Auction is now OPEN!" };
        io.to(`auction_${auctionId}`).emit('auction_started', event);
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
        const finalized = await AuctionService.finalizeAuction(auctionId);
        console.log(`[TIMER] Finalized result:`, finalized);

        if (finalized) {
          io.to(`auction_${auctionId}`).emit('auction_ended', {
            auctionId, winnerId: finalized.winner_id, finalPrice: Number(finalized.current_price)
          });
        }
        delete auctionTimers[auctionId];
        delete warningTimers[auctionId];
      }, 15000);

    } catch (e: any) {
      socket.emit('bid_error', { message: e.message });
    }
  });
};