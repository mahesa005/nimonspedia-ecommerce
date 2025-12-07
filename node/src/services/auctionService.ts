import { AuctionDetailData, AuctionDetailResponse, BidData } from '../models/auctionModel';
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

  async placeBid(auctionId: number, userId: number, amount: number): Promise<{bid: BidData, newEndTime: Date}> {
    const auction = await AuctionRepository.findDetailById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const minBid = parseInt(auction.current_price) + parseInt(auction.min_increment);
    
    if (amount < minBid && auction.bidder_count > 0) {
      throw new Error(`Bid must be at least ${minBid}`);
    }

    return await AuctionRepository.createBid(auctionId, userId, amount);
  },
};