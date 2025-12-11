import { AuctionData, AuctionDetailData, AuctionDetailResponse, BidData, PublicBid } from '../models/auctionModel';
import { AuctionRepository } from '../repositories/auctionRepository';
import { NotificationService } from './notificationService';

export const AuctionService = {
  async getAuctionPageData(auctionId: number): Promise<AuctionDetailResponse['data'] | null> {
    const auctionData = await AuctionRepository.findDetailById(auctionId);
    
    if (!auctionData) return null;

    const bids = await AuctionRepository.findBidsByAuctionId(auctionId);

    return {
      auction: auctionData,
      bids: bids
    };
  },

  async placeBid(auctionId: number, userId: number, amount: number): Promise<{bid: PublicBid, newEndTime: Date}> {
    const auction = await AuctionRepository.findDetailById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const minBid = auction.current_price + auction.min_increment;
    
    if (amount < minBid && auction.bidder_count > 0) {
      throw new Error(`Bid must be at least ${minBid}`);
    }

    const previousWinnerId = auction.winner_id;

    const result = await AuctionRepository.createBid(auctionId, userId, amount);

    if (previousWinnerId && previousWinnerId !== userId) {
      NotificationService.sendToUser(previousWinnerId, {
        title: `You've beeen outbid | Auction ${auction.auction_id}`,
        body: `Someone just outbid you at "${auction.product_name}". Current highest bid: Rp ${amount.toLocaleString()}`,
        url: `/auction/${auctionId}`,
      }, 'auction').catch(err => console.error("Outbid notification failed:", err));
    }

    return result;
  },

  async startAuction(auctionId: number): Promise<AuctionData | null> {
    const auction = await AuctionRepository.startAuction(auctionId)
    return auction
  },

  async finalizeAuction(auctionId: number): Promise<AuctionData | null> {
    const closedAuction = await AuctionRepository.closeAuction(auctionId);
    if (closedAuction && closedAuction.winner_id) {
        console.log(`Auction ${auctionId} closed. Winner: ${closedAuction.winner_id}`);

        NotificationService.sendToUser(closedAuction.winner_id, {
          title: `You've won the auction!`,
          body: `You've won the auction with the price: Rp ${Number(closedAuction.current_price).toLocaleString()}.`,
          url: `/orders`,
        }, 'auction').catch(err => console.error("Win notification failed:", err));
    }
    return closedAuction;
  },

  async cancelAuction(auctionId: number, reason: string): Promise<AuctionData | null> {
    const auction = await AuctionRepository.cancelAuction(auctionId, reason);
    if (!auction) throw new Error("Failed to cancel auction or auction not found");
    return auction;
  },

  async notifyEndingSoon(auctionId: number) {
    const auction = await AuctionRepository.findDetailById(auctionId);
    if (!auction) return;

    const bidderIds = await AuctionRepository.getUniqueBidders(auctionId);

    bidderIds.forEach(userId => {
      NotificationService.sendToUser(userId, {
        title: 'Ending Soon!',
        body: `Auction "${auction.product_name}" is going to end in 5 seconds!`,
        url: `/auction/${auctionId}`,
      }, 'auction').catch(err => console.error(`Failed to warn user ${userId}:`, err));
    });
  },
};