import { AuctionData, AuctionDetailData, AuctionDetailResponse, BidData, PublicBid } from '../models/auctionModel';
import { AuctionRepository } from '../repositories/auctionRepository';

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

    return await AuctionRepository.createBid(auctionId, userId, amount);
  },

  async startAuction(auctionId: number): Promise<AuctionData | null> {
    const auction = await AuctionRepository.startAuction(auctionId)
    return auction
  },

  async finalizeAuction(auctionId: number): Promise<AuctionData | null> {
    const closedAuction = await AuctionRepository.closeAuction(auctionId);
    if (closedAuction && closedAuction.winner_id) {
        console.log(`Auction ${auctionId} closed. Winner: ${closedAuction.winner_id}`);
    }
    return closedAuction;
  },

  async cancelAuction(auctionId: number, reason: string): Promise<AuctionData | null> {
    const auction = await AuctionRepository.cancelAuction(auctionId, reason);
    if (!auction) throw new Error("Failed to cancel auction or auction not found");
    return auction;
  },
};