import { AuctionData, AuctionDetailData, AuctionDetailResponse, BidData, PublicBid } from '../models/auctionModel';
import { AuctionRepository } from '../repositories/auctionRepository';
import { NotificationService } from './notificationService';
import { ProductRepository } from '../repositories/productRepository';

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

  async placeBid(auctionId: number, userId: number, amount: number): Promise<{ bid: PublicBid, newEndTime: Date, bidderCount: number }> {
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

  async startAuction(auctionId: number): Promise<{ auction: AuctionData | null, message: string }> {
    const auctionData = await AuctionRepository.findById(auctionId);

    if (!auctionData) {
      return { auction: null, message: 'AUCTION_NOT_FOUND' };
    }

    const isBusy = await AuctionRepository.hasActiveAuction(auctionData.store_id);

    if (isBusy) {
      return { auction: null, message: 'ADDED_TO_QUEUE' };
    }
    
    const auction = await AuctionRepository.startAuction(auctionId);
    return { auction, message: 'STARTED' };
  },

  async finalizeAuction(auctionId: number): Promise<{ closed: AuctionData | null, next: AuctionData | null }> {
    const closedAuction = await AuctionRepository.closeAuction(auctionId);
    if (closedAuction && closedAuction.winner_id) {
      console.log(`Auction ${auctionId} closed. Winner: ${closedAuction.winner_id}`);

        NotificationService.sendToUser(closedAuction.winner_id, {
          title: `You've won the auction!`,
          body: `You've won the auction with the price: Rp ${Number(closedAuction.current_price).toLocaleString()}.`,
          url: `/orders`,
        }, 'auction').catch(err => console.error("Win notification failed:", err));
    }

    let nextAuction = null;
    if (closedAuction) {
        const nextReady = await AuctionRepository.findNextReadyAuction();
        if (nextReady) {
            console.log(`[QUEUE] Auto-starting next auction: ${nextReady.auction_id}`);
            nextAuction = await AuctionRepository.startAuction(nextReady.auction_id);
        }
    }
    return { closed: closedAuction, next: nextAuction };
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
  async getAuctions(page: number, limit: number, search: string, status: string): Promise<any> {
    const offset = Math.max(0, (page - 1) * limit);
    const sort = (status === 'scheduled') ? 'starting_soon' : 'ending_soon';

    const auctions = await AuctionRepository.findPaginated(limit, offset, search, status, sort);
    const totalCount = await AuctionRepository.countAll(search, status);
    const totalPages = (limit > 0) ? Math.ceil(totalCount / limit) : 0;

    return {
      data: auctions,
      meta: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalCount,
        limit: limit
      }
    };
  },

  async createAuctionForProduct(params: {
    sellerId: number;
    productId: number;
    startingPrice: number;
    minIncrement: number;
    quantity: number;
    startTime: string;
    endTime: string;
  }): Promise<AuctionData> {
    const {
      sellerId,
      productId,
      startingPrice,
      minIncrement,
      quantity,
      startTime,
      endTime,
    } = params;

    const product = await ProductRepository.findByIdWithOwner(productId);
    if (!product) {
      throw new Error('Product tidak ditemukan');
    }
    if (product.owner_id !== sellerId) {
      throw new Error('Tidak memiliki akses'); 
    }
    if (quantity <= 0 || quantity > product.stock) {
      throw new Error('Jumlah tidak valid');
    }

    const existing = await AuctionRepository.findActiveAuctionByProduct(productId);
    if (existing) {
      throw new Error('Sudah ada lelang aktif untuk produk ini');
    }

    const auction = await AuctionRepository.createAuction({
      productId,
      startingPrice,
      minIncrement,
      quantity,
      startTime,
      endTime,
    });

    if (!auction) {
      throw new Error('Gagal membuat lelang');
    }

    return auction;
  },
};