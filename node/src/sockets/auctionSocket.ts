import { Server, Socket } from 'socket.io';
import { AuctionService } from '../services/auctionService';
import { 
  PlaceBidPayload,
  NewBidEvent,
  AuctionEndedEvent,
  AuctionStartedEvent
} from '../models/auctionModel';

const auctionTimers: Record<number, NodeJS.Timeout> = {};

export default (io: Server, socket: Socket) => {

  console.log(`[SOCKET] New client connected: ${socket.id}`);

  // JOIN ROOM
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
        const event: AuctionStartedEvent = {
          status: 'active',
          message: "Auction is now OPEN! Waiting for first bid."
        };

        console.log(`[START] Emitting 'auction_started' to room auction_${auctionId}`);
        io.to(`auction_${auctionId}`).emit('auction_started', event);
      }
    } catch (e: any) {
      console.error(`[START] Error:`, e.message);
      socket.emit('error', e.message);
    }
  });

  // PLACE BID
  socket.on('place_bid', async ({ auctionId, amount }: PlaceBidPayload) => {
    console.log(`[BID] Received place_bid auctionId=${auctionId}, amount=${amount}, from socket ${socket.id}`);

    try {
      // PLACEHOLDER
      const userId = socket.data.user?.user_id ?? 1;
      console.log(`[BID] Using userId=${userId}`);

      const result = await AuctionService.placeBid(auctionId, userId, amount);
      console.log(`[BID] AuctionService.placeBid result:`, result);

      const room = `auction_${auctionId}`;
      console.log(`[BID] Emitting to room=${room}. Current rooms:`, socket.rooms);

      const event: NewBidEvent = {
        bid_id: result.bid.bid_id,
        auction_id: auctionId,
        amount: Number(result.bid.bid_amount),
        bidder_name: result.bid.bidder_name ?? "Unknown",
        time: new Date(result.bid.bid_time).toISOString(),
        new_end_time: result.newEndTime.toISOString()
      };

      console.log(`[BID] Emitting 'new_bid':`, event);
      io.to(room).emit('new_bid', event);

      // RESET TIMER
      if (auctionTimers[auctionId]) {
        console.log(`[TIMER] Clearing previous timer for auction ${auctionId}`);
        clearTimeout(auctionTimers[auctionId]);
      }

      console.log(`[TIMER] Starting new 15-second timer for auction ${auctionId}`);
      auctionTimers[auctionId] = setTimeout(async () => {

        console.log(`[TIMER] Timer triggered, finalizing auction ${auctionId}`);
        const finalized = await AuctionService.finalizeAuction(auctionId);
        console.log(`[TIMER] Finalized result:`, finalized);

        if (finalized) {
          const endEvent: AuctionEndedEvent = {
            auctionId,
            winnerId: finalized.winner_id,
            finalPrice: Number(finalized.current_price)
          };

          console.log(`[TIMER] Emitting 'auction_ended':`, endEvent);
          io.to(room).emit('auction_ended', endEvent);
        }

        delete auctionTimers[auctionId];
      }, 15000);

    } catch (e: any) {
      console.error(`[BID_ERROR]`, e.message);
      socket.emit('bid_error', { message: e.message });
    }
  });
};
